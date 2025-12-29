<?php
/**
 * Activity Messages API - Create message
 * POST endpoint for admin to create messages for activity participants
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

if (!isset($data['title']) || empty($data['title'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Title is required'], 400);
}

if (!isset($data['message']) || empty($data['message'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Message content is required'], 400);
}

$activityId = (string)$data['activityId'];
$title = trim($data['title']);
$message = trim($data['message']);
$authorName = $data['authorName'] ?? 'Admin';
$authorId = $data['authorId'] ?? 'system';
$priority = $data['priority'] ?? 'normal'; // normal, important, urgent
$timestamp = date('c');
$messageId = 'msg_' . uniqid() . '_' . substr(md5($timestamp . $activityId), 0, 8);

// Load existing messages
$messagesFile = DATA_DIR . 'activity_messages.json';
$allMessages = readJsonFile($messagesFile, []);

// Initialize activity messages if not exists
if (!isset($allMessages[$activityId])) {
    $allMessages[$activityId] = [];
}

// Create message object
$newMessage = [
    'id' => $messageId,
    'activityId' => $activityId,
    'title' => $title,
    'message' => $message,
    'authorName' => $authorName,
    'authorId' => $authorId,
    'priority' => $priority,
    'createdAt' => $timestamp,
    'readBy' => [],
];

// Add to beginning of array (newest first)
array_unshift($allMessages[$activityId], $newMessage);

// Save messages
if (!writeJsonFile($messagesFile, $allMessages)) {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to save message'], 500);
}

// Queue push notification for participants
$pushQueueFile = DATA_DIR . 'push_queue.json';
$pushQueue = readJsonFile($pushQueueFile, []);

$pushQueue[] = [
    'id' => 'push_' . uniqid(),
    'type' => 'activity_message',
    'activityId' => $activityId,
    'messageId' => $messageId,
    'title' => $title,
    'body' => mb_substr($message, 0, 100) . (mb_strlen($message) > 100 ? '...' : ''),
    'priority' => $priority,
    'createdAt' => $timestamp,
    'processed' => false,
];

writeJsonFile($pushQueueFile, $pushQueue);

jsonResponse([
    'success' => true,
    'message' => 'Message created successfully',
    'messageId' => $messageId,
    'data' => $newMessage,
]);

