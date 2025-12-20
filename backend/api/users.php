<?php
/**
 * Admin: List All Users API
 * GET /api/users.php
 * 
 * Returns all users for admin dashboard
 */

require_once __DIR__ . '/../config.php';

setCorsHeaders();

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Read users
$users = readJsonFile(JSON_USERS, []);

// Remove sensitive data from response
$safeUsers = array_map(function($user) {
    unset($user['authToken']);
    unset($user['tokenExpiry']);
    return $user;
}, $users);

// Sort by lastActive (most recent first)
usort($safeUsers, function($a, $b) {
    return strtotime($b['lastActive'] ?? '1970-01-01') - strtotime($a['lastActive'] ?? '1970-01-01');
});

jsonResponse($safeUsers);
