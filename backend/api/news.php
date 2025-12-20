<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

// Handle POST/PUT/DELETE for admin operations
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonResponse(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
    }
    
    $news = readJsonFile(JSON_NEWS);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create new
        $newItem = $input;
        $newItem['id'] = !empty($news) ? max(array_column($news, 'id')) + 1 : 1;
        $news[] = $newItem;
    } else {
        // Update existing
        $id = $input['id'] ?? null;
        foreach ($news as &$item) {
            if ($item['id'] == $id) {
                $item = array_merge($item, $input);
                break;
            }
        }
    }
    
    writeJsonFile(JSON_NEWS, $news);
    jsonResponse(['success' => true, 'data' => $news]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $news = readJsonFile(JSON_NEWS);
    $news = array_filter($news, function($item) use ($id) {
        return $item['id'] != $id;
    });
    writeJsonFile(JSON_NEWS, array_values($news));
    jsonResponse(['success' => true]);
}

jsonResponse(readJsonFile(JSON_NEWS));

