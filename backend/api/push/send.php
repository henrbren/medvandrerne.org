<?php
/**
 * Push Notifications API - Send push notifications
 * POST endpoint to send push notifications (admin only)
 * Supports sending to activity participants or specific users
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
if (!isset($data['title']) || empty($data['title'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Title is required'], 400);
}

if (!isset($data['body']) || empty($data['body'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Body is required'], 400);
}

$title = $data['title'];
$body = $data['body'];
$additionalData = $data['data'] ?? [];
$activityId = $data['activityId'] ?? null;
$userIds = $data['userIds'] ?? null;

// Load push tokens
$tokensFile = DATA_DIR . 'push_tokens.json';
$allTokens = readJsonFile($tokensFile, []);

// Determine target users
$targetUserIds = [];

if ($activityId) {
    // Get participants from registrations
    $registrationsFile = DATA_DIR . 'registrations.json';
    $registrations = readJsonFile($registrationsFile, []);
    
    if (isset($registrations[$activityId])) {
        foreach ($registrations[$activityId]['participants'] as $participant) {
            $targetUserIds[] = $participant['userId'];
        }
    }
} elseif ($userIds) {
    $targetUserIds = $userIds;
} else {
    http_response_code(400);
    jsonResponse(['error' => 'Either activityId or userIds is required'], 400);
}

if (empty($targetUserIds)) {
    jsonResponse([
        'success' => true,
        'message' => 'No recipients found',
        'sentCount' => 0,
    ]);
}

// Collect push tokens for target users
$pushTokens = [];
foreach ($targetUserIds as $userId) {
    if (isset($allTokens[$userId])) {
        foreach ($allTokens[$userId] as $tokenData) {
            $pushTokens[] = $tokenData['token'];
        }
    }
}

$pushTokens = array_unique($pushTokens);

if (empty($pushTokens)) {
    jsonResponse([
        'success' => true,
        'message' => 'No push tokens registered for recipients',
        'sentCount' => 0,
    ]);
}

// Prepare Expo push messages
$messages = [];
foreach ($pushTokens as $token) {
    // Validate token format (Expo push tokens start with ExponentPushToken)
    if (strpos($token, 'ExponentPushToken') !== 0) {
        continue;
    }
    
    $messages[] = [
        'to' => $token,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => array_merge($additionalData, [
            'activityId' => $activityId,
        ]),
    ];
}

if (empty($messages)) {
    jsonResponse([
        'success' => true,
        'message' => 'No valid push tokens found',
        'sentCount' => 0,
    ]);
}

// Send to Expo push service
$result = sendExpoPushNotifications($messages);

jsonResponse([
    'success' => true,
    'message' => 'Push notifications sent',
    'sentCount' => count($messages),
    'targetUsers' => count($targetUserIds),
    'result' => $result,
]);

/**
 * Send push notifications via Expo's push service
 */
function sendExpoPushNotifications($messages) {
    $url = 'https://exp.host/--/api/v2/push/send';
    
    // Split into chunks of 100 (Expo's limit)
    $chunks = array_chunk($messages, 100);
    $results = [];
    
    foreach ($chunks as $chunk) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Accept-Encoding: gzip, deflate',
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode($chunk),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log('Expo push error: ' . $error);
            $results[] = ['error' => $error];
        } else {
            $decoded = json_decode($response, true);
            $results[] = [
                'httpCode' => $httpCode,
                'response' => $decoded,
            ];
        }
    }
    
    return $results;
}

