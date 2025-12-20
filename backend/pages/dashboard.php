<?php
// Dashboard statistics
$news = readJsonFile(JSON_NEWS);
$calendarCache = readJsonFile(DATA_DIR . 'calendar_cache.json', []);
$activities = readJsonFile(JSON_ACTIVITIES);
$localGroups = readJsonFile(JSON_LOCAL_GROUPS);
$board = readJsonFile(JSON_BOARD);
$supporters = readJsonFile(JSON_SUPPORTERS);
$resources = readJsonFile(JSON_RESOURCES);
?>

<div class="dashboard">
    <!-- Quick Actions - Minimal -->
    <div class="quick-actions">
        <a href="?page=news" class="quick-action-btn">
            <i class="fas fa-plus"></i> Ny nyhet
        </a>
        <a href="?page=activities" class="quick-action-btn">
            <i class="fas fa-plus"></i> Ny aktivitet
        </a>
        <a href="?page=calendar-config" class="quick-action-btn">
            <i class="fas fa-sync"></i> Synkroniser
        </a>
        <a href="<?= API_URL ?>health.php" class="quick-action-btn" target="_blank">
            <i class="fas fa-heartbeat"></i> Status
        </a>
    </div>

    <!-- Stats Grid - Clean Cards -->
    <div class="stats-grid">
        <a href="?page=news" class="stat-card" style="--stat-color: #667eea">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                <i class="fas fa-newspaper"></i>
            </div>
            <div class="stat-value" data-count="<?= count($news) ?>"><?= count($news) ?></div>
            <div class="stat-label">Nyheter</div>
        </a>

        <a href="?page=calendar" class="stat-card" style="--stat-color: #f093fb">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="stat-value" data-count="<?= count($calendarCache) ?>"><?= count($calendarCache) ?></div>
            <div class="stat-label">Kalenderhendelser</div>
        </a>

        <a href="?page=activities" class="stat-card" style="--stat-color: #4facfe">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
                <i class="fas fa-hiking"></i>
            </div>
            <div class="stat-value" data-count="<?= count($activities) ?>"><?= count($activities) ?></div>
            <div class="stat-label">Aktiviteter</div>
        </a>

        <a href="?page=local-groups" class="stat-card" style="--stat-color: #43e97b">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7)">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-value" data-count="<?= count($localGroups) ?>"><?= count($localGroups) ?></div>
            <div class="stat-label">Lokallag</div>
        </a>

        <a href="?page=board" class="stat-card" style="--stat-color: #fa709a">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a, #fee140)">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="stat-value" data-count="<?= count($board) ?>"><?= count($board) ?></div>
            <div class="stat-label">Styremedlemmer</div>
        </a>

        <a href="?page=supporters" class="stat-card" style="--stat-color: #30cfd0">
            <div class="stat-icon" style="background: linear-gradient(135deg, #30cfd0, #330867)">
                <i class="fas fa-handshake"></i>
            </div>
            <div class="stat-value" data-count="<?= count($supporters) ?>"><?= count($supporters) ?></div>
            <div class="stat-label">Partnere</div>
        </a>
    </div>

    <!-- Navigation Cards -->
    <div class="dashboard-section">
        <h3><i class="fas fa-compass"></i> Naviger</h3>
        <div class="nav-links">
            <a href="?page=organization" class="nav-link-card">
                <h4><i class="fas fa-building"></i> Organisasjon</h4>
                <p>Grunnleggende info</p>
            </a>
            <a href="?page=mission" class="nav-link-card">
                <h4><i class="fas fa-heart"></i> Misjon</h4>
                <p>Verdier og formål</p>
            </a>
            <a href="?page=resources" class="nav-link-card">
                <h4><i class="fas fa-book"></i> Ressurser</h4>
                <p><?= count($resources) ?> lenker</p>
            </a>
            <a href="?page=calendar-config" class="nav-link-card">
                <h4><i class="fab fa-google"></i> Kalender</h4>
                <p>Google-synk</p>
            </a>
        </div>
    </div>

    <!-- Tips - Collapsible -->
    <div class="dashboard-section">
        <h3><i class="fas fa-keyboard"></i> Snarveier</h3>
        <div class="info-box">
            <ul>
                <li><strong>?</strong> — Vis alle snarveier</li>
                <li><strong>⌘S</strong> — Lagre endringer</li>
                <li><strong>⌘K</strong> — Søk</li>
                <li><strong>Esc</strong> — Lukk dialoger</li>
            </ul>
        </div>
    </div>
</div>
