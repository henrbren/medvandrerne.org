<?php
/**
 * Activity Messages API - Mark message as read
 * POST endpoint to mark messages as read by user
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

$activityId = (string)$data['activityId'];
$userId = $data['userId'];
$messageIds = $data['messageIds'] ?? null; // If null, mark all as read

// Load messages
$messagesFile = DATA_DIR . 'activity_messages.json';
$allMessages = readJsonFile($messagesFile, []);

if (!isset($allMessages[$activityId])) {
    jsonResponse([
        'success' => true,
        'message' => 'No messages to mark as read',
        'markedCount' => 0,
    ]);
}

$markedCount = 0;

foreach ($allMessages[$activityId] as &$msg) {
    // If specific messageIds provided, only mark those
    if ($messageIds !== null && !in_array($msg['id'], $messageIds)) {
        continue;
    }
    
    // Add user to readBy if not already there
    if (!isset($msg['readBy'])) {
        $msg['readBy'] = [];
    }
    
    if (!in_array($userId, $msg['readBy'])) {
        $msg['readBy'][] = $userId;
        $markedCount++;
    }
}

// Save messages
if ($markedCount > 0) {
    writeJsonFile($messagesFile, $allMessages);
}

jsonResponse([
    'success' => true,
    'message' => 'Messages marked as read',
    'markedCount' => $markedCount,
]);

