<?php
/**
 * Calendar API Endpoint
 * Fetches and caches Google Calendar ICS feed
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../services/icsParser.php';
setCorsHeaders();

// Cache settings
$cacheFile = DATA_DIR . 'calendar_cache.json';
$cacheDuration = 60 * 60; // 1 time

// Get calendar configuration
$calendarConfig = readJsonFile(DATA_DIR . 'calendar_config.json', [
    'googleCalendarUrl' => '',
    'enabled' => false,
]);

// If calendar is not enabled, return empty array
if (!$calendarConfig['enabled'] || empty($calendarConfig['googleCalendarUrl'])) {
    jsonResponse([]);
}

// Check cache
$useCache = false;
if (file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);
    if ($cacheAge < $cacheDuration) {
        $useCache = true;
    }
}

if ($useCache) {
    $cached = readJsonFile($cacheFile, []);
    jsonResponse($cached);
}

// Fetch from Google Calendar
try {
    $icsUrl = $calendarConfig['googleCalendarUrl'];
    
    // Validate URL
    if (!filter_var($icsUrl, FILTER_VALIDATE_URL)) {
        throw new Exception('Invalid calendar URL format');
    }
    
    // Only allow HTTPS URLs from Google Calendar
    $parsedUrl = parse_url($icsUrl);
    if ($parsedUrl['scheme'] !== 'https') {
        throw new Exception('Only HTTPS URLs are allowed');
    }
    
    if (!isset($parsedUrl['host']) || strpos($parsedUrl['host'], 'google.com') === false && strpos($parsedUrl['host'], 'googleapis.com') === false) {
        throw new Exception('Only Google Calendar URLs are allowed');
    }
    
    // Add cache-busting parameter
    $icsUrl .= (strpos($icsUrl, '?') !== false ? '&' : '?') . 'nocache=' . time();
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'user_agent' => 'Medvandrerne Calendar Sync',
            'follow_location' => true,
            'max_redirects' => 3,
        ],
    ]);
    
    $icsContent = @file_get_contents($icsUrl, false, $context);
    
    if ($icsContent === false) {
        // If fetch fails, try cache even if expired
        if (file_exists($cacheFile)) {
            $cached = readJsonFile($cacheFile, []);
            jsonResponse($cached);
        }
        throw new Exception('Failed to fetch calendar');
    }
    
    // Parse ICS
    $parser = new ICSParser($icsContent);
    $events = $parser->getEvents();
    
    // Filter future events and sort by date
    $now = date('Y-m-d');
    $futureEvents = array_filter($events, function($event) use ($now) {
        return ($event['date'] ?? '') >= $now;
    });
    
    // Sort by date
    usort($futureEvents, function($a, $b) {
        return strcmp($a['date'] ?? '', $b['date'] ?? '');
    });
    
    // Limit to next 100 events
    $futureEvents = array_slice($futureEvents, 0, 100);
    
    // Save to cache
    writeJsonFile($cacheFile, $futureEvents);
    
    jsonResponse($futureEvents);
    
} catch (Exception $e) {
    error_log('Calendar fetch error: ' . $e->getMessage());
    
    // Return cached data if available, even if expired
    if (file_exists($cacheFile)) {
        $cached = readJsonFile($cacheFile, []);
        jsonResponse($cached);
    }
    
    jsonResponse([]);
}

