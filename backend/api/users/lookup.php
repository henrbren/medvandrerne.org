<?php
/**
 * Lookup Users by Phone Numbers API
 * POST /api/users/lookup.php
 * Body: { "phoneNumbers": ["+4712345678", "+4798765432"] }
 * 
 * Returns public user data for contacts (no sensitive info)
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

if (!$input || !isset($input['phoneNumbers']) || !is_array($input['phoneNumbers'])) {
    jsonResponse(['error' => 'phoneNumbers array er påkrevd'], 400);
}

$phoneNumbers = $input['phoneNumbers'];

if (count($phoneNumbers) === 0) {
    jsonResponse(['success' => true, 'users' => []]);
}

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find matching users
$matchedUsers = [];

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

foreach ($users as $user) {
    if (in_array($user['phone'], $phoneNumbers)) {
        // Recalculate level from points to ensure consistency
        $totalPoints = $user['totalPoints'] ?? 0;
        $calculatedLevel = calculateLevel($totalPoints);
        
        // Return only public data
        $publicUser = [
            'id' => $user['id'],
            'phone' => $user['phone'],
            'email' => $user['email'] ?? null,
            'name' => $user['name'] ?? null,
            'avatarUrl' => $user['avatarUrl'] ?? null,
            'level' => $calculatedLevel['level'],
            'levelName' => $calculatedLevel['levelName'],
            'totalPoints' => $totalPoints,
            'completedActivities' => $user['completedActivities'] ?? 0,
            'completedExpeditions' => $user['completedExpeditions'] ?? 0,
            'memberSince' => $user['memberSince'] ?? $user['createdAt'] ?? null,
        ];

        // Include location if sharing is enabled
        if (isset($user['location']) && $user['location']['sharing'] === true) {
            $publicUser['location'] = [
                'latitude' => $user['location']['latitude'],
                'longitude' => $user['location']['longitude'],
                'updatedAt' => $user['location']['updatedAt'],
                'sharing' => true,
            ];
        } else {
            $publicUser['location'] = null;
        }

        $matchedUsers[] = $publicUser;
    }
}

jsonResponse([
    'success' => true,
    'users' => $matchedUsers,
    'found' => count($matchedUsers),
    'requested' => count($phoneNumbers),
]);
