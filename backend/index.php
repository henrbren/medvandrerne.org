<?php
/**
 * Medvandrerne Admin Dashboard
 * Main admin interface
 */

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Prevent caching of admin pages
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

try {
    require_once __DIR__ . '/config.php';
} catch (Exception $e) {
    error_log('Config error: ' . $e->getMessage());
    die('Configuration error. Please check server logs.');
}

// Determine asset paths dynamically
// Try to detect if we're in backend/ folder or root
$inBackendDir = basename(__DIR__) === 'backend';
$assetsBase = $inBackendDir ? 'backend/assets' : 'assets';
$cssUrl = $assetsBase . '/css/admin.css';
$jsUrl = $assetsBase . '/js/admin.js';

// Check if user is authenticated (handled by .htaccess)
$page = isset($_GET['page']) ? $_GET['page'] : 'dashboard';

// Remove cache-busting parameter from URL if present
if (isset($_GET['_t'])) {
    // Parameter is used for cache-busting, but we don't need it in the URL
    // It's already served its purpose by forcing a fresh request
}
?>
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medvandrerne Admin</title>
    <?php
    // Asset URLs are set above - these are relative paths
    // They work regardless of domain or BASE_URL configuration
    ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($cssUrl) ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1><i class="fas fa-mountain"></i> Medvandrerne</h1>
                <p>Admin Panel</p>
            </div>
            <nav class="sidebar-nav">
                <a href="?page=dashboard" class="nav-item <?= $page === 'dashboard' ? 'active' : '' ?>">
                    <i class="fas fa-th-large"></i> Oversikt
                </a>
                <a href="?page=users" class="nav-item <?= $page === 'users' ? 'active' : '' ?>">
                    <i class="fas fa-id-card"></i> Brukere
                </a>
                <a href="?page=memberships" class="nav-item <?= $page === 'memberships' ? 'active' : '' ?>">
                    <i class="fas fa-crown"></i> Medlemskap
                </a>
                <a href="?page=news" class="nav-item <?= $page === 'news' ? 'active' : '' ?>">
                    <i class="fas fa-newspaper"></i> Nyheter
                </a>
                <a href="?page=calendar" class="nav-item <?= $page === 'calendar' ? 'active' : '' ?>">
                    <i class="fas fa-calendar-alt"></i> Kalender
                </a>
                <a href="?page=activities" class="nav-item <?= $page === 'activities' ? 'active' : '' ?>">
                    <i class="fas fa-plus-circle"></i> Egne aktiviteter
                </a>
                <a href="?page=registrations" class="nav-item <?= $page === 'registrations' ? 'active' : '' ?>">
                    <i class="fas fa-clipboard-list"></i> Påmeldinger
                </a>
                <a href="?page=activity-messages" class="nav-item <?= $page === 'activity-messages' ? 'active' : '' ?>">
                    <i class="fas fa-envelope"></i> Aktivitetsmeldinger
                </a>
                <a href="?page=local-groups" class="nav-item <?= $page === 'local-groups' ? 'active' : '' ?>">
                    <i class="fas fa-map-marker-alt"></i> Lokallag
                </a>
                <a href="?page=board" class="nav-item <?= $page === 'board' ? 'active' : '' ?>">
                    <i class="fas fa-users"></i> Styret
                </a>
                <a href="?page=administration" class="nav-item <?= $page === 'administration' ? 'active' : '' ?>">
                    <i class="fas fa-user-tie"></i> Ansatte
                </a>
                <a href="?page=supporters" class="nav-item <?= $page === 'supporters' ? 'active' : '' ?>">
                    <i class="fas fa-handshake"></i> Partnere
                </a>
                <a href="?page=organization" class="nav-item <?= $page === 'organization' ? 'active' : '' ?>">
                    <i class="fas fa-info-circle"></i> Om oss
                </a>
                <a href="?page=mission" class="nav-item <?= $page === 'mission' ? 'active' : '' ?>">
                    <i class="fas fa-heart"></i> Misjon
                </a>
                <a href="?page=resources" class="nav-item <?= $page === 'resources' ? 'active' : '' ?>">
                    <i class="fas fa-link"></i> Ressurser
                </a>
                <a href="?page=calendar-config" class="nav-item <?= $page === 'calendar-config' ? 'active' : '' ?>">
                    <i class="fab fa-google"></i> Google-synk
                </a>
            </nav>
            <div class="sidebar-footer">
                <p><i class="fas fa-server"></i> <?= BASE_URL ?></p>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="content-header">
                <div>
                    <h2>
                        <?php
                        $pageNames = [
                            'dashboard' => 'Oversikt',
                            'news' => 'Nyheter',
                            'calendar' => 'Google Kalender',
                            'activities' => 'Egne aktiviteter',
                            'registrations' => 'Påmeldinger',
                            'activity-messages' => 'Aktivitetsmeldinger',
                            'local-groups' => 'Lokallag',
                            'board' => 'Styret',
                            'administration' => 'Ansatte',
                            'supporters' => 'Partnere',
                            'organization' => 'Om oss',
                            'mission' => 'Misjon',
                            'resources' => 'Ressurser',
                            'calendar-config' => 'Google-synk',
                            'users' => 'Brukere',
                            'memberships' => 'Medlemskap'
                        ];
                        echo $pageNames[$page] ?? ucfirst(str_replace('-', ' ', $page));
                        ?>
                    </h2>
                </div>
                <div class="header-actions">
                    <a href="<?= API_URL ?>export.php" class="btn btn-ghost" target="_blank">
                        <i class="fas fa-download"></i>
                    </a>
                    <button class="btn btn-ghost" onclick="Shortcuts.show()">
                        <i class="fas fa-keyboard"></i>
                    </button>
                </div>
            </header>

            <div class="content-body">
                <?php
                try {
                    $pageFile = __DIR__ . "/pages/{$page}.php";
                    if (file_exists($pageFile)) {
                        require_once $pageFile;
                    } else {
                        $dashboardFile = __DIR__ . '/pages/dashboard.php';
                        if (file_exists($dashboardFile)) {
                            require_once $dashboardFile;
                        } else {
                            echo '<div class="error-message">';
                            echo '<p>Dashboard page not found. Please ensure all files are uploaded correctly.</p>';
                            echo '<p>Expected file: ' . htmlspecialchars($dashboardFile) . '</p>';
                            echo '</div>';
                        }
                    }
                } catch (Exception $e) {
                    error_log('Page error: ' . $e->getMessage());
                    echo '<div class="error-message">';
                    echo '<p>Error loading page. Please check server logs.</p>';
                    echo '</div>';
                }
                ?>
            </div>
        </main>
    </div>

    <script src="<?= htmlspecialchars($jsUrl) ?>"></script>
</body>
</html>
