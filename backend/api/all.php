<?php
/**
 * API Endpoint: Get all data
 * Returns all app data in a single JSON response
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../services/icsParser.php';
setCorsHeaders();

// Fetch calendar events from cache
$calendarEvents = [];
$calendarConfig = readJsonFile(DATA_DIR . 'calendar_config.json', ['enabled' => false, 'googleCalendarUrl' => '']);
$cacheFile = DATA_DIR . 'calendar_cache.json';

if ($calendarConfig['enabled'] && !empty($calendarConfig['googleCalendarUrl']) && file_exists($cacheFile)) {
    $calendarEvents = readJsonFile($cacheFile, []);
}

$data = [
    'organization' => readJsonFile(JSON_ORGANIZATION),
    'mission' => readJsonFile(JSON_MISSION),
    'coreActivities' => readJsonFile(JSON_CORE_ACTIVITIES),
    'localGroups' => readJsonFile(JSON_LOCAL_GROUPS),
    'administration' => readJsonFile(JSON_ADMINISTRATION),
    'board' => readJsonFile(JSON_BOARD),
    'activities' => readJsonFile(JSON_ACTIVITIES),
    'supporters' => readJsonFile(JSON_SUPPORTERS),
    'news' => readJsonFile(JSON_NEWS),
    'calendar' => $calendarEvents,
    'resources' => readJsonFile(JSON_RESOURCES),
];

jsonResponse($data);

