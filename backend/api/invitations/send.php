<?php
/**
 * Activity Invitations API - Send invitation
 * POST endpoint to send an activity invitation to a contact
 * Also sends push notification to the recipient
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

if (!isset($data['senderId']) || empty($data['senderId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Sender ID is required'], 400);
}

if (!isset($data['recipientId']) || empty($data['recipientId'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Recipient ID is required'], 400);
}

$activityId = $data['activityId'];
$senderId = $data['senderId'];
$senderName = $data['senderName'] ?? 'En Medvandrer';
$senderLevel = $data['senderLevel'] ?? 1;
$recipientId = $data['recipientId'];
$recipientName = $data['recipientName'] ?? 'Medvandrer';
$recipientPhone = $data['recipientPhone'] ?? null;
$recipientEmail = $data['recipientEmail'] ?? null;
$activityTitle = $data['activityTitle'] ?? 'en aktivitet';
$activityDate = $data['activityDate'] ?? null;
$message = $data['message'] ?? null;
$timestamp = date('c');

// Generate unique invitation ID
$invitationId = 'inv_' . time() . '_' . substr(md5($senderId . $recipientId . $activityId), 0, 8);

// Load existing invitations
$invitationsFile = DATA_DIR . 'activity_invitations.json';
$invitations = readJsonFile($invitationsFile, []);

// Check if invitation already exists (prevent duplicates)
foreach ($invitations as $inv) {
    if ($inv['activityId'] === $activityId && 
        $inv['senderId'] === $senderId && 
        $inv['recipientId'] === $recipientId &&
        $inv['status'] === 'pending') {
        jsonResponse([
            'success' => false,
            'error' => 'Du har allerede invitert denne personen til denne aktiviteten',
            'existingInvitation' => $inv,
        ]);
    }
}

// Create new invitation
$invitation = [
    'id' => $invitationId,
    'activityId' => $activityId,
    'activityTitle' => $activityTitle,
    'activityDate' => $activityDate,
    'senderId' => $senderId,
    'senderName' => $senderName,
    'senderLevel' => $senderLevel,
    'recipientId' => $recipientId,
    'recipientName' => $recipientName,
    'recipientPhone' => $recipientPhone,
    'recipientEmail' => $recipientEmail,
    'message' => $message,
    'status' => 'pending', // pending, accepted, declined, expired
    'createdAt' => $timestamp,
    'respondedAt' => null,
    'seenAt' => null,
];

// Add to invitations array
$invitations[] = $invitation;

// Save invitations
if (!writeJsonFile($invitationsFile, $invitations)) {
    http_response_code(500);
    jsonResponse(['error' => 'Failed to save invitation'], 500);
}

// Send push notification to recipient
$pushResult = sendInvitationPush($recipientId, $senderName, $activityTitle, $invitationId, $activityId);

// Log the invitation
error_log("Invitation sent: {$invitationId} from {$senderId} to {$recipientId} for activity {$activityId}");

jsonResponse([
    'success' => true,
    'message' => 'Invitasjon sendt!',
    'invitation' => $invitation,
    'pushSent' => $pushResult['sent'],
    'pushResult' => $pushResult,
]);

/**
 * Send push notification for invitation
 */
function sendInvitationPush($recipientId, $senderName, $activityTitle, $invitationId, $activityId) {
    // Load push tokens
    $tokensFile = DATA_DIR . 'push_tokens.json';
    $allTokens = readJsonFile($tokensFile, []);
    
    // Get recipient's tokens
    if (!isset($allTokens[$recipientId]) || empty($allTokens[$recipientId])) {
        return [
            'sent' => false,
            'reason' => 'No push tokens for recipient',
        ];
    }
    
    $pushTokens = [];
    foreach ($allTokens[$recipientId] as $tokenData) {
        if (strpos($tokenData['token'], 'ExponentPushToken') === 0) {
            $pushTokens[] = $tokenData['token'];
        }
    }
    
    if (empty($pushTokens)) {
        return [
            'sent' => false,
            'reason' => 'No valid Expo push tokens',
        ];
    }
    
    // Prepare push messages
    $messages = [];
    foreach ($pushTokens as $token) {
        $messages[] = [
            'to' => $token,
            'sound' => 'default',
            'title' => '📬 Invitasjon fra ' . $senderName,
            'body' => 'Du er invitert til "' . $activityTitle . '"! Trykk for å se invitasjonen.',
            'data' => [
                'type' => 'activity_invitation',
                'invitationId' => $invitationId,
                'activityId' => $activityId,
                'senderName' => $senderName,
            ],
        ];
    }
    
    // Send to Expo push service
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
        error_log('Expo push error for invitation: ' . $error);
        return [
            'sent' => false,
            'reason' => 'Curl error: ' . $error,
        ];
    }
    
    return [
        'sent' => true,
        'httpCode' => $httpCode,
        'tokenCount' => count($pushTokens),
    ];
}

