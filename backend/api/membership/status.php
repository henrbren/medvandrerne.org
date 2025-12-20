<?php
/**
 * Get Membership Status API
 * GET /api/membership/status.php
 * Header: Authorization: Bearer <token>
 * 
 * Returns current membership status for authenticated user
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get token from header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    jsonResponse(['error' => 'Ingen gyldig autorisasjon'], 401);
}

$token = $matches[1];

// Read users
$users = readJsonFile(JSON_USERS, []);

// Find user by token
$currentUser = null;
foreach ($users as $user) {
    if ($user['authToken'] === $token) {
        // Check if token is expired
        if (strtotime($user['tokenExpiry']) < time()) {
            jsonResponse(['error' => 'Token utløpt, logg inn på nytt'], 401);
        }
        $currentUser = $user;
        break;
    }
}

if (!$currentUser) {
    jsonResponse(['error' => 'Ugyldig token'], 401);
}

// Get membership info
$membership = $currentUser['membership'] ?? null;
$hasActiveMembership = false;
$membershipExpired = false;

if ($membership) {
    // Check if membership has expired
    if ($membership['status'] === 'active' && $membership['expiresAt']) {
        if (strtotime($membership['expiresAt']) < time()) {
            $membershipExpired = true;
        } else {
            $hasActiveMembership = true;
        }
    }
}

// Get tier info if membership exists
$tierInfo = null;
if ($membership && isset(MEMBERSHIP_TIERS[$membership['tier']])) {
    $tierInfo = MEMBERSHIP_TIERS[$membership['tier']];
}

jsonResponse([
    'success' => true,
    'membership' => $membership,
    'tierInfo' => $tierInfo,
    'hasActiveMembership' => $hasActiveMembership,
    'membershipExpired' => $membershipExpired,
    'daysUntilExpiry' => $hasActiveMembership && $membership['expiresAt'] 
        ? max(0, ceil((strtotime($membership['expiresAt']) - time()) / 86400))
        : null,
]);
