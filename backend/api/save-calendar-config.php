<?php
/**
 * Save Calendar Configuration
 */
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    jsonResponse(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
}

// Validate URL if provided
$url = $input['googleCalendarUrl'] ?? '';
if (!empty($url)) {
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        jsonResponse(['error' => 'Invalid URL format'], 400);
    }
    
    $parsedUrl = parse_url($url);
    if ($parsedUrl['scheme'] !== 'https') {
        jsonResponse(['error' => 'Only HTTPS URLs are allowed'], 400);
    }
    
    if (!isset($parsedUrl['host']) || (strpos($parsedUrl['host'], 'google.com') === false && strpos($parsedUrl['host'], 'googleapis.com') === false)) {
        jsonResponse(['error' => 'Only Google Calendar URLs are allowed'], 400);
    }
}

// Auto-enable when a valid URL is provided
$enabled = (bool)($input['enabled'] ?? false);
if (!empty($url)) {
    $enabled = true; // Always enable if URL is set
}

$config = [
    'enabled' => $enabled,
    'googleCalendarUrl' => $url,
    'updatedAt' => date('c'),
];

$configFile = DATA_DIR . 'calendar_config.json';

if (writeJsonFile($configFile, $config)) {
    // Also trigger a cache refresh when saving valid config
    if ($enabled && !empty($url)) {
        // Clear old cache
        $cacheFile = DATA_DIR . 'calendar_cache.json';
        if (file_exists($cacheFile)) {
            unlink($cacheFile);
        }
    }
    jsonResponse(['success' => true, 'enabled' => $enabled]);
} else {
    jsonResponse(['error' => 'Failed to save configuration'], 500);
}

