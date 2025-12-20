<?php
/**
 * Select Membership Tier API
 * POST /api/membership/select.php
 * Body: { "phone": "+4712345678", "tier": "member" }
 * 
 * Registers a pending membership (payment to be confirmed later)
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['phone']) || empty($input['phone'])) {
    jsonResponse(['error' => 'Telefonnummer er påkrevd'], 400);
}

if (!isset($input['tier']) || empty($input['tier'])) {
    jsonResponse(['error' => 'Medlemskapsnivå er påkrevd'], 400);
}

// Normalize phone number
$phone = preg_replace('/\s+/', '', $input['phone']);
if (!preg_match('/^\+/', $phone)) {
    $phone = '+47' . ltrim($phone, '0');
}

// Validate tier
$tierId = $input['tier'];
if (!isset(MEMBERSHIP_TIERS[$tierId])) {
    jsonResponse(['error' => 'Ugyldig medlemskapsnivå'], 400);
}

$tier = MEMBERSHIP_TIERS[$tierId];

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find or create user
$userIndex = -1;
foreach ($users as $index => $user) {
    if ($user['phone'] === $phone) {
        $userIndex = $index;
        break;
    }
}

// Generate secure token
$token = bin2hex(random_bytes(32));
$tokenExpiry = date('Y-m-d H:i:s', strtotime('+7 days'));

// Create pending membership
$membership = [
    'tier' => $tierId,
    'tierName' => $tier['name'],
    'price' => $tier['price'],
    'status' => 'pending', // pending, active, expired, cancelled
    'selectedAt' => date('c'),
    'paidAt' => null,
    'expiresAt' => null,
    'paymentMethod' => null,
    'transactionId' => null,
];

if ($userIndex === -1) {
    // Create new user with pending membership
    $newUser = [
        'id' => 'usr_' . bin2hex(random_bytes(8)),
        'phone' => $phone,
        'name' => $input['name'] ?? '',
        'email' => $input['email'] ?? '',
        'memberSince' => null, // Set when payment confirmed
        'membership' => $membership,
        'level' => 1,
        'levelName' => USER_LEVELS[1]['name'],
        'totalPoints' => 0,
        'completedActivities' => 0,
        'completedExpeditions' => 0,
        'skills' => [],
        'badges' => [],
        'reflections' => [],
        'lastActive' => date('Y-m-d'),
        'authToken' => $token,
        'tokenExpiry' => $tokenExpiry,
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];
    $users[] = $newUser;
    $user = $newUser;
} else {
    // Update existing user with new membership selection
    $users[$userIndex]['membership'] = $membership;
    $users[$userIndex]['authToken'] = $token;
    $users[$userIndex]['tokenExpiry'] = $tokenExpiry;
    $users[$userIndex]['lastActive'] = date('Y-m-d');
    $users[$userIndex]['updatedAt'] = date('c');
    $user = $users[$userIndex];
}

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke lagre medlemskap'], 500);
}

// Return response
$responseUser = $user;
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'message' => 'Medlemskap valgt - venter på betaling',
    'token' => $token,
    'user' => $responseUser,
    'membership' => $membership,
    'paymentInfo' => [
        'amount' => $tier['price'],
        'description' => $tier['name'] . ' - Medvandrerne',
        'reference' => $user['id'],
        // Placeholder for payment integration
        'vippsUrl' => null,
        'stripeUrl' => null,
    ],
]);
