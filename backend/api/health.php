<?php
/**
 * Health check endpoint
 * Returns system status for monitoring
 */
require_once __DIR__ . '/../config.php';
setCorsHeaders();

$health = [
    'status' => 'ok',
    'timestamp' => date('c'),
    'checks' => [],
];

// Check data directory
$health['checks']['data_directory'] = [
    'exists' => file_exists(DATA_DIR),
    'writable' => is_writable(DATA_DIR),
];

// Check critical JSON files
$criticalFiles = [
    'organization' => JSON_ORGANIZATION,
    'mission' => JSON_MISSION,
    'activities' => JSON_ACTIVITIES,
];

$allFilesOk = true;
foreach ($criticalFiles as $name => $path) {
    $exists = file_exists($path);
    $readable = $exists && is_readable($path);
    $health['checks']['files'][$name] = [
        'exists' => $exists,
        'readable' => $readable,
    ];
    if (!$exists || !$readable) {
        $allFilesOk = false;
    }
}

// Check calendar config
$calendarConfig = readJsonFile(DATA_DIR . 'calendar_config.json', []);
$health['checks']['calendar'] = [
    'enabled' => $calendarConfig['enabled'] ?? false,
    'configured' => !empty($calendarConfig['googleCalendarUrl'] ?? ''),
];

// Check PHP version
$health['checks']['php'] = [
    'version' => phpversion(),
    'min_version' => version_compare(phpversion(), '7.4.0', '>='),
];

// Determine overall status
if (!$health['checks']['data_directory']['exists'] || !$health['checks']['data_directory']['writable']) {
    $health['status'] = 'error';
} elseif (!$allFilesOk) {
    $health['status'] = 'warning';
}

jsonResponse($health);

