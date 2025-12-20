<?php
/**
 * Get Current User API
 * GET /api/auth/me.php
 * Header: Authorization: Bearer <token>
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

// Return user data (without sensitive fields)
$responseUser = $currentUser;
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'user' => $responseUser,
]);
