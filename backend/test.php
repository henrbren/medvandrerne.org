<?php
/**
 * Test script for debugging backend issues
 * Access this file directly to check if PHP is working
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Medvandrerne Backend Test</h1>";

echo "<h2>PHP Information</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

echo "<h2>Directory Check</h2>";
$dataDir = __DIR__ . '/data/';
echo "<p>Data directory: " . $dataDir . "</p>";
echo "<p>Exists: " . (file_exists($dataDir) ? 'Yes' : 'No') . "</p>";
echo "<p>Writable: " . (is_writable($dataDir) ? 'Yes' : 'No') . "</p>";

if (!file_exists($dataDir)) {
    echo "<p>Attempting to create data directory...</p>";
    if (mkdir($dataDir, 0755, true)) {
        echo "<p style='color: green;'>✓ Data directory created successfully</p>";
    } else {
        echo "<p style='color: red;'>✗ Failed to create data directory</p>";
    }
}

echo "<h2>File Permissions</h2>";
echo "<p>Current directory: " . __DIR__ . "</p>";
echo "<p>Current directory writable: " . (is_writable(__DIR__) ? 'Yes' : 'No') . "</p>";

echo "<h2>JSON Files Check</h2>";
$jsonFiles = [
    'organization.json',
    'mission.json',
    'core_activities.json',
    'local_groups.json',
    'administration.json',
    'board.json',
    'activities.json',
    'supporters.json',
    'news.json',
    'gallery.json',
    'resources.json',
];

foreach ($jsonFiles as $file) {
    $path = $dataDir . $file;
    $exists = file_exists($path);
    echo "<p>{$file}: " . ($exists ? '✓ Exists' : '✗ Missing') . "</p>";
    if ($exists) {
        $content = file_get_contents($path);
        $json = json_decode($content, true);
        echo "<p style='margin-left: 20px;'>Valid JSON: " . ($json !== null ? '✓ Yes' : '✗ No') . "</p>";
    }
}

echo "<h2>Config Test</h2>";
try {
    require_once 'config.php';
    echo "<p style='color: green;'>✓ Config loaded successfully</p>";
    echo "<p>BASE_URL: " . BASE_URL . "</p>";
    echo "<p>DATA_DIR: " . DATA_DIR . "</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Config error: " . $e->getMessage() . "</p>";
}

echo "<h2>Test JSON Read/Write</h2>";
$testFile = $dataDir . 'test.json';
$testData = ['test' => 'data', 'timestamp' => time()];
if (file_put_contents($testFile, json_encode($testData))) {
    echo "<p style='color: green;'>✓ Can write JSON file</p>";
    if (file_exists($testFile)) {
        $read = json_decode(file_get_contents($testFile), true);
        if ($read) {
            echo "<p style='color: green;'>✓ Can read JSON file</p>";
            unlink($testFile); // Clean up
        } else {
            echo "<p style='color: red;'>✗ Cannot read JSON file</p>";
        }
    }
} else {
    echo "<p style='color: red;'>✗ Cannot write JSON file</p>";
}

echo "<h2>Recommendations</h2>";
if (!file_exists($dataDir) || !is_writable($dataDir)) {
    echo "<p style='color: orange;'>⚠ Set data directory permissions: chmod 755 data/</p>";
}
if (!is_writable(__DIR__)) {
    echo "<p style='color: orange;'>⚠ Backend directory may need write permissions</p>";
}

