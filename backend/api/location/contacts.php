<?php
/**
 * Get Contact Locations API
 * POST /api/location/contacts.php
 * Body: { "contactIds": ["usr_123", "usr_456"] }
 * OR
 * Body: { "phoneNumbers": ["+4712345678", "+4798765432"] }
 * 
 * Returns locations for contacts that are sharing their location
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

// Prevent caching - always return fresh data
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: 0');

// Clear PHP file caches
clearstatcache(true);

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    jsonResponse(['error' => 'Ugyldig data'], 400);
}

$contactIds = $input['contactIds'] ?? [];
$phoneNumbers = $input['phoneNumbers'] ?? [];

if (empty($contactIds) && empty($phoneNumbers)) {
    jsonResponse(['success' => true, 'locations' => []]);
}

// Read users
$users = readJsonFile(JSON_USERS, []);

// Helper function to calculate level from points (must match frontend thresholds)
function calculateLevel($points) {
    $level = 1;
    $levelName = USER_LEVELS[1]['name'];
    
    foreach (USER_LEVELS as $lvl => $config) {
        if ($points >= $config['minPoints']) {
            $level = $lvl;
            $levelName = $config['name'];
        }
    }
    
    return ['level' => $level, 'levelName' => $levelName];
}

// Find matching users with location sharing enabled
$locations = [];

foreach ($users as $user) {
    $isMatch = false;
    
    // Check by ID
    if (!empty($contactIds) && in_array($user['id'], $contactIds)) {
        $isMatch = true;
    }
    
    // Check by phone
    if (!empty($phoneNumbers) && in_array($user['phone'], $phoneNumbers)) {
        $isMatch = true;
    }
    
    if ($isMatch && isset($user['location']) && $user['location']['sharing'] === true) {
        // Check if location is not too old (within last 24 hours)
        $locationAge = time() - strtotime($user['location']['updatedAt']);
        $maxAge = 24 * 60 * 60; // 24 hours
        
        if ($locationAge <= $maxAge && $user['location']['latitude'] && $user['location']['longitude']) {
            // Recalculate level from points to ensure consistency
            $totalPoints = $user['totalPoints'] ?? 0;
            $calculatedLevel = calculateLevel($totalPoints);
            
            $locations[] = [
                'userId' => $user['id'],
                'phone' => $user['phone'],
                'name' => $user['name'] ?? 'Medvandrer',
                'avatarUrl' => $user['avatarUrl'] ?? null,
                'level' => $calculatedLevel['level'],
                'levelName' => $calculatedLevel['levelName'],
                'latitude' => $user['location']['latitude'],
                'longitude' => $user['location']['longitude'],
                'updatedAt' => $user['location']['updatedAt'],
                'isRecent' => $locationAge <= (30 * 60), // Within last 30 minutes
            ];
        }
    }
}

jsonResponse([
    'success' => true,
    'locations' => $locations,
    'count' => count($locations),
]);
