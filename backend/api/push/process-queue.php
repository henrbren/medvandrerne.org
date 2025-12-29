<?php
/**
 * Push Notifications API - Process notification queue
 * GET endpoint to process queued push notifications (called by cron or manually)
 */
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

// Load push queue
$pushQueueFile = DATA_DIR . 'push_queue.json';
$pushQueue = readJsonFile($pushQueueFile, []);

// Filter unprocessed notifications
$unprocessed = array_filter($pushQueue, function($item) {
    return !$item['processed'];
});

if (empty($unprocessed)) {
    jsonResponse([
        'success' => true,
        'message' => 'No pending notifications',
        'processedCount' => 0,
    ]);
}

// Load push tokens and registrations
$tokensFile = DATA_DIR . 'push_tokens.json';
$allTokens = readJsonFile($tokensFile, []);

$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

$processedCount = 0;
$results = [];

foreach ($unprocessed as &$notification) {
    $activityId = $notification['activityId'];
    
    // Get participants for this activity
    $targetUserIds = [];
    if (isset($registrations[$activityId])) {
        foreach ($registrations[$activityId]['participants'] as $participant) {
            $targetUserIds[] = $participant['userId'];
        }
    }
    
    if (empty($targetUserIds)) {
        $notification['processed'] = true;
        $notification['processedAt'] = date('c');
        $notification['result'] = 'No participants';
        $processedCount++;
        continue;
    }
    
    // Collect push tokens
    $pushTokens = [];
    foreach ($targetUserIds as $userId) {
        if (isset($allTokens[$userId])) {
            foreach ($allTokens[$userId] as $tokenData) {
                if (strpos($tokenData['token'], 'ExponentPushToken') === 0) {
                    $pushTokens[] = $tokenData['token'];
                }
            }
        }
    }
    
    $pushTokens = array_unique($pushTokens);
    
    if (empty($pushTokens)) {
        $notification['processed'] = true;
        $notification['processedAt'] = date('c');
        $notification['result'] = 'No push tokens';
        $processedCount++;
        continue;
    }
    
    // Prepare messages
    $messages = [];
    foreach ($pushTokens as $token) {
        $messages[] = [
            'to' => $token,
            'sound' => 'default',
            'title' => $notification['title'],
            'body' => $notification['body'],
            'data' => [
                'type' => $notification['type'],
                'activityId' => $activityId,
                'messageId' => $notification['messageId'] ?? null,
            ],
            'priority' => $notification['priority'] === 'urgent' ? 'high' : 'default',
        ];
    }
    
    // Send to Expo
    $sendResult = sendExpoPushNotifications($messages);
    
    $notification['processed'] = true;
    $notification['processedAt'] = date('c');
    $notification['result'] = $sendResult;
    $notification['sentTo'] = count($pushTokens);
    
    $results[] = [
        'notificationId' => $notification['id'],
        'sentTo' => count($pushTokens),
    ];
    
    $processedCount++;
}

// Update processed notifications in queue
foreach ($pushQueue as $key => &$item) {
    foreach ($unprocessed as $processed) {
        if ($item['id'] === $processed['id']) {
            $pushQueue[$key] = $processed;
        }
    }
}

// Clean up old processed notifications (keep last 100)
$pushQueue = array_filter($pushQueue, function($item) {
    if (!$item['processed']) return true;
    $processedAt = strtotime($item['processedAt'] ?? 0);
    return (time() - $processedAt) < (7 * 24 * 60 * 60); // Keep for 7 days
});

$pushQueue = array_slice(array_values($pushQueue), -100);

writeJsonFile($pushQueueFile, $pushQueue);

jsonResponse([
    'success' => true,
    'message' => 'Queue processed',
    'processedCount' => $processedCount,
    'results' => $results,
]);

/**
 * Send push notifications via Expo's push service
 */
function sendExpoPushNotifications($messages) {
    $url = 'https://exp.host/--/api/v2/push/send';
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Accept-Encoding: gzip, deflate',
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($messages),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        error_log('Expo push error: ' . $error);
        return ['error' => $error];
    }
    
    return [
        'httpCode' => $httpCode,
        'response' => json_decode($response, true),
    ];
}

