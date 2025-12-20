<?php
/**
 * Admin Confirm Membership Payment API
 * POST /api/membership/admin-confirm.php
 * Body: { "userId": "usr_..." }
 * 
 * Confirms payment for a user (admin only, no token required)
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

if (!isset($input['userId']) || empty($input['userId'])) {
    jsonResponse(['error' => 'userId er påkrevd'], 400);
}

$userId = $input['userId'];

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find user by ID
$userIndex = -1;
foreach ($users as $index => $user) {
    if ($user['id'] === $userId) {
        $userIndex = $index;
        break;
    }
}

if ($userIndex === -1) {
    jsonResponse(['error' => 'Bruker ikke funnet'], 404);
}

$user = $users[$userIndex];

// Check if user has pending membership
if (!isset($user['membership'])) {
    jsonResponse(['error' => 'Bruker har ikke valgt medlemskap'], 400);
}

if ($user['membership']['status'] !== 'pending') {
    jsonResponse(['error' => 'Medlemskap er ikke i ventestatus'], 400);
}

// Get tier info
$tierId = $user['membership']['tier'];
$tier = MEMBERSHIP_TIERS[$tierId] ?? null;

if (!$tier) {
    jsonResponse(['error' => 'Ugyldig medlemskapsnivå'], 400);
}

// Calculate expiry (1 month from now)
$expiresAt = date('c', strtotime('+1 month'));
$transactionId = 'manual_' . bin2hex(random_bytes(8));

// Update membership to active
$users[$userIndex]['membership']['status'] = 'active';
$users[$userIndex]['membership']['paidAt'] = date('c');
$users[$userIndex]['membership']['expiresAt'] = $expiresAt;
$users[$userIndex]['membership']['paymentMethod'] = 'manual';
$users[$userIndex]['membership']['transactionId'] = $transactionId;

// Set memberSince if first payment
if (!$users[$userIndex]['memberSince']) {
    $users[$userIndex]['memberSince'] = date('Y-m-d');
}

$users[$userIndex]['updatedAt'] = date('c');

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke lagre brukerdata'], 500);
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
    'paymentMethod' => 'manual',
    'transactionId' => $transactionId,
    'confirmedBy' => 'admin',
    'createdAt' => date('c'),
];

$memberships['transactions'][] = $transaction;

// Update stats
$memberships['stats']['totalMembers'] = ($memberships['stats']['totalMembers'] ?? 0) + 1;
$memberships['stats']['totalRevenue'] = ($memberships['stats']['totalRevenue'] ?? 0) + $tier['price'];
$memberships['stats']['membersByTier'][$tierId] = ($memberships['stats']['membersByTier'][$tierId] ?? 0) + 1;

if (!writeJsonFile(JSON_MEMBERSHIPS, $memberships)) {
    // User was saved, but stats failed - log but continue
    error_log('Failed to save membership stats for transaction: ' . $transactionId);
}

jsonResponse([
    'success' => true,
    'message' => 'Medlemskap aktivert!',
    'user' => [
        'id' => $users[$userIndex]['id'],
        'name' => $users[$userIndex]['name'],
        'phone' => $users[$userIndex]['phone'],
        'membership' => $users[$userIndex]['membership'],
    ],
    'transaction' => $transaction,
]);
