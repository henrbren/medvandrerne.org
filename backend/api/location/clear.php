<?php
/**
 * Clear User Location API
 * POST /api/location/clear.php
 * Header: Authorization: Bearer <token>
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
$userIndex = -1;
foreach ($users as $index => $user) {
    if ($user['authToken'] === $token) {
        if (strtotime($user['tokenExpiry']) < time()) {
            jsonResponse(['error' => 'Token utløpt, logg inn på nytt'], 401);
        }
        $userIndex = $index;
        break;
    }
}

if ($userIndex === -1) {
    jsonResponse(['error' => 'Ugyldig token'], 401);
}

// Clear user's location
$users[$userIndex]['location'] = [
    'latitude' => null,
    'longitude' => null,
    'updatedAt' => date('c'),
    'sharing' => false,
];

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke slette posisjon'], 500);
}

jsonResponse([
    'success' => true,
    'message' => 'Posisjonsdeling slått av',
]);
