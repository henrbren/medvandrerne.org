<?php
/**
 * Simple test to verify asset paths
 */
require_once __DIR__ . '/config.php';

$currentDir = __DIR__;
$docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';

echo "Current Directory: " . $currentDir . "\n";
echo "Document Root: " . $docRoot . "\n";
echo "BASE_URL: " . BASE_URL . "\n\n";

echo "Checking asset locations:\n";
echo "1. " . $currentDir . "/assets/css/admin.css - " . (file_exists($currentDir . '/assets/css/admin.css') ? 'EXISTS' : 'NOT FOUND') . "\n";
echo "2. " . $currentDir . "/backend/assets/css/admin.css - " . (file_exists($currentDir . '/backend/assets/css/admin.css') ? 'EXISTS' : 'NOT FOUND') . "\n";
if ($docRoot) {
    echo "3. " . $docRoot . "/backend/assets/css/admin.css - " . (file_exists($docRoot . '/backend/assets/css/admin.css') ? 'EXISTS' : 'NOT FOUND') . "\n";
    echo "4. " . $docRoot . "/assets/css/admin.css - " . (file_exists($docRoot . '/assets/css/admin.css') ? 'EXISTS' : 'NOT FOUND') . "\n";
}

echo "\nRecommended asset base: " . rtrim(BASE_URL, '/') . "/backend/assets\n";
echo "CSS URL: " . rtrim(BASE_URL, '/') . "/backend/assets/css/admin.css\n";
echo "JS URL: " . rtrim(BASE_URL, '/') . "/backend/assets/js/admin.js\n";
