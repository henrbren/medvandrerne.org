<?php
/**
 * Image Upload API
 * Handles image uploads for board members, administration, etc.
 */
require_once __DIR__ . '/../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Create uploads directory if it doesn't exist
$uploadsDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'File is too large (server limit)',
        UPLOAD_ERR_FORM_SIZE => 'File is too large (form limit)',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
    ];
    $errorCode = $_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE;
    $errorMsg = $errorMessages[$errorCode] ?? 'Unknown upload error';
    jsonResponse(['error' => $errorMsg], 400);
}

$file = $_FILES['image'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    jsonResponse(['error' => 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP'], 400);
}

// Validate file size (max 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    jsonResponse(['error' => 'File too large. Maximum size: 5MB'], 400);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$extension = strtolower($extension);
if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
    $extension = 'jpg'; // Default extension
}

// Use category from POST if provided (e.g., 'board', 'administration')
$category = preg_replace('/[^a-z0-9-]/', '', strtolower($_POST['category'] ?? 'general'));
$categoryDir = $uploadsDir . $category . '/';
if (!file_exists($categoryDir)) {
    mkdir($categoryDir, 0755, true);
}

// Generate filename: category_timestamp_random.ext
$filename = $category . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
$filepath = $categoryDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    jsonResponse(['error' => 'Failed to save file'], 500);
}

// Generate URL
$imageUrl = BASE_URL . 'uploads/' . $category . '/' . $filename;

jsonResponse([
    'success' => true,
    'url' => $imageUrl,
    'filename' => $filename,
    'category' => $category
]);
