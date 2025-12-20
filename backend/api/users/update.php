<?php
/**
 * Update User Profile API
 * PUT /api/users/update.php
 * Header: Authorization: Bearer <token>
 * Body: { "name": "...", "email": "..." }
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Allow PUT and POST
if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST'])) {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get token from header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    jsonResponse(['error' => 'Ingen gyldig autorisasjon'], 401);
}

$token = $matches[1];

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    jsonResponse(['error' => 'Ugyldig data'], 400);
}

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

// Allowed fields to update
$allowedFields = ['name', 'email'];

foreach ($allowedFields as $field) {
    if (isset($input[$field])) {
        // Validate email if provided
        if ($field === 'email' && !empty($input[$field])) {
            if (!filter_var($input[$field], FILTER_VALIDATE_EMAIL)) {
                jsonResponse(['error' => 'Ugyldig e-postadresse'], 400);
            }
        }
        $users[$userIndex][$field] = $input[$field];
    }
}

$users[$userIndex]['updatedAt'] = date('c');

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke lagre profil'], 500);
}

// Return updated user (without sensitive fields)
$responseUser = $users[$userIndex];
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'message' => 'Profil oppdatert',
    'user' => $responseUser,
]);
