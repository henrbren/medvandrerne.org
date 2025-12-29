<?php
/**
 * Activity Invitations API - Mark invitation as seen
 * POST endpoint to mark an invitation as seen/read
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
if (!isset($data['invitationId']) || empty($data['invitationId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Invitation ID is required'], 400);
}

if (!isset($data['userId']) || empty($data['userId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'User ID is required'], 400);
}

$invitationId = $data['invitationId'];
$userId = $data['userId'];
$timestamp = date('c');

// Load invitations
$invitationsFile = DATA_DIR . 'activity_invitations.json';
$invitations = readJsonFile($invitationsFile, []);

// Find and update the invitation
$found = false;
$invitation = null;

foreach ($invitations as &$inv) {
    if ($inv['id'] === $invitationId) {
        // Verify the user is the recipient
        if ($inv['recipientId'] !== $userId) {
            http_response_code(403);
            jsonResponse(['error' => 'You are not the recipient of this invitation'], 403);
        }
        
        // Mark as seen (only if not already seen)
        if (!$inv['seenAt']) {
            $inv['seenAt'] = $timestamp;
        }
        
        $invitation = $inv;
        $found = true;
        break;
    }
}

if (!$found) {
    http_response_code(404);
    jsonResponse(['error' => 'Invitation not found'], 404);
}

// Save invitations
if (!writeJsonFile($invitationsFile, $invitations)) {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to update invitation'], 500);
}

jsonResponse([
    'success' => true,
    'invitation' => $invitation,
]);

