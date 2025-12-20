<?php
/**
 * User Logout API
 * POST /api/auth/logout.php
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
    jsonResponse(['success' => true, 'message' => 'Logget ut']);
}

$token = $matches[1];

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find and clear user token
$updated = false;
foreach ($users as $index => $user) {
    if ($user['authToken'] === $token) {
        $users[$index]['authToken'] = null;
        $users[$index]['tokenExpiry'] = null;
        $updated = true;
        break;
    }
}

// Save if updated
if ($updated) {
    writeJsonFile(JSON_USERS, $users);
}

jsonResponse([
    'success' => true,
    'message' => 'Logget ut',
]);
