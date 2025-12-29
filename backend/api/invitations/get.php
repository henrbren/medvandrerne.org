<?php
/**
 * Activity Invitations API - Get invitations
 * GET endpoint to retrieve invitations for a user
 * Supports getting:
 * - received: Invitations sent to the user
 * - sent: Invitations sent by the user
 * - all: Both received and sent
 */
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get parameters
$userId = $_GET['userId'] ?? null;
$type = $_GET['type'] ?? 'received'; // received, sent, all
$status = $_GET['status'] ?? null; // pending, accepted, declined, expired, or null for all
$activityId = $_GET['activityId'] ?? null;

if (!$userId) {
    http_response_code(400);
    jsonResponse(['error' => 'User ID is required'], 400);
}

// Load invitations
$invitationsFile = DATA_DIR . 'activity_invitations.json';
$allInvitations = readJsonFile($invitationsFile, []);

// Filter invitations
$result = [
    'received' => [],
    'sent' => [],
];

foreach ($allInvitations as $invitation) {
    // Filter by activity if specified
    if ($activityId && $invitation['activityId'] !== $activityId) {
        continue;
    }
    
    // Filter by status if specified
    if ($status && $invitation['status'] !== $status) {
        continue;
    }
    
    // Categorize by received or sent
    if ($invitation['recipientId'] === $userId) {
        $result['received'][] = $invitation;
    }
    if ($invitation['senderId'] === $userId) {
        $result['sent'][] = $invitation;
    }
}

// Sort by creation date (newest first)
usort($result['received'], function($a, $b) {
    return strtotime($b['createdAt']) - strtotime($a['createdAt']);
});
usort($result['sent'], function($a, $b) {
    return strtotime($b['createdAt']) - strtotime($a['createdAt']);
});

// Return based on type parameter
$response = [
    'success' => true,
    'userId' => $userId,
];

switch ($type) {
    case 'received':
        $response['invitations'] = $result['received'];
        $response['count'] = count($result['received']);
        $response['pendingCount'] = count(array_filter($result['received'], fn($i) => $i['status'] === 'pending'));
        break;
    case 'sent':
        $response['invitations'] = $result['sent'];
        $response['count'] = count($result['sent']);
        break;
    case 'all':
    default:
        $response['received'] = $result['received'];
        $response['sent'] = $result['sent'];
        $response['receivedCount'] = count($result['received']);
        $response['sentCount'] = count($result['sent']);
        $response['pendingCount'] = count(array_filter($result['received'], fn($i) => $i['status'] === 'pending'));
        break;
}

jsonResponse($response);

