<?php
/**
 * Get Location Sharing Status API
 * GET /api/location/status.php
 * Header: Authorization: Bearer <token>
 * 
 * Returns the current user's location sharing status
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

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

// Get location status
$location = $currentUser['location'] ?? null;
$isSharing = $location && $location['sharing'] === true;

$response = [
    'success' => true,
    'sharing' => $isSharing,
];

if ($isSharing && $location) {
    $response['location'] = [
        'latitude' => $location['latitude'],
        'longitude' => $location['longitude'],
        'updatedAt' => $location['updatedAt'],
    ];
    
    // Calculate how fresh the location is
    $ageSeconds = time() - strtotime($location['updatedAt']);
    $response['ageMinutes'] = round($ageSeconds / 60);
    $response['isRecent'] = $ageSeconds <= (30 * 60); // Within 30 minutes
}

jsonResponse($response);
