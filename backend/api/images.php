<?php
/**
 * List uploaded images
 */
require_once __DIR__ . '/../config.php';
setCorsHeaders();

$category = preg_replace('/[^a-z0-9-]/', '', strtolower($_GET['category'] ?? ''));
$uploadsDir = __DIR__ . '/../uploads/';

$images = [];

if ($category && file_exists($uploadsDir . $category)) {
    // List images in specific category
    $files = glob($uploadsDir . $category . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    foreach ($files as $file) {
        $filename = basename($file);
        $images[] = [
            'filename' => $filename,
            'url' => BASE_URL . 'uploads/' . $category . '/' . $filename,
            'category' => $category,
            'size' => filesize($file),
            'modified' => filemtime($file)
        ];
    }
} else {
    // List all images in all categories
    $categories = glob($uploadsDir . '*', GLOB_ONLYDIR);
    foreach ($categories as $catDir) {
        $cat = basename($catDir);
        $files = glob($catDir . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
        foreach ($files as $file) {
            $filename = basename($file);
            $images[] = [
                'filename' => $filename,
                'url' => BASE_URL . 'uploads/' . $cat . '/' . $filename,
                'category' => $cat,
                'size' => filesize($file),
                'modified' => filemtime($file)
            ];
        }
    }
}

// Sort by modified date, newest first
usort($images, function($a, $b) {
    return $b['modified'] - $a['modified'];
});

jsonResponse($images);

