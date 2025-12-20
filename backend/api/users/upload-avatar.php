<?php
/**
 * Upload User Avatar API
 * POST /api/users/upload-avatar.php
 * Header: Authorization: Bearer <token>
 * Body: multipart/form-data with 'avatar' file
 * 
 * Uploads and saves user profile picture
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

// Check if file was uploaded
if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'Filen er for stor (server limit)',
        UPLOAD_ERR_FORM_SIZE => 'Filen er for stor',
        UPLOAD_ERR_PARTIAL => 'Filen ble bare delvis lastet opp',
        UPLOAD_ERR_NO_FILE => 'Ingen fil ble lastet opp',
        UPLOAD_ERR_NO_TMP_DIR => 'Midlertidig mappe mangler',
        UPLOAD_ERR_CANT_WRITE => 'Kunne ikke skrive fil',
    ];
    $errorCode = $_FILES['avatar']['error'] ?? UPLOAD_ERR_NO_FILE;
    $errorMsg = $errorMessages[$errorCode] ?? 'Ukjent feil ved opplasting';
    jsonResponse(['error' => $errorMsg], 400);
}

$file = $_FILES['avatar'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    jsonResponse(['error' => 'Ugyldig filtype. Kun JPG, PNG, GIF og WebP er tillatt.'], 400);
}

// Validate file size (max 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    jsonResponse(['error' => 'Filen er for stor. Maks 5MB.'], 400);
}

// Create avatars directory if it doesn't exist
$avatarsDir = __DIR__ . '/../../uploads/avatars/';
if (!is_dir($avatarsDir)) {
    mkdir($avatarsDir, 0755, true);
}

// Generate unique filename
$extension = match($mimeType) {
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
    default => 'jpg',
};
$filename = 'avatar_' . $user['id'] . '_' . time() . '.' . $extension;
$filepath = $avatarsDir . $filename;

// Delete old avatar if exists
if (!empty($user['avatarUrl'])) {
    $oldFilename = basename($user['avatarUrl']);
    $oldFilepath = $avatarsDir . $oldFilename;
    if (file_exists($oldFilepath)) {
        unlink($oldFilepath);
    }
}

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    jsonResponse(['error' => 'Kunne ikke lagre filen'], 500);
}

// Update user with avatar URL
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') 
    . '://' . $_SERVER['HTTP_HOST'];
$avatarUrl = $baseUrl . '/uploads/avatars/' . $filename;

$users[$userIndex]['avatarUrl'] = $avatarUrl;
$users[$userIndex]['updatedAt'] = date('c');

// Save users
if (!writeJsonFile(JSON_USERS, $users)) {
    // Try to delete the uploaded file if we can't save
    unlink($filepath);
    jsonResponse(['error' => 'Kunne ikke oppdatere brukerdata'], 500);
}

// Return response
$responseUser = $users[$userIndex];
unset($responseUser['authToken']);
unset($responseUser['tokenExpiry']);

jsonResponse([
    'success' => true,
    'message' => 'Profilbilde oppdatert!',
    'avatarUrl' => $avatarUrl,
    'user' => $responseUser,
]);
