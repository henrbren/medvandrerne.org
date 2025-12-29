<?php
/**
 * Push Notifications API - Register device token
 * POST endpoint to register Expo push token for a user
 */
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Read request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['userId']) || empty($data['userId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'User ID is required'], 400);
}

if (!isset($data['pushToken']) || empty($data['pushToken'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Push token is required'], 400);
}

$userId = $data['userId'];
$pushToken = $data['pushToken'];
$deviceType = $data['deviceType'] ?? 'unknown'; // ios, android, web
$deviceInfo = $data['deviceInfo'] ?? null;
$timestamp = date('c');

// Load existing tokens
$tokensFile = DATA_DIR . 'push_tokens.json';
$tokens = readJsonFile($tokensFile, []);

// Check if token already exists for another user - remove it
foreach ($tokens as $uid => &$userTokens) {
    $userTokens = array_filter($userTokens, function($t) use ($pushToken) {
        return $t['token'] !== $pushToken;
    });
    $userTokens = array_values($userTokens);
}

// Initialize user's tokens array if not exists
if (!isset($tokens[$userId])) {
    $tokens[$userId] = [];
}

// Check if this exact token exists for this user
$tokenExists = false;
foreach ($tokens[$userId] as &$existingToken) {
    if ($existingToken['token'] === $pushToken) {
        // Update last seen
        $existingToken['lastSeen'] = $timestamp;
        $tokenExists = true;
        break;
    }
}

// Add new token if not exists
if (!$tokenExists) {
    $tokens[$userId][] = [
        'token' => $pushToken,
        'deviceType' => $deviceType,
        'deviceInfo' => $deviceInfo,
        'registeredAt' => $timestamp,
        'lastSeen' => $timestamp,
    ];
}

// Limit to 5 tokens per user (remove oldest)
if (count($tokens[$userId]) > 5) {
    usort($tokens[$userId], function($a, $b) {
        return strtotime($b['lastSeen']) - strtotime($a['lastSeen']);
    });
    $tokens[$userId] = array_slice($tokens[$userId], 0, 5);
}

// Save tokens
if (!writeJsonFile($tokensFile, $tokens)) {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to save token'], 500);
}

jsonResponse([
    'success' => true,
    'message' => 'Token registered successfully',
]);

