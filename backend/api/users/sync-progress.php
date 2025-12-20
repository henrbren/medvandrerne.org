<?php
/**
 * Sync User Progress API
 * POST /api/users/sync-progress.php
 * Header: Authorization: Bearer <token>
 * Body: {
 *   "totalPoints": 1500,
 *   "completedActivities": 20,
 *   "completedExpeditions": 5,
 *   "skills": [...],
 *   "reflections": [...],
 *   "badges": [...]
 * }
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

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

// Update progress fields
$progressFields = ['totalPoints', 'completedActivities', 'completedExpeditions', 'skills', 'reflections', 'badges'];

foreach ($progressFields as $field) {
    if (isset($input[$field])) {
        $users[$userIndex][$field] = $input[$field];
    }
}

// Calculate level based on total points
$totalPoints = $users[$userIndex]['totalPoints'] ?? 0;
$userLevel = 1;
$userLevelName = USER_LEVELS[1]['name'];

foreach (USER_LEVELS as $level => $config) {
    if ($totalPoints >= $config['minPoints']) {
        $userLevel = $level;
        $userLevelName = $config['name'];
    }
}

$users[$userIndex]['level'] = $userLevel;
$users[$userIndex]['levelName'] = $userLevelName;
$users[$userIndex]['lastActive'] = date('Y-m-d');
$users[$userIndex]['updatedAt'] = date('c');

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke lagre fremgang'], 500);
}

// Return updated user (without sensitive fields)
$responseUser = $users[$userIndex];
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'message' => 'Fremgang synkronisert',
    'user' => $responseUser,
]);
