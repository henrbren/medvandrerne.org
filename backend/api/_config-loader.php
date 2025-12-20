<?php
/**
 * Config loader for API files
 * Handles multiple possible config.php locations
 */

// Try multiple possible config locations
$configPaths = [
    __DIR__ . '/../config.php',           // API in /backend/api/, config in /backend/
    dirname(__DIR__) . '/config.php',     // Same as above, alternative syntax
    __DIR__ . '/../backend/config.php',   // API in root /api/, config in /backend/
    __DIR__ . '/config.php',              // API and config in same directory
];

$configLoaded = false;
foreach ($configPaths as $configPath) {
    if (file_exists($configPath)) {
        require_once $configPath;
        $configLoaded = true;
        break;
    }
}

if (!$configLoaded) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    $error = [
        'error' => 'Config file not found',
        'message' => 'Could not locate config.php. Tried: ' . implode(', ', $configPaths),
        'current_dir' => __DIR__,
        'parent_dir' => dirname(__DIR__)
    ];
    echo json_encode($error, JSON_PRETTY_PRINT);
    exit;
}
