<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $resources = readJsonFile(JSON_RESOURCES);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $newItem = $input;
        $newItem['id'] = !empty($resources) ? max(array_column($resources, 'id')) + 1 : 1;
        $resources[] = $newItem;
    } else {
        $id = $input['id'] ?? null;
        foreach ($resources as &$item) {
            if ($item['id'] == $id) {
                $item = array_merge($item, $input);
                break;
            }
        }
    }
    
    writeJsonFile(JSON_RESOURCES, $resources);
    jsonResponse(['success' => true, 'data' => $resources]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $resources = readJsonFile(JSON_RESOURCES);
    $resources = array_filter($resources, function($item) use ($id) {
        return $item['id'] != $id;
    });
    writeJsonFile(JSON_RESOURCES, array_values($resources));
    jsonResponse(['success' => true]);
}

jsonResponse(readJsonFile(JSON_RESOURCES));
