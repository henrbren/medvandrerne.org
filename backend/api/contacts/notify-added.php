<?php
/**
 * Send push notification when someone adds you as a contact via QR code
 * POST /api/contacts/notify-added.php
 * 
 * Body:
 *   - targetUserId: The user who was added (will receive the notification)
 *   - addedByName: Name of the person who added them
 *   - addedByLevel: Level of the person who added them
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$targetUserId = $input['targetUserId'] ?? null;
$addedByName = $input['addedByName'] ?? 'En Medvandrer';
$addedByLevel = $input['addedByLevel'] ?? 1;
$addedById = $input['addedById'] ?? null;

if (!$targetUserId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'targetUserId is required']);
    exit;
}

// Get push tokens for target user
$tokensFile = DATA_DIR . 'push_tokens.json';
$allTokens = readJsonFile($tokensFile, []);

$userTokens = [];
if (isset($allTokens[$targetUserId])) {
    foreach ($allTokens[$targetUserId] as $tokenInfo) {
        if (strpos($tokenInfo['token'], 'ExponentPushToken') === 0) {
            $userTokens[] = $tokenInfo['token'];
        }
    }
}

$userTokens = array_unique($userTokens);

if (empty($userTokens)) {
    // User doesn't have push tokens registered - still success, just no notification sent
    echo json_encode([
        'success' => true,
        'notificationSent' => false,
        'reason' => 'No push tokens registered for user'
    ]);
    exit;
}

// Create push notification message
$title = '🤝 Ny i Flokken din!';
$body = "{$addedByName} (Nivå {$addedByLevel}) har lagt deg til som kontakt";

// Send push notification via Expo
$messages = [];
foreach ($userTokens as $token) {
    $messages[] = [
        'to' => $token,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => [
            'type' => 'contact_added',
            'addedById' => $addedById,
            'addedByName' => $addedByName,
            'addedByLevel' => $addedByLevel,
        ],
    ];
}

$ch = curl_init('https://exp.host/--/api/v2/push/send');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Accept-encoding: gzip, deflate',
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($messages),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    error_log("Push notification curl error: $curlError");
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send push notification',
        'details' => $curlError
    ]);
    exit;
}

$responseData = json_decode($response, true);

// Log the notification
$logFile = DATA_DIR . 'contact_notifications_log.json';
$log = readJsonFile($logFile, []);
$log[] = [
    'timestamp' => date('c'),
    'targetUserId' => $targetUserId,
    'addedById' => $addedById,
    'addedByName' => $addedByName,
    'tokenCount' => count($userTokens),
    'httpCode' => $httpCode,
    'success' => $httpCode === 200,
];
// Keep only last 100 entries
if (count($log) > 100) {
    $log = array_slice($log, -100);
}
writeJsonFile($logFile, $log);

echo json_encode([
    'success' => true,
    'notificationSent' => true,
    'tokenCount' => count($userTokens),
    'httpCode' => $httpCode,
]);

