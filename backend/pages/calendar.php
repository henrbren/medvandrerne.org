<?php
/**
 * Calendar Page - Shows synced Google Calendar events
 */

// Clear all caches to ensure fresh data
clearstatcache(true);
if (function_exists('opcache_reset')) {
    @opcache_reset();
}

$configFile = DATA_DIR . 'calendar_config.json';
$cacheFile = DATA_DIR . 'calendar_cache.json';

// Debug: Check if file exists and log content
$calendarConfig = ['enabled' => false, 'googleCalendarUrl' => ''];
if (file_exists($configFile)) {
    $rawContent = file_get_contents($configFile);
    $calendarConfig = json_decode($rawContent, true) ?: $calendarConfig;
} else {
    error_log('Calendar config file not found: ' . $configFile);
}

$calendarCache = readJsonFile($cacheFile, []);
$lastSync = file_exists($cacheFile) ? filemtime($cacheFile) : null;

// Consider calendar configured if URL is set (regardless of 'enabled' flag for backwards compatibility)
$isConfigured = !empty($calendarConfig['googleCalendarUrl']);

// Debug output (remove in production)
error_log('Calendar config: ' . json_encode($calendarConfig));
error_log('Is configured: ' . ($isConfigured ? 'yes' : 'no'));
?>

<div class="admin-page">
    <?php if (!$isConfigured): ?>
    <!-- Not configured -->
    <div class="empty-state">
        <div class="empty-state-icon">
            <i class="fas fa-calendar-times"></i>
        </div>
        <h3>Google Calendar ikke konfigurert</h3>
        <p>Du må først sette opp Google Calendar-synkronisering for å se hendelser her.</p>
        <a href="?page=calendar-config" class="btn btn-primary">
            <i class="fas fa-cog"></i> Konfigurer Google Calendar
        </a>
        
        <!-- Debug info -->
        <div class="info-box" style="margin-top: var(--space-6); text-align: left; font-size: 0.75rem;">
            <p><strong>Debug:</strong></p>
            <p>Config file: <?= $configFile ?></p>
            <p>File exists: <?= file_exists($configFile) ? 'Ja' : 'Nei' ?></p>
            <p>Enabled: <?= $calendarConfig['enabled'] ? 'Ja' : 'Nei' ?></p>
            <p>URL: <?= !empty($calendarConfig['googleCalendarUrl']) ? 'Satt (' . strlen($calendarConfig['googleCalendarUrl']) . ' tegn)' : 'Ikke satt' ?></p>
        </div>
    </div>
    
    <?php else: ?>
    <!-- Calendar Status -->
    <div class="calendar-status">
        <div class="status-info">
            <span class="status-badge status-active">
                <i class="fas fa-check-circle"></i> Synkronisert
            </span>
            <?php if ($lastSync): ?>
            <span class="last-sync">
                Sist oppdatert: <?= date('d.m.Y H:i', $lastSync) ?>
            </span>
            <?php endif; ?>
        </div>
        <button class="btn btn-secondary" onclick="refreshCalendar()">
            <i class="fas fa-sync"></i> Oppdater nå
        </button>
    </div>

    <!-- Events List -->
    <?php if (empty($calendarCache)): ?>
    <div class="empty-state">
        <div class="empty-state-icon">
            <i class="fas fa-calendar-check"></i>
        </div>
        <h3>Ingen kommende hendelser</h3>
        <p>Det er ingen hendelser i Google-kalenderen akkurat nå.</p>
    </div>
    
    <?php else: ?>
    <div class="events-list">
        <?php 
        // Sort by date
        usort($calendarCache, function($a, $b) {
            return strtotime($a['date'] ?? '1970-01-01') - strtotime($b['date'] ?? '1970-01-01');
        });
        
        // Group by month
        $currentMonth = '';
        foreach ($calendarCache as $event): 
            $eventDate = strtotime($event['date'] ?? 'now');
            $month = date('F Y', $eventDate);
            
            if ($month !== $currentMonth):
                $currentMonth = $month;
        ?>
        <div class="month-header">
            <?= strftime('%B %Y', $eventDate) ?>
        </div>
        <?php endif; ?>
        
        <div class="event-card <?= $eventDate < time() ? 'past' : '' ?>">
            <div class="event-date">
                <span class="day"><?= date('d', $eventDate) ?></span>
                <span class="weekday"><?= strftime('%a', $eventDate) ?></span>
            </div>
            <div class="event-details">
                <h4><?= htmlspecialchars($event['title'] ?? 'Uten tittel') ?></h4>
                <?php if (!empty($event['time'])): ?>
                <span class="event-time">
                    <i class="fas fa-clock"></i> <?= htmlspecialchars($event['time']) ?>
                </span>
                <?php endif; ?>
                <?php if (!empty($event['location'])): ?>
                <span class="event-location">
                    <i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($event['location']) ?>
                </span>
                <?php endif; ?>
                <?php if (!empty($event['description'])): ?>
                <p class="event-description"><?= nl2br(htmlspecialchars(substr($event['description'], 0, 200))) ?><?= strlen($event['description']) > 200 ? '...' : '' ?></p>
                <?php endif; ?>
            </div>
            <?php if (!empty($event['type'])): ?>
            <span class="badge"><?= htmlspecialchars($event['type']) ?></span>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
    
    <!-- Info -->
    <div class="info-box" style="margin-top: var(--space-6);">
        <p><i class="fas fa-info-circle"></i> Disse hendelsene hentes automatisk fra Google Calendar. 
        For å legge til eller endre hendelser, bruk Google Calendar direkte.</p>
        <p style="margin-top: var(--space-2);">
            <a href="?page=calendar-config">Endre kalender-innstillinger →</a>
        </p>
    </div>
    <?php endif; ?>
</div>

<style>
.calendar-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-5);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-5);
}

.status-info {
    display: flex;
    align-items: center;
    gap: var(--space-4);
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    font-size: 0.8125rem;
    font-weight: 600;
}

.status-active {
    background: rgba(0, 200, 83, 0.15);
    color: #00A854;
}

.last-sync {
    color: var(--text-muted);
    font-size: 0.8125rem;
}

.month-header {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--space-4) 0 var(--space-2);
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: var(--space-3);
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.event-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    transition: all var(--duration-fast);
}

.event-card:hover {
    border-color: var(--brand);
    box-shadow: var(--shadow-md);
}

.event-card.past {
    opacity: 0.6;
}

.event-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    padding: var(--space-2);
    background: var(--brand);
    color: white;
    border-radius: var(--radius-md);
    text-align: center;
}

.event-date .day {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
}

.event-date .weekday {
    font-size: 0.6875rem;
    text-transform: uppercase;
    opacity: 0.9;
}

.event-details {
    flex: 1;
}

.event-details h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.event-time,
.event-location {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin-right: var(--space-4);
}

.event-description {
    margin-top: var(--space-2);
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.5;
}

.empty-state {
    text-align: center;
    padding: var(--space-16) var(--space-8);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
}

.empty-state-icon {
    font-size: 3rem;
    color: var(--text-muted);
    margin-bottom: var(--space-4);
}

.empty-state h3 {
    font-size: 1.125rem;
    margin-bottom: var(--space-2);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: var(--space-5);
}
</style>

<script>
async function refreshCalendar() {
    const btn = event.target.closest('button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Oppdaterer...';
    
    try {
        // Clear cache first
        await fetch('api/clear-calendar-cache.php', { method: 'POST' });
        // Fetch fresh data
        await fetch('api/calendar.php');
        
        Toast.success('Kalenderen er oppdatert!');
        setTimeout(() => location.reload(), 500);
    } catch (error) {
        Toast.error('Kunne ikke oppdatere kalenderen');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync"></i> Oppdater nå';
    }
}
</script>

