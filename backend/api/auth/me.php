<?php
/**
 * Get Current User API
 * GET /api/auth/me.php
 * Header: Authorization: Bearer <token>
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

// Prevent caching
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get token from header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    jsonResponse(['error' => 'Ingen gyldig autorisasjon'], 401);
}

$token = $matches[1];

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find user by token
$currentUser = null;
foreach ($users as $user) {
    if ($user['authToken'] === $token) {
        // Check if token is expired
        if (strtotime($user['tokenExpiry']) < time()) {
            jsonResponse(['error' => 'Token utløpt, logg inn på nytt'], 401);
        }
        $currentUser = $user;
        break;
    }
}

if (!$currentUser) {
    jsonResponse(['error' => 'Ugyldig token'], 401);
}

// Recalculate level from points to ensure consistency with frontend
$totalPoints = $currentUser['totalPoints'] ?? 0;
$calculatedLevel = 1;
$calculatedLevelName = USER_LEVELS[1]['name'];

foreach (USER_LEVELS as $lvl => $config) {
    if ($totalPoints >= $config['minPoints']) {
        $calculatedLevel = $lvl;
        $calculatedLevelName = $config['name'];
    }
}

// Update level if it doesn't match
if ($currentUser['level'] !== $calculatedLevel || $currentUser['levelName'] !== $calculatedLevelName) {
    error_log('me.php - Fixing level inconsistency: ' . ($currentUser['levelName'] ?? 'unknown') . ' (L' . ($currentUser['level'] ?? '?') . ') -> ' . $calculatedLevelName . ' (L' . $calculatedLevel . ') for ' . $totalPoints . ' points');
    
    $users = readJsonFile(JSON_USERS, []);
    foreach ($users as $index => $u) {
        if ($u['authToken'] === $token) {
            $users[$index]['level'] = $calculatedLevel;
            $users[$index]['levelName'] = $calculatedLevelName;
            writeJsonFile(JSON_USERS, $users);
            $currentUser = $users[$index];
            break;
        }
    }
}

// Fix any tier/tierName inconsistency
if (isset($currentUser['membership']) && isset($currentUser['membership']['tier'])) {
    $tier = $currentUser['membership']['tier'];
    $expectedTierName = MEMBERSHIP_TIERS[$tier]['name'] ?? null;
    
    // If tierName doesn't match the tier, fix it
    if ($expectedTierName && $currentUser['membership']['tierName'] !== $expectedTierName) {
        error_log('me.php - Fixing tierName inconsistency: ' . $currentUser['membership']['tierName'] . ' -> ' . $expectedTierName);
        
        // Update the user in the database
        $users = readJsonFile(JSON_USERS, []);
        foreach ($users as $index => $u) {
            if ($u['authToken'] === $token) {
                $users[$index]['membership']['tierName'] = $expectedTierName;
                $users[$index]['membership']['price'] = MEMBERSHIP_TIERS[$tier]['price'] ?? $users[$index]['membership']['price'];
                writeJsonFile(JSON_USERS, $users);
                $currentUser = $users[$index];
                break;
            }
        }
    }
}

// Return user data (without sensitive fields)
$responseUser = $currentUser;
$responseUser['level'] = $calculatedLevel;
$responseUser['levelName'] = $calculatedLevelName;
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'user' => $responseUser,
]);
