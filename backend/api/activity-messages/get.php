<?php
/**
 * Activity Messages API - Get messages
 * GET endpoint to fetch messages for an activity
 */
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

// Get activity ID from query parameter
$activityId = $_GET['activityId'] ?? null;

if (!$activityId) {
    http_response_code(400);
    jsonResponse(['error' => 'Activity ID is required'], 400);
}

$activityId = (string)$activityId;

// Load messages
$messagesFile = DATA_DIR . 'activity_messages.json';
$allMessages = readJsonFile($messagesFile, []);

// Get messages for this activity
$activityMessages = $allMessages[$activityId] ?? [];

// Optional: filter by user to get unread count
$userId = $_GET['userId'] ?? null;
$unreadCount = 0;

if ($userId) {
    foreach ($activityMessages as $msg) {
        if (!in_array($userId, $msg['readBy'] ?? [])) {
            $unreadCount++;
        }
    }
}

jsonResponse([
    'success' => true,
    'activityId' => $activityId,
    'messages' => $activityMessages,
    'totalCount' => count($activityMessages),
    'unreadCount' => $unreadCount,
]);

