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

// Consider configured if URL is set (backwards compatible - ignore enabled flag)
$isCalendarConfigured = !empty($calendarConfig['googleCalendarUrl']);

// Cache duration - same as calendar.php for consistency
$cacheDuration = 60 * 60; // 1 hour

// Check if cache is still valid (not stale)
$cacheIsValid = false;
if ($isCalendarConfigured && file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);
    $cacheIsValid = $cacheAge < $cacheDuration;
}

if ($isCalendarConfigured && $cacheIsValid) {
    $calendarEvents = readJsonFile($cacheFile, []);
} else if ($isCalendarConfigured && !$cacheIsValid) {
    // Cache doesn't exist, try to fetch directly
    try {
        $icsUrl = $calendarConfig['googleCalendarUrl'];
        $icsUrl .= (strpos($icsUrl, '?') !== false ? '&' : '?') . 'nocache=' . time();
        
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => 'Medvandrerne Calendar Sync',
                'follow_location' => true,
            ],
        ]);
        
        $icsContent = @file_get_contents($icsUrl, false, $context);
        
        if ($icsContent !== false) {
            $parser = new ICSParser($icsContent);
            $events = $parser->getEvents();
            
            $now = date('Y-m-d');
            $calendarEvents = array_filter($events, function($event) use ($now) {
                return ($event['date'] ?? '') >= $now;
            });
            
            usort($calendarEvents, function($a, $b) {
                return strcmp($a['date'] ?? '', $b['date'] ?? '');
            });
            
            $calendarEvents = array_slice(array_values($calendarEvents), 0, 100);
            
            // Save to cache for next time
            writeJsonFile($cacheFile, $calendarEvents);
        }
    } catch (Exception $e) {
        error_log('Calendar fetch in all.php: ' . $e->getMessage());
    }
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

