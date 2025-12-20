<?php
/**
 * Clear Calendar Cache
 */
require_once __DIR__ . '/../config.php';

$cacheFile = DATA_DIR . 'calendar_cache.json';

if (file_exists($cacheFile)) {
    unlink($cacheFile);
}

jsonResponse(['success' => true, 'message' => 'Cache cleared']);
