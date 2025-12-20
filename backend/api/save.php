<?php
/**
 * Generic save endpoint for admin operations
 */
require_once __DIR__ . '/_config-loader.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    jsonResponse(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
}

$type = $input['type'] ?? '';
$data = $input['data'] ?? null;

if (!$type || $data === null) {
    jsonResponse(['error' => 'Missing type or data'], 400);
}

// Validate type is alphanumeric and dash only
if (!preg_match('/^[a-z0-9-]+$/', $type)) {
    jsonResponse(['error' => 'Invalid type format'], 400);
}

$fileMap = [
    'organization' => JSON_ORGANIZATION,
    'mission' => JSON_MISSION,
    'core-activities' => JSON_CORE_ACTIVITIES,
    'local-groups' => JSON_LOCAL_GROUPS,
    'administration' => JSON_ADMINISTRATION,
    'board' => JSON_BOARD,
    'activities' => JSON_ACTIVITIES,
    'supporters' => JSON_SUPPORTERS,
    'news' => JSON_NEWS,
    'resources' => JSON_RESOURCES,
    // Note: gallery is deprecated, use calendar instead
];

if (!isset($fileMap[$type])) {
    jsonResponse(['error' => 'Invalid type'], 400);
}

$filePath = $fileMap[$type];

// Clear opcache if enabled to ensure fresh file is read
if (function_exists('opcache_invalidate')) {
    opcache_invalidate($filePath, true);
}

if (writeJsonFile($filePath, $data)) {
    // Verify the data was actually written
    clearstatcache(true, $filePath);
    $writtenData = readJsonFile($filePath);
    
    jsonResponse([
        'success' => true, 
        'message' => 'Data saved successfully',
        'verified' => !empty($writtenData) // Indicate if we verified the write
    ]);
} else {
    jsonResponse(['error' => 'Failed to save data'], 500);
}
