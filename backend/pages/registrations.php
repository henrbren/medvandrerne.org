<?php
/**
 * Admin page for viewing activity registrations
 */

// Load activities (both local and from calendar)
$activitiesFile = DATA_DIR . 'activities.json';
$activities = readJsonFile($activitiesFile, []);

// Load calendar events
$calendarCacheFile = DATA_DIR . 'calendar_cache.json';
$calendarEvents = readJsonFile($calendarCacheFile, []);

// Merge all activities
$allActivities = array_merge($activities, $calendarEvents);

// Sort by date (newest first for past, upcoming first for future)
usort($allActivities, function($a, $b) {
    return strcmp($a['date'] ?? '', $b['date'] ?? '');
});

// Load registrations
$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

// Load users for name lookup
$usersFile = DATA_DIR . 'users.json';
$users = readJsonFile($usersFile, []);

// Create user lookup map
$userMap = [];
foreach ($users as $user) {
    $userMap[$user['id']] = $user;
}

// Get selected activity if any
$selectedActivityId = $_GET['activity'] ?? null;

// Split into upcoming and past
$now = date('Y-m-d');
$upcomingActivities = array_filter($allActivities, function($a) use ($now) {
    return ($a['date'] ?? '') >= $now;
});
$pastActivities = array_filter($allActivities, function($a) use ($now) {
    return ($a['date'] ?? '') < $now;
});

// Reverse past activities (most recent first)
$pastActivities = array_reverse($pastActivities);

// Function to get registration count
function getRegistrationCount($activityId, $registrations) {
    $id = (string)$activityId;
    return $registrations[$id]['count'] ?? 0;
}

// Function to get participants
function getParticipants($activityId, $registrations) {
    $id = (string)$activityId;
    return $registrations[$id]['participants'] ?? [];
}
?>

<style>
.registrations-page {
    padding: 20px;
}
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}
.page-header h1 {
    margin: 0;
    color: #333;
}
.stats-row {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
}
.stat-card {
    flex: 1;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    text-align: center;
}
.stat-card .icon {
    font-size: 32px;
    margin-bottom: 8px;
}
.stat-card .value {
    font-size: 32px;
    font-weight: 800;
    color: #333;
}
.stat-card .label {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
}
.activities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}
.activity-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}
.activity-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.activity-card.selected {
    border: 2px solid #2E7D32;
}
.activity-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}
.activity-header h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #333;
}
.activity-meta {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #666;
}
.activity-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}
.activity-stats {
    display: flex;
    padding: 12px 16px;
    background: #f5f5f5;
    gap: 16px;
}
.activity-stat {
    display: flex;
    align-items: center;
    gap: 6px;
}
.activity-stat .count {
    font-weight: 700;
    font-size: 18px;
    color: #2E7D32;
}
.activity-stat .label {
    font-size: 12px;
    color: #666;
}
.type-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}
.type-Tur { background: #e8f5e9; color: #2E7D32; }
.type-Motivasjonstur { background: #e3f2fd; color: #1976D2; }
.type-Møte { background: #fff3e0; color: #F57C00; }
.type-Arrangement { background: #fce4ec; color: #C2185B; }
.type-Konferanse { background: #ede7f6; color: #7B1FA2; }

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #2E7D32;
}

/* Participants Panel */
.participants-panel {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 24px;
}
.participants-panel h2 {
    margin: 0 0 16px 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 12px;
}
.participants-panel h2 .count-badge {
    background: #2E7D32;
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 14px;
}
.participants-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.participant-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #f9f9f9;
    border-radius: 8px;
    gap: 12px;
}
.participant-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.participant-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.participant-avatar .initials {
    font-weight: 600;
    color: #666;
    font-size: 14px;
}
.participant-info {
    flex: 1;
}
.participant-name {
    font-weight: 600;
    color: #333;
}
.participant-meta {
    font-size: 12px;
    color: #666;
}
.participant-actions {
    display: flex;
    gap: 8px;
}
.btn-small {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background 0.2s;
}
.btn-small.btn-danger {
    background: #ffebee;
    color: #c62828;
}
.btn-small.btn-danger:hover {
    background: #ffcdd2;
}

.empty-state {
    text-align: center;
    padding: 48px;
    color: #666;
}
.empty-state .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.export-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #2E7D32;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
}
.export-btn:hover {
    background: #1B5E20;
}

.past-section {
    opacity: 0.7;
}
.past-section .activity-card {
    background: #fafafa;
}
</style>

<div class="registrations-page">
    <div class="page-header">
        <h1>📋 Påmeldinger</h1>
        <?php if ($selectedActivityId): ?>
        <a href="?page=registrations" class="export-btn">
            ← Tilbake til oversikt
        </a>
        <?php endif; ?>
    </div>

    <!-- Stats -->
    <div class="stats-row">
        <div class="stat-card">
            <div class="icon">📅</div>
            <div class="value"><?= count($upcomingActivities) ?></div>
            <div class="label">Kommende aktiviteter</div>
        </div>
        <div class="stat-card">
            <div class="icon">👥</div>
            <div class="value"><?= array_sum(array_map(function($r) { return $r['count'] ?? 0; }, $registrations)) ?></div>
            <div class="label">Totalt påmeldte</div>
        </div>
        <div class="stat-card">
            <div class="icon">📨</div>
            <div class="value"><?= count(array_filter($registrations, function($r) { return ($r['count'] ?? 0) > 0; })) ?></div>
            <div class="label">Aktiviteter med påmeldte</div>
        </div>
    </div>

    <?php if ($selectedActivityId): ?>
        <?php
        // Find the selected activity
        $selectedActivity = null;
        foreach ($allActivities as $activity) {
            if ((string)$activity['id'] === $selectedActivityId) {
                $selectedActivity = $activity;
                break;
            }
        }
        $participants = getParticipants($selectedActivityId, $registrations);
        ?>
        
        <?php if ($selectedActivity): ?>
        <div class="participants-panel">
            <h2>
                <?= htmlspecialchars($selectedActivity['title']) ?>
                <span class="count-badge"><?= count($participants) ?> påmeldt<?= count($participants) !== 1 ? 'e' : '' ?></span>
            </h2>
            <p style="color: #666; margin-bottom: 16px;">
                📅 <?= htmlspecialchars($selectedActivity['date']) ?>
                <?php if (!empty($selectedActivity['time'])): ?>
                    • 🕐 <?= htmlspecialchars($selectedActivity['time']) ?>
                <?php endif; ?>
                <?php if (!empty($selectedActivity['location']) && $selectedActivity['location'] !== 'Har ikke sted'): ?>
                    • 📍 <?= htmlspecialchars($selectedActivity['location']) ?>
                <?php endif; ?>
            </p>

            <?php if (count($participants) > 0): ?>
            <div style="margin-bottom: 16px;">
                <button onclick="exportParticipants()" class="export-btn">
                    📥 Eksporter deltakerliste
                </button>
            </div>

            <div class="participants-list">
                <?php foreach ($participants as $index => $participant): ?>
                <?php 
                    $user = $userMap[$participant['userId']] ?? null;
                    $name = $user['name'] ?? $participant['userName'] ?? 'Ukjent';
                    $email = $user['email'] ?? null;
                    $phone = $user['phone'] ?? null;
                    $avatar = $user['avatarUrl'] ?? $participant['userAvatar'] ?? null;
                    $initials = strtoupper(substr($name, 0, 1));
                    if (strpos($name, ' ') !== false) {
                        $parts = explode(' ', $name);
                        $initials = strtoupper(substr($parts[0], 0, 1) . substr(end($parts), 0, 1));
                    }
                ?>
                <div class="participant-item">
                    <div class="participant-avatar">
                        <?php if ($avatar): ?>
                            <img src="<?= htmlspecialchars($avatar) ?>" alt="<?= htmlspecialchars($name) ?>">
                        <?php else: ?>
                            <span class="initials"><?= $initials ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="participant-info">
                        <div class="participant-name"><?= htmlspecialchars($name) ?></div>
                        <div class="participant-meta">
                            Påmeldt <?= date('d.m.Y H:i', strtotime($participant['registeredAt'])) ?>
                            <?php if ($email): ?>
                                • <?= htmlspecialchars($email) ?>
                            <?php endif; ?>
                            <?php if ($phone): ?>
                                • <?= htmlspecialchars($phone) ?>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="participant-actions">
                        <button class="btn-small btn-danger" onclick="removeParticipant('<?= $selectedActivityId ?>', '<?= $participant['userId'] ?>')">
                            🗑️ Fjern
                        </button>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="empty-state">
                <div class="icon">👤</div>
                <p>Ingen påmeldte til denne aktiviteten ennå</p>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

    <?php else: ?>
        <!-- Upcoming Activities -->
        <?php if (count($upcomingActivities) > 0): ?>
        <h3 class="section-title">🔜 Kommende aktiviteter</h3>
        <div class="activities-grid">
            <?php foreach ($upcomingActivities as $activity): ?>
            <?php $count = getRegistrationCount($activity['id'], $registrations); ?>
            <div class="activity-card">
                <a href="?page=registrations&activity=<?= urlencode($activity['id']) ?>" style="text-decoration: none; color: inherit;">
                    <div class="activity-header">
                        <h3><?= htmlspecialchars($activity['title']) ?></h3>
                        <div class="activity-meta">
                            <span>📅 <?= htmlspecialchars($activity['date']) ?></span>
                            <?php if (!empty($activity['type'])): ?>
                            <span class="type-badge type-<?= $activity['type'] ?>"><?= htmlspecialchars($activity['type']) ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="activity-stats">
                        <div class="activity-stat">
                            <span class="count"><?= $count ?></span>
                            <span class="label">påmeldt<?= $count !== 1 ? 'e' : '' ?></span>
                        </div>
                        <?php if (!empty($activity['location']) && $activity['location'] !== 'Har ikke sted'): ?>
                        <div class="activity-stat">
                            <span>📍</span>
                            <span class="label" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <?= htmlspecialchars($activity['location']) ?>
                            </span>
                        </div>
                        <?php endif; ?>
                    </div>
                </a>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <!-- Past Activities -->
        <?php if (count($pastActivities) > 0): ?>
        <div class="past-section">
            <h3 class="section-title" style="border-color: #999;">📜 Tidligere aktiviteter</h3>
            <div class="activities-grid">
                <?php foreach (array_slice($pastActivities, 0, 12) as $activity): ?>
                <?php $count = getRegistrationCount($activity['id'], $registrations); ?>
                <div class="activity-card">
                    <a href="?page=registrations&activity=<?= urlencode($activity['id']) ?>" style="text-decoration: none; color: inherit;">
                        <div class="activity-header">
                            <h3><?= htmlspecialchars($activity['title']) ?></h3>
                            <div class="activity-meta">
                                <span>📅 <?= htmlspecialchars($activity['date']) ?></span>
                                <?php if (!empty($activity['type'])): ?>
                                <span class="type-badge type-<?= $activity['type'] ?>"><?= htmlspecialchars($activity['type']) ?></span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="activity-stats">
                            <div class="activity-stat">
                                <span class="count"><?= $count ?></span>
                                <span class="label">påmeldt<?= $count !== 1 ? 'e' : '' ?></span>
                            </div>
                        </div>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>

        <?php if (count($upcomingActivities) === 0 && count($pastActivities) === 0): ?>
        <div class="empty-state">
            <div class="icon">📅</div>
            <p>Ingen aktiviteter funnet</p>
        </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<script>
async function removeParticipant(activityId, userId) {
    if (!confirm('Er du sikker på at du vil fjerne denne deltakeren?')) return;
    
    try {
        const response = await fetch('api/registrations/unregister.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityId, userId })
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Kunne ikke fjerne deltaker');
        }
    } catch (error) {
        console.error(error);
        alert('Feil ved fjerning av deltaker');
    }
}

function exportParticipants() {
    // Get activity title and participants from the page
    const title = document.querySelector('.participants-panel h2').textContent.split('\n')[0].trim();
    const participants = document.querySelectorAll('.participant-item');
    
    let csv = 'Navn,E-post,Telefon,Påmeldingsdato\n';
    
    participants.forEach(p => {
        const name = p.querySelector('.participant-name').textContent;
        const meta = p.querySelector('.participant-meta').textContent;
        
        // Extract email and phone from meta
        const emailMatch = meta.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
        const phoneMatch = meta.match(/(\+?\d[\d\s-]{7,})/);
        const dateMatch = meta.match(/Påmeldt (\d{2}\.\d{2}\.\d{4} \d{2}:\d{2})/);
        
        csv += `"${name}","${emailMatch ? emailMatch[1] : ''}","${phoneMatch ? phoneMatch[1].trim() : ''}","${dateMatch ? dateMatch[1] : ''}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `deltakere-${title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    link.click();
}
</script>

