<?php
/**
 * Registrations API - Unregister from activity
 * POST endpoint for activity unregistration
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

// Load existing registrations
$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

// Check if activity exists
if (!isset($registrations[$activityId])) {
    jsonResponse([
        'success' => true,
        'message' => 'Not registered',
        'activityId' => $activityId,
        'registrationCount' => 0,
    ]);
}

// Find and remove registration
$participants = &$registrations[$activityId]['participants'];
$removed = false;
foreach ($participants as $key => $participant) {
    if ($participant['userId'] === $userId) {
        unset($participants[$key]);
        $removed = true;
        break;
    }
}

// Re-index array
$registrations[$activityId]['participants'] = array_values($participants);
$registrations[$activityId]['count'] = count($registrations[$activityId]['participants']);

// Save registrations
if (writeJsonFile($registrationsFile, $registrations)) {
    jsonResponse([
        'success' => true,
        'message' => $removed ? 'Successfully unregistered' : 'Was not registered',
        'activityId' => $activityId,
        'registrationCount' => $registrations[$activityId]['count'],
    ]);
} else {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to save unregistration'], 500);
}

