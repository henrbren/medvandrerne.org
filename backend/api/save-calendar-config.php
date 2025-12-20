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

$config = [
    'enabled' => (bool)($input['enabled'] ?? false),
    'googleCalendarUrl' => $url,
];

$configFile = DATA_DIR . 'calendar_config.json';

if (writeJsonFile($configFile, $config)) {
    jsonResponse(['success' => true]);
} else {
    jsonResponse(['error' => 'Failed to save configuration'], 500);
}
