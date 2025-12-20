<?php
/**
 * Get Membership Tiers API
 * GET /api/membership/tiers.php
 * 
 * Returns available membership tiers and pricing
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

// Return membership tiers
jsonResponse([
    'success' => true,
    'tiers' => array_values(MEMBERSHIP_TIERS),
]);
