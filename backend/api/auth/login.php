<?php
/**
 * User Login API
 * POST /api/auth/login.php
 * Body: { "phone": "+4712345678" }
 * 
 * Creates user if not exists, generates auth token
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['phone']) || empty($input['phone'])) {
    jsonResponse(['error' => 'Telefonnummer er påkrevd'], 400);
}

// Normalize phone number (remove spaces, ensure +47 prefix for Norwegian numbers)
$phone = preg_replace('/\s+/', '', $input['phone']);
if (!preg_match('/^\+/', $phone)) {
    $phone = '+47' . ltrim($phone, '0');
}

// Validate phone format
if (!preg_match('/^\+\d{10,15}$/', $phone)) {
    jsonResponse(['error' => 'Ugyldig telefonnummer'], 400);
}

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find existing user or create new
$userIndex = -1;
foreach ($users as $index => $user) {
    if ($user['phone'] === $phone) {
        $userIndex = $index;
        break;
    }
}

// Generate secure token
$token = bin2hex(random_bytes(32));
$tokenExpiry = date('Y-m-d H:i:s', strtotime('+7 days'));

if ($userIndex === -1) {
    // Create new user
    $newUser = [
        'id' => 'usr_' . bin2hex(random_bytes(8)),
        'phone' => $phone,
        'name' => '',
        'email' => '',
        'memberSince' => date('Y-m-d'),
        'level' => 1,
        'levelName' => USER_LEVELS[1]['name'],
        'totalPoints' => 0,
        'completedActivities' => 0,
        'completedExpeditions' => 0,
        'skills' => [],
        'badges' => [],
        'reflections' => [],
        'lastActive' => date('Y-m-d'),
        'authToken' => $token,
        'tokenExpiry' => $tokenExpiry,
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];
    $users[] = $newUser;
    $user = $newUser;
} else {
    // Update existing user with new token
    $users[$userIndex]['authToken'] = $token;
    $users[$userIndex]['tokenExpiry'] = $tokenExpiry;
    $users[$userIndex]['lastActive'] = date('Y-m-d');
    $users[$userIndex]['updatedAt'] = date('c');
    $user = $users[$userIndex];
}

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke lagre brukerdata'], 500);
}

// Return user data (without sensitive fields)
$responseUser = $user;
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'message' => $userIndex === -1 ? 'Ny bruker opprettet' : 'Innlogget',
    'token' => $token,
    'user' => $responseUser,
]);
