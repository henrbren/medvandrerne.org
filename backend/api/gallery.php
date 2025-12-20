<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $gallery = readJsonFile(JSON_GALLERY);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $newItem = $input;
        $newItem['id'] = !empty($gallery) ? max(array_column($gallery, 'id')) + 1 : 1;
        $gallery[] = $newItem;
    } else {
        $id = $input['id'] ?? null;
        foreach ($gallery as &$item) {
            if ($item['id'] == $id) {
                $item = array_merge($item, $input);
                break;
            }
        }
    }
    
    writeJsonFile(JSON_GALLERY, $gallery);
    jsonResponse(['success' => true, 'data' => $gallery]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $gallery = readJsonFile(JSON_GALLERY);
    $gallery = array_filter($gallery, function($item) use ($id) {
        return $item['id'] != $id;
    });
    writeJsonFile(JSON_GALLERY, array_values($gallery));
    jsonResponse(['success' => true]);
}

jsonResponse(readJsonFile(JSON_GALLERY));

