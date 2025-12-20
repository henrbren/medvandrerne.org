<?php
/**
 * Debug script to check asset paths
 */
require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Asset Path Debug</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        .info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { border-left: 4px solid green; }
        .error { border-left: 4px solid red; }
        h2 { color: #333; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Asset Path Debug Information</h1>
    
    <div class="info">
        <h2>Current Directory</h2>
        <p><code><?= __DIR__ ?></code></p>
    </div>
    
    <div class="info">
        <h2>Document Root</h2>
        <p><code><?= $_SERVER['DOCUMENT_ROOT'] ?? 'Not set' ?></code></p>
    </div>
    
    <div class="info">
        <h2>BASE_URL</h2>
        <p><code><?= BASE_URL ?></code></p>
    </div>
    
    <div class="info">
        <h2>Asset File Checks</h2>
        <?php
        $checks = [
            'Current dir + assets' => __DIR__ . '/assets/css/admin.css',
            'Current dir + backend/assets' => __DIR__ . '/backend/assets/css/admin.css',
            'Document root + backend/assets' => ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/backend/assets/css/admin.css',
            'Document root + assets' => ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/assets/css/admin.css',
        ];
        
        foreach ($checks as $label => $path) {
            $exists = file_exists($path);
            $class = $exists ? 'success' : 'error';
            echo "<div class='info $class'>";
            echo "<strong>$label:</strong><br>";
            echo "<code>$path</code><br>";
            echo $exists ? "✓ EXISTS" : "✗ NOT FOUND";
            echo "</div>";
        }
        ?>
    </div>
    
    <div class="info">
        <h2>Recommended Asset Base Path</h2>
        <?php
        $currentDir = __DIR__;
        $assetsBase = '';
        
        if (file_exists($currentDir . '/assets/css/admin.css')) {
            $assetsBase = BASE_URL . 'backend/assets';
            echo "<p>Found: Assets in current directory</p>";
        } elseif (file_exists($currentDir . '/backend/assets/css/admin.css')) {
            $assetsBase = BASE_URL . 'backend/assets';
            echo "<p>Found: Assets in backend subdirectory</p>";
        } else {
            $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
            if ($docRoot && file_exists($docRoot . '/backend/assets/css/admin.css')) {
                $assetsBase = BASE_URL . 'backend/assets';
                echo "<p>Found: Assets relative to document root</p>";
            } else {
                $assetsBase = BASE_URL . 'backend/assets';
                echo "<p>Warning: Using default path (may not work)</p>";
            }
        }
        ?>
        <p><strong>Recommended:</strong> <code><?= $assetsBase ?></code></p>
        <p><strong>CSS URL:</strong> <code><?= $assetsBase ?>/css/admin.css</code></p>
        <p><strong>JS URL:</strong> <code><?= $assetsBase ?>/js/admin.js</code></p>
    </div>
    
    <div class="info">
        <h2>Test Links</h2>
        <p><a href="<?= BASE_URL ?>backend/assets/css/admin.css" target="_blank">Test CSS</a></p>
        <p><a href="<?= BASE_URL ?>backend/assets/js/admin.js" target="_blank">Test JS</a></p>
    </div>
</body>
</html>
