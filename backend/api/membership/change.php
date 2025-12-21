<?php
/**
 * Change Membership Tier API
 * POST /api/membership/change.php
 * Header: Authorization: Bearer <token>
 * Body: { "newTier": "member" }
 * 
 * Changes the user's membership tier (creates pending payment for new tier)
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

if (!isset($input['newTier']) || empty($input['newTier'])) {
    jsonResponse(['error' => 'Nytt medlemskapsnivå er påkrevd'], 400);
}

$newTierId = $input['newTier'];

// Validate new tier
if (!isset(MEMBERSHIP_TIERS[$newTierId])) {
    jsonResponse(['error' => 'Ugyldig medlemskapsnivå'], 400);
}

$newTier = MEMBERSHIP_TIERS[$newTierId];

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find user by token
$userIndex = -1;
foreach ($users as $index => $user) {
    if ($user['authToken'] === $token) {
        // Check if token is expired
        if (strtotime($user['tokenExpiry']) < time()) {
            jsonResponse(['error' => 'Token utløpt, logg inn på nytt'], 401);
        }
        $userIndex = $index;
        break;
    }
}

if ($userIndex === -1) {
    jsonResponse(['error' => 'Ugyldig token'], 401);
}

$user = $users[$userIndex];

// Check if user already has this tier
if (isset($user['membership']) && $user['membership']['tier'] === $newTierId) {
    // Include debug info to help diagnose issues
    jsonResponse([
        'error' => 'Du har allerede dette medlemskapsnivået',
        'debug' => [
            'currentTier' => $user['membership']['tier'] ?? 'none',
            'currentTierName' => $user['membership']['tierName'] ?? 'none',
            'requestedTier' => $newTierId,
        ]
    ], 400);
}

// Create new pending membership (upgrade/downgrade)
$oldTier = $user['membership']['tier'] ?? null;
$oldTierName = $user['membership']['tierName'] ?? null;

$membership = [
    'tier' => $newTierId,
    'tierName' => $newTier['name'],
    'price' => $newTier['price'],
    'status' => 'pending',
    'selectedAt' => date('c'),
    'paidAt' => null,
    'expiresAt' => null,
    'paymentMethod' => null,
    'transactionId' => null,
    'previousTier' => $oldTier,
    'changeType' => $oldTier ? ($newTier['price'] > (MEMBERSHIP_TIERS[$oldTier]['price'] ?? 0) ? 'upgrade' : 'downgrade') : 'new',
];

$users[$userIndex]['membership'] = $membership;
$users[$userIndex]['updatedAt'] = date('c');

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    jsonResponse(['error' => 'Kunne ikke lagre endringer'], 500);
}

// Return response
$responseUser = $users[$userIndex];
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'message' => 'Medlemskap endret - venter på betaling',
    'user' => $responseUser,
    'membership' => $membership,
    'paymentInfo' => [
        'amount' => $newTier['price'],
        'description' => $newTier['name'] . ' - Medvandrerne',
        'reference' => $user['id'],
        'changeType' => $membership['changeType'],
    ],
]);
