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
define('JSON_MEMBERSHIPS', DATA_DIR . 'memberships.json');

// User levels configuration - must match frontend useGamification.js thresholds
// Level names from utils/journeyUtils.js getLevelName()
define('USER_LEVELS', [
    // Beginner (1-10): Hiking gear theme
    1 => ['name' => 'Sokk', 'minPoints' => 0],
    2 => ['name' => 'Sko', 'minPoints' => 100],
    3 => ['name' => 'Sovepose', 'minPoints' => 250],
    4 => ['name' => 'Ryggsekk', 'minPoints' => 500],
    5 => ['name' => 'Skalljakke', 'minPoints' => 800],
    6 => ['name' => 'Lue', 'minPoints' => 1200],
    7 => ['name' => 'Ski', 'minPoints' => 1700],
    8 => ['name' => 'Bålet', 'minPoints' => 2300],
    9 => ['name' => 'Kompass', 'minPoints' => 3000],
    10 => ['name' => 'Vandrestav', 'minPoints' => 4000],
    // Intermediate (11-20): Nature phenomena
    11 => ['name' => 'Fjellvandrer', 'minPoints' => 5200],
    12 => ['name' => 'Nordlys', 'minPoints' => 6600],
    13 => ['name' => 'Midnattssol', 'minPoints' => 8200],
    14 => ['name' => 'Aurora', 'minPoints' => 10000],
    15 => ['name' => 'Stjernevandrer', 'minPoints' => 12000],
    16 => ['name' => 'Måneskinn', 'minPoints' => 14500],
    17 => ['name' => 'Soloppgang', 'minPoints' => 17500],
    18 => ['name' => 'Fjelltopp', 'minPoints' => 21000],
    19 => ['name' => 'Stormvind', 'minPoints' => 25000],
    20 => ['name' => 'Torden', 'minPoints' => 29500],
    // Advanced (21-30): Elements of power
    21 => ['name' => 'Blitz', 'minPoints' => 34500],
    22 => ['name' => 'Regnbue', 'minPoints' => 40000],
    23 => ['name' => 'Tornado', 'minPoints' => 46000],
    24 => ['name' => 'Orkan', 'minPoints' => 52500],
    25 => ['name' => 'Tsunami', 'minPoints' => 59500],
    26 => ['name' => 'Vulkan', 'minPoints' => 67000],
    27 => ['name' => 'Jordskjelv', 'minPoints' => 75000],
    28 => ['name' => 'Nova', 'minPoints' => 83500],
    29 => ['name' => 'Supernova', 'minPoints' => 92500],
    30 => ['name' => 'Galakse', 'minPoints' => 102000],
    // Expert (31-40): Mythical creatures
    31 => ['name' => 'Valkyrie', 'minPoints' => 112500],
    32 => ['name' => 'Drage', 'minPoints' => 124000],
    33 => ['name' => 'Fenris', 'minPoints' => 136500],
    34 => ['name' => 'Jotun', 'minPoints' => 150000],
    35 => ['name' => 'Huginn', 'minPoints' => 165000],
    36 => ['name' => 'Muninn', 'minPoints' => 181000],
    37 => ['name' => 'Sleipnir', 'minPoints' => 198000],
    38 => ['name' => 'Bifrost', 'minPoints' => 216000],
    39 => ['name' => 'Yggdrasil', 'minPoints' => 236000],
    40 => ['name' => 'Midgard', 'minPoints' => 257000],
    // Master (41-50): Norse gods
    41 => ['name' => 'Thor', 'minPoints' => 280000],
    42 => ['name' => 'Odin', 'minPoints' => 305000],
    43 => ['name' => 'Freya', 'minPoints' => 332000],
    44 => ['name' => 'Baldur', 'minPoints' => 361000],
    45 => ['name' => 'Tyr', 'minPoints' => 392000],
    46 => ['name' => 'Heimdall', 'minPoints' => 425000],
    47 => ['name' => 'Njord', 'minPoints' => 460000],
    48 => ['name' => 'Frigg', 'minPoints' => 498000],
    49 => ['name' => 'Idunn', 'minPoints' => 538000],
    50 => ['name' => 'Æsir', 'minPoints' => 580000],
    // Grandmaster (51-60): Cosmic themes
    51 => ['name' => 'Komet', 'minPoints' => 625000],
    52 => ['name' => 'Meteor', 'minPoints' => 673000],
    53 => ['name' => 'Asteroid', 'minPoints' => 724000],
    54 => ['name' => 'Planet', 'minPoints' => 778000],
    55 => ['name' => 'Sol', 'minPoints' => 835000],
    56 => ['name' => 'Nebula', 'minPoints' => 895000],
    57 => ['name' => 'Pulsar', 'minPoints' => 958000],
    58 => ['name' => 'Kvasar', 'minPoints' => 1025000],
    59 => ['name' => 'Svarthull', 'minPoints' => 1095000],
    60 => ['name' => 'Univers', 'minPoints' => 1170000],
    // Legend (61-70): Elements
    61 => ['name' => 'Ild', 'minPoints' => 1250000],
    62 => ['name' => 'Vann', 'minPoints' => 1335000],
    63 => ['name' => 'Jord', 'minPoints' => 1425000],
    64 => ['name' => 'Luft', 'minPoints' => 1520000],
    65 => ['name' => 'Lyn', 'minPoints' => 1620000],
    66 => ['name' => 'Is', 'minPoints' => 1725000],
    67 => ['name' => 'Lys', 'minPoints' => 1835000],
    68 => ['name' => 'Skygge', 'minPoints' => 1950000],
    69 => ['name' => 'Tid', 'minPoints' => 2070000],
    70 => ['name' => 'Rom', 'minPoints' => 2200000],
    // Mythic (71-80): Abstract concepts
    71 => ['name' => 'Visdom', 'minPoints' => 2340000],
    72 => ['name' => 'Styrke', 'minPoints' => 2490000],
    73 => ['name' => 'Mot', 'minPoints' => 2650000],
    74 => ['name' => 'Håp', 'minPoints' => 2820000],
    75 => ['name' => 'Tro', 'minPoints' => 3000000],
    76 => ['name' => 'Kjærlighet', 'minPoints' => 3190000],
    77 => ['name' => 'Fred', 'minPoints' => 3390000],
    78 => ['name' => 'Harmoni', 'minPoints' => 3600000],
    79 => ['name' => 'Balanse', 'minPoints' => 3820000],
    80 => ['name' => 'Enhet', 'minPoints' => 4050000],
    // Immortal (81-90): Transcendent
    81 => ['name' => 'Evighet', 'minPoints' => 4300000],
    82 => ['name' => 'Uendelig', 'minPoints' => 4560000],
    83 => ['name' => 'Opplyst', 'minPoints' => 4840000],
    84 => ['name' => 'Åndelig', 'minPoints' => 5140000],
    85 => ['name' => 'Guddommelig', 'minPoints' => 5460000],
    86 => ['name' => 'Hellig', 'minPoints' => 5800000],
    87 => ['name' => 'Ren', 'minPoints' => 6160000],
    88 => ['name' => 'Perfekt', 'minPoints' => 6540000],
    89 => ['name' => 'Absolutt', 'minPoints' => 6940000],
    90 => ['name' => 'Transcendent', 'minPoints' => 7360000],
    // Summit (91-100): The ultimate journey
    91 => ['name' => 'Oppstigeren', 'minPoints' => 7810000],
    92 => ['name' => 'Veiviseren', 'minPoints' => 8280000],
    93 => ['name' => 'Pioneren', 'minPoints' => 8780000],
    94 => ['name' => 'Legenden', 'minPoints' => 9310000],
    95 => ['name' => 'Ikonet', 'minPoints' => 9870000],
    96 => ['name' => 'Mesteren', 'minPoints' => 10460000],
    97 => ['name' => 'Grandmasteren', 'minPoints' => 11080000],
    98 => ['name' => 'Mytisk', 'minPoints' => 11730000],
    99 => ['name' => 'Udødelig', 'minPoints' => 12410000],
    100 => ['name' => 'Toppen 🏔️', 'minPoints' => 13130000],
]);

// Membership tiers configuration
define('MEMBERSHIP_TIERS', [
    'supporter' => [
        'id' => 'supporter',
        'name' => 'Støttespiller',
        'price' => 50,
        'period' => 'monthly',
        'description' => 'Grunnleggende støtte til Medvandrerne',
        'features' => [
            'Tilgang til appen',
            'Registrering av fremgang',
            'Digitalt vandrerbevis',
        ],
        'color' => '#9E9E9E',
    ],
    'member' => [
        'id' => 'member',
        'name' => 'Medlem',
        'price' => 200,
        'period' => 'monthly',
        'description' => 'Fullt medlemskap med alle fordeler',
        'features' => [
            'Alt i Støttespiller',
            'Rabatt på arrangementer',
            'Medlemsbrev og nyhetsbrev',
            'Stemmerett på årsmøte',
        ],
        'color' => '#42A5F5',
        'popular' => true,
    ],
    'family' => [
        'id' => 'family',
        'name' => 'Familie',
        'price' => 500,
        'period' => 'monthly',
        'description' => 'For hele familien (inntil 5 personer)',
        'features' => [
            'Alt i Medlem',
            'Inntil 5 familiemedlemmer',
            'Familie-arrangementer',
            'Felles fremgangslogg',
        ],
        'color' => '#66BB6A',
    ],
    'patron' => [
        'id' => 'patron',
        'name' => 'Beskytter',
        'price' => 1000,
        'period' => 'monthly',
        'description' => 'Ekstra støtte til organisasjonen',
        'features' => [
            'Alt i Familie',
            'Navngitt som beskytter',
            'Eksklusive arrangementer',
            'Direkte kontakt med styret',
        ],
        'color' => '#FFA726',
    ],
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

