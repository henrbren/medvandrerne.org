<?php
/**
 * Activity Invitations API - Respond to invitation
 * POST endpoint to accept or decline an invitation
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

if (!isset($data['response']) || !in_array($data['response'], ['accept', 'decline'])) {
    http_response_code(400);
    jsonResponse(['error' => 'Response must be "accept" or "decline"'], 400);
}

$invitationId = $data['invitationId'];
$userId = $data['userId'];
$responseType = $data['response'];
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
        
        // Check if already responded
        if ($inv['status'] !== 'pending') {
            jsonResponse([
                'success' => false,
                'error' => 'Invitation has already been ' . $inv['status'],
                'invitation' => $inv,
            ]);
        }
        
        // Update invitation
        $inv['status'] = $responseType === 'accept' ? 'accepted' : 'declined';
        $inv['respondedAt'] = $timestamp;
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
    jsonResponse(['error' => 'Failed to save response'], 500);
}

// If accepted, optionally register user for activity
$registrationResult = null;
if ($responseType === 'accept' && isset($data['autoRegister']) && $data['autoRegister']) {
    $registrationResult = registerUserForActivity($userId, $invitation['activityId'], $data['userName'] ?? 'Medvandrer');
}

// Send push notification to sender about the response
$pushResult = sendResponsePush(
    $invitation['senderId'],
    $invitation['recipientName'],
    $invitation['activityTitle'],
    $responseType
);

jsonResponse([
    'success' => true,
    'message' => $responseType === 'accept' ? 'Invitasjon akseptert!' : 'Invitasjon avslått',
    'invitation' => $invitation,
    'registrationResult' => $registrationResult,
    'pushSent' => $pushResult['sent'],
]);

/**
 * Register user for activity after accepting invitation
 */
function registerUserForActivity($userId, $activityId, $userName) {
    $registrationsFile = DATA_DIR . 'registrations.json';
    $registrations = readJsonFile($registrationsFile, []);
    
    // Initialize activity registration if not exists
    if (!isset($registrations[$activityId])) {
        $registrations[$activityId] = [
            'activityId' => $activityId,
            'participants' => [],
            'createdAt' => date('c'),
        ];
    }
    
    // Check if already registered
    foreach ($registrations[$activityId]['participants'] as $participant) {
        if ($participant['userId'] === $userId) {
            return [
                'success' => true,
                'alreadyRegistered' => true,
            ];
        }
    }
    
    // Add participant
    $registrations[$activityId]['participants'][] = [
        'userId' => $userId,
        'userName' => $userName,
        'registeredAt' => date('c'),
        'viaInvitation' => true,
    ];
    
    // Save
    if (!writeJsonFile($registrationsFile, $registrations)) {
        return [
            'success' => false,
            'error' => 'Failed to save registration',
        ];
    }
    
    return [
        'success' => true,
        'registrationCount' => count($registrations[$activityId]['participants']),
    ];
}

/**
 * Send push notification to sender about response
 */
function sendResponsePush($senderId, $recipientName, $activityTitle, $responseType) {
    $tokensFile = DATA_DIR . 'push_tokens.json';
    $allTokens = readJsonFile($tokensFile, []);
    
    if (!isset($allTokens[$senderId]) || empty($allTokens[$senderId])) {
        return ['sent' => false, 'reason' => 'No push tokens for sender'];
    }
    
    $pushTokens = [];
    foreach ($allTokens[$senderId] as $tokenData) {
        if (strpos($tokenData['token'], 'ExponentPushToken') === 0) {
            $pushTokens[] = $tokenData['token'];
        }
    }
    
    if (empty($pushTokens)) {
        return ['sent' => false, 'reason' => 'No valid tokens'];
    }
    
    $emoji = $responseType === 'accept' ? '✅' : '❌';
    $title = $responseType === 'accept' 
        ? "{$emoji} {$recipientName} blir med!"
        : "{$emoji} Invitasjon avslått";
    $body = $responseType === 'accept'
        ? "{$recipientName} har takket ja til invitasjonen til \"{$activityTitle}\""
        : "{$recipientName} kan dessverre ikke bli med på \"{$activityTitle}\"";
    
    $messages = [];
    foreach ($pushTokens as $token) {
        $messages[] = [
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'invitation_response',
                'responseType' => $responseType,
                'activityTitle' => $activityTitle,
            ],
        ];
    }
    
    $url = 'https://exp.host/--/api/v2/push/send';
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($messages),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['sent' => $httpCode === 200, 'httpCode' => $httpCode];
}

