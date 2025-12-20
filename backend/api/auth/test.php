<?php
/**
 * Auth API Test Endpoint
 * GET /api/auth/test.php
 * 
 * Returns basic info to verify the auth API is reachable
 */

require_once __DIR__ . '/../../config.php';

setCorsHeaders();

jsonResponse([
    'success' => true,
    'message' => 'Auth API er tilgjengelig',
    'timestamp' => date('c'),
    'php_version' => PHP_VERSION,
    'users_file_exists' => file_exists(JSON_USERS),
    'users_file_writable' => is_writable(dirname(JSON_USERS)),
]);
