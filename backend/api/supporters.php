<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();
jsonResponse(readJsonFile(JSON_SUPPORTERS));
