<?php
/**
 * Registrations API - Register for activity
 * POST endpoint for activity registration
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
if (!isset($data['activityId']) || empty($data['activityId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Activity ID is required'], 400);
}

if (!isset($data['userId']) || empty($data['userId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'User ID is required'], 400);
}

$activityId = $data['activityId'];
$userId = $data['userId'];
$userName = $data['userName'] ?? 'Anonym';
$userAvatar = $data['userAvatar'] ?? null;
$timestamp = date('c');

// Load existing registrations
$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

// Check if activity exists in registrations
if (!isset($registrations[$activityId])) {
    $registrations[$activityId] = [
        'participants' => [],
        'count' => 0,
    ];
}

// Check if already registered
$alreadyRegistered = false;
foreach ($registrations[$activityId]['participants'] as $participant) {
    if ($participant['userId'] === $userId) {
        $alreadyRegistered = true;
        break;
    }
}

if ($alreadyRegistered) {
    jsonResponse([
        'success' => true,
        'message' => 'Already registered',
        'activityId' => $activityId,
        'registrationCount' => $registrations[$activityId]['count'],
    ]);
}

// Add registration
$registrations[$activityId]['participants'][] = [
    'userId' => $userId,
    'userName' => $userName,
    'userAvatar' => $userAvatar,
    'registeredAt' => $timestamp,
];
$registrations[$activityId]['count'] = count($registrations[$activityId]['participants']);

// Save registrations
if (writeJsonFile($registrationsFile, $registrations)) {
    jsonResponse([
        'success' => true,
        'message' => 'Successfully registered',
        'activityId' => $activityId,
        'registrationCount' => $registrations[$activityId]['count'],
    ]);
} else {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to save registration'], 500);
}

