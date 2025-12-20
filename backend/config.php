<?php
/**
 * Configuration file for Medvandrerne Admin Backend
 */

// Error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Sett til 1 for debugging
ini_set('log_errors', 1);

// Server configuration
// Note: index.php should be in root, backend/ folder contains config, pages, assets, data
// API files should be in /api/ folder in root
define('BASE_URL', 'https://henrikb30.sg-host.com/');
define('API_URL', BASE_URL . 'api/');
define('DATA_DIR', __DIR__ . '/data/');

// Ensure data directory exists
if (!file_exists(DATA_DIR)) {
    if (!mkdir(DATA_DIR, 0755, true)) {
        error_log('Failed to create data directory: ' . DATA_DIR);
    }
}

// Check if data directory is writable
if (!is_writable(DATA_DIR)) {
    error_log('Data directory is not writable: ' . DATA_DIR);
}

// JSON file paths
define('JSON_ORGANIZATION', DATA_DIR . 'organization.json');
define('JSON_MISSION', DATA_DIR . 'mission.json');
define('JSON_CORE_ACTIVITIES', DATA_DIR . 'core_activities.json');
define('JSON_LOCAL_GROUPS', DATA_DIR . 'local_groups.json');
define('JSON_ADMINISTRATION', DATA_DIR . 'administration.json');
define('JSON_BOARD', DATA_DIR . 'board.json');
define('JSON_ACTIVITIES', DATA_DIR . 'activities.json');
define('JSON_SUPPORTERS', DATA_DIR . 'supporters.json');
define('JSON_NEWS', DATA_DIR . 'news.json');
define('JSON_GALLERY', DATA_DIR . 'gallery.json'); // Deprecated - use calendar instead
define('JSON_RESOURCES', DATA_DIR . 'resources.json');
define('JSON_USERS', DATA_DIR . 'users.json');

// User levels configuration
define('USER_LEVELS', [
    1 => ['name' => 'Nybegynner', 'minPoints' => 0],
    2 => ['name' => 'Turist', 'minPoints' => 500],
    3 => ['name' => 'Vandrer', 'minPoints' => 1000],
    4 => ['name' => 'Stifinner', 'minPoints' => 2500],
    5 => ['name' => 'Mester', 'minPoints' => 5000],
]);

// Helper function to read JSON file
// Clears stat cache to ensure fresh data is read
function readJsonFile($filePath, $default = []) {
    // Clear file stat cache to ensure we get fresh file info
    clearstatcache(true, $filePath);
    
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        $data = json_decode($content, true);
        
        // Log if JSON decode fails
        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            error_log('JSON decode error in ' . $filePath . ': ' . json_last_error_msg());
        }
        
        return $data !== null ? $data : $default;
    }
    return $default;
}

// Helper function to write JSON file
function writeJsonFile($filePath, $data) {
    // Validate that data can be encoded as JSON
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    if ($json === false) {
        error_log('Failed to encode JSON: ' . json_last_error_msg());
        return false;
    }
    
    // Create backup before writing (if file exists)
    if (file_exists($filePath)) {
        $backupPath = $filePath . '.backup.' . date('Y-m-d_H-i-s');
        @copy($filePath, $backupPath);
        // Keep only last 5 backups
        $backups = glob($filePath . '.backup.*');
        if (count($backups) > 5) {
            usort($backups, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            foreach (array_slice($backups, 0, -5) as $oldBackup) {
                @unlink($oldBackup);
            }
        }
    }
    
    $result = file_put_contents($filePath, $json, LOCK_EX);
    
    if ($result === false) {
        error_log('Failed to write JSON file: ' . $filePath);
        return false;
    }
    
    return true;
}

// Set JSON response headers
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    
    // Encode JSON with error handling
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    if ($json === false) {
        // If encoding fails, return error JSON
        error_log('JSON encoding failed: ' . json_last_error_msg());
        http_response_code(500);
        $errorData = [
            'error' => 'Failed to encode JSON response',
            'message' => json_last_error_msg(),
            'data_type' => gettype($data)
        ];
        echo json_encode($errorData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo $json;
    }
    
    exit;
}

// CORS headers for API
function setCorsHeaders() {
    // In production, replace * with specific allowed origins
    $allowedOrigins = [
        'https://henrikb30.sg-host.com',
        'http://localhost:19006', // Expo dev server
        'http://localhost:8081', // React Native debugger
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        // Fallback to * for development, but log it
        header('Access-Control-Allow-Origin: *');
        if (!empty($origin)) {
            error_log('CORS: Unauthorized origin: ' . $origin);
        }
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

