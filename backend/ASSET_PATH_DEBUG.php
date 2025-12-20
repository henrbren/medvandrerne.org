<?php
/**
 * Debug script to check asset paths
 * Access this file to see what paths are being detected
 */
header('Content-Type: text/plain; charset=utf-8');

echo "=== Asset Path Debug ===\n\n";
echo "Current Directory (__DIR__): " . __DIR__ . "\n";
echo "Directory Name: " . basename(__DIR__) . "\n";
echo "Is Backend Directory: " . (basename(__DIR__) === 'backend' ? 'Yes' : 'No') . "\n\n";

echo "Checking paths:\n";
echo "1. " . __DIR__ . "/assets/css/admin.css\n";
echo "   Exists: " . (file_exists(__DIR__ . '/assets/css/admin.css') ? 'Yes' : 'No') . "\n\n";

echo "2. " . __DIR__ . "/backend/assets/css/admin.css\n";
echo "   Exists: " . (file_exists(__DIR__ . '/backend/assets/css/admin.css') ? 'Yes' : 'No') . "\n\n";

echo "3. " . dirname(__DIR__) . "/backend/assets/css/admin.css\n";
echo "   Exists: " . (file_exists(dirname(__DIR__) . '/backend/assets/css/admin.css') ? 'Yes' : 'No') . "\n\n";

// Determine asset base
$currentDir = __DIR__;
$isBackendDir = basename($currentDir) === 'backend';

if (file_exists($currentDir . '/assets/css/admin.css')) {
    $assetsBase = 'assets';
    echo "Result: Using 'assets' (we're in backend/)\n";
} elseif (file_exists($currentDir . '/backend/assets/css/admin.css')) {
    $assetsBase = 'backend/assets';
    echo "Result: Using 'backend/assets' (we're in root)\n";
} else {
    $assetsBase = $isBackendDir ? 'assets' : 'backend/assets';
    echo "Result: Using fallback '" . $assetsBase . "'\n";
}

echo "\nAsset Base Path: " . $assetsBase . "\n";
echo "CSS Path: " . $assetsBase . "/css/admin.css\n";
echo "JS Path: " . $assetsBase . "/js/admin.js\n";
