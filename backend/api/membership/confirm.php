<?php
/**
 * Confirm Membership Payment API
 * POST /api/membership/confirm.php
 * Header: Authorization: Bearer <token>
 * Body: { "paymentMethod": "vipps|stripe|manual", "transactionId": "..." }
 * 
 * Confirms payment and activates membership
 * In production, this would be called by payment webhook or admin
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

// Get token from header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    jsonResponse(['error' => 'Ingen gyldig autorisasjon'], 401);
}

$token = $matches[1];

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true);

$paymentMethod = $input['paymentMethod'] ?? 'manual';
$transactionId = $input['transactionId'] ?? 'manual_' . bin2hex(random_bytes(8));

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find user by token
$userIndex = -1;
foreach ($users as $index => $user) {
    if ($user['authToken'] === $token) {
        $userIndex = $index;
        break;
    }
}

if ($userIndex === -1) {
    jsonResponse(['error' => 'Ugyldig token'], 401);
}

$user = $users[$userIndex];

// Check if user has pending membership
if (!isset($user['membership']) || $user['membership']['status'] !== 'pending') {
    jsonResponse(['error' => 'Ingen ventende medlemskap'], 400);
}

// Get tier info
$tierId = $user['membership']['tier'];
$tier = MEMBERSHIP_TIERS[$tierId] ?? null;

if (!$tier) {
    jsonResponse(['error' => 'Ugyldig medlemskapsnivå'], 400);
}

// Calculate expiry (1 month from now)
$expiresAt = date('c', strtotime('+1 month'));

// Update membership to active
$users[$userIndex]['membership']['status'] = 'active';
$users[$userIndex]['membership']['paidAt'] = date('c');
$users[$userIndex]['membership']['expiresAt'] = $expiresAt;
$users[$userIndex]['membership']['paymentMethod'] = $paymentMethod;
$users[$userIndex]['membership']['transactionId'] = $transactionId;

// Set memberSince if first payment
if (!$users[$userIndex]['memberSince']) {
    $users[$userIndex]['memberSince'] = date('Y-m-d');
}

$users[$userIndex]['updatedAt'] = date('c');

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke bekrefte medlemskap'], 500);
}

// Record transaction in memberships.json
$memberships = readJsonFile(JSON_MEMBERSHIPS, ['transactions' => [], 'stats' => []]);

$transaction = [
    'id' => 'txn_' . bin2hex(random_bytes(8)),
    'userId' => $user['id'],
    'phone' => $user['phone'],
    'tier' => $tierId,
    'tierName' => $tier['name'],
    'amount' => $tier['price'],
    'paymentMethod' => $paymentMethod,
    'transactionId' => $transactionId,
    'createdAt' => date('c'),
];

$memberships['transactions'][] = $transaction;

// Update stats
$memberships['stats']['totalMembers'] = ($memberships['stats']['totalMembers'] ?? 0) + 1;
$memberships['stats']['totalRevenue'] = ($memberships['stats']['totalRevenue'] ?? 0) + $tier['price'];
$memberships['stats']['membersByTier'][$tierId] = ($memberships['stats']['membersByTier'][$tierId] ?? 0) + 1;

writeJsonFile(JSON_MEMBERSHIPS, $memberships);

// Return response
$responseUser = $users[$userIndex];
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'message' => 'Medlemskap aktivert!',
    'user' => $responseUser,
]);
