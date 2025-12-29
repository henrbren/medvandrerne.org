<?php
/**
 * Activity Messages API - Delete message
 * POST endpoint for admin to delete messages
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

if (!isset($data['messageId']) || empty($data['messageId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Message ID is required'], 400);
}

$activityId = (string)$data['activityId'];
$messageId = $data['messageId'];

// Load messages
$messagesFile = DATA_DIR . 'activity_messages.json';
$allMessages = readJsonFile($messagesFile, []);

if (!isset($allMessages[$activityId])) {
    http_response_code(404);
    jsonResponse(['error' => 'Activity not found'], 404);
}

// Find and remove message
$found = false;
foreach ($allMessages[$activityId] as $key => $msg) {
    if ($msg['id'] === $messageId) {
        unset($allMessages[$activityId][$key]);
        $found = true;
        break;
    }
}

if (!$found) {
    http_response_code(404);
    jsonResponse(['error' => 'Message not found'], 404);
}

// Re-index array
$allMessages[$activityId] = array_values($allMessages[$activityId]);

// Save messages
if (!writeJsonFile($messagesFile, $allMessages)) {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to delete message'], 500);
}

jsonResponse([
    'success' => true,
    'message' => 'Message deleted successfully',
]);

