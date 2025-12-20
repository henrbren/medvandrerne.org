<?php
/**
 * Export all data as JSON
 */
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="medvandrerne-data-' . date('Y-m-d') . '.json"');

$data = [
    'organization' => readJsonFile(JSON_ORGANIZATION),
    'mission' => readJsonFile(JSON_MISSION),
    'coreActivities' => readJsonFile(JSON_CORE_ACTIVITIES),
    'localGroups' => readJsonFile(JSON_LOCAL_GROUPS),
    'administration' => readJsonFile(JSON_ADMINISTRATION),
    'board' => readJsonFile(JSON_BOARD),
    'activities' => readJsonFile(JSON_ACTIVITIES),
    'supporters' => readJsonFile(JSON_SUPPORTERS),
    'news' => readJsonFile(JSON_NEWS),
    'gallery' => readJsonFile(JSON_GALLERY),
    'resources' => readJsonFile(JSON_RESOURCES),
];

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

