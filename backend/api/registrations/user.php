<?php
/**
 * Registrations API - Get user's registrations
 * GET endpoint for fetching all registrations for a specific user
 */
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

// Get user ID from query parameter
$userId = $_GET['userId'] ?? null;

if (!$userId) {
    http_response_code(400);
    jsonResponse(['error' => 'User ID is required'], 400);
}

// Load existing registrations
$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

// Find all activities the user is registered for
$userRegistrations = [];

foreach ($registrations as $activityId => $data) {
    foreach ($data['participants'] as $participant) {
        if ($participant['userId'] === $userId) {
            $userRegistrations[] = [
                'activityId' => $activityId,
                'registeredAt' => $participant['registeredAt'],
            ];
            break;
        }
    }
}

jsonResponse([
    'success' => true,
    'userId' => $userId,
    'registrations' => $userRegistrations,
    'count' => count($userRegistrations),
]);

