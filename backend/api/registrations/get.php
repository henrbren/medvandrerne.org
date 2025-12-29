<?php
/**
 * Registrations API - Get registrations for activity
 * GET endpoint for fetching activity registrations
 */
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

// Get activity ID from query parameter
$activityId = $_GET['activityId'] ?? null;

// Load existing registrations
$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

// If no activity ID, return all registration counts
if (!$activityId) {
    $counts = [];
    foreach ($registrations as $id => $data) {
        $counts[$id] = $data['count'] ?? 0;
    }
    jsonResponse([
        'success' => true,
        'registrationCounts' => $counts,
    ]);
}

// Check if activity exists
if (!isset($registrations[$activityId])) {
    jsonResponse([
        'success' => true,
        'activityId' => $activityId,
        'registrationCount' => 0,
        'participants' => [],
    ]);
}

// Return activity registrations
jsonResponse([
    'success' => true,
    'activityId' => $activityId,
    'registrationCount' => $registrations[$activityId]['count'],
    'participants' => $registrations[$activityId]['participants'],
]);

