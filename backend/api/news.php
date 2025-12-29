<?php
/**
 * News API
 * Handles CRUD operations for news articles
 * 
 * Supports:
 * - GET: Retrieve all news (sorted by date descending)
 * - POST: Create new article
 * - PUT: Update existing article
 * - DELETE: Remove article by ID
 * 
 * Fields:
 * - id: Auto-generated unique ID
 * - title: Article title (required)
 * - date: Publication date (required)
 * - category: Article category (required)
 * - excerpt: Short description/lead
 * - content: Full article text
 * - image: Main image URL
 * - gallery: Array of additional image URLs
 * - author: Author name
 * - authorImage: Author avatar URL
 * - readTime: Estimated reading time
 * - tags: Array of tags
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

// Handle POST - Create new article
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonResponse(['error' => 'Ugyldig JSON: ' . json_last_error_msg()], 400);
    }
    
    // Validate required fields
    if (empty($input['title'])) {
        jsonResponse(['error' => 'Tittel er påkrevd'], 400);
    }
    if (empty($input['date'])) {
        jsonResponse(['error' => 'Dato er påkrevd'], 400);
    }
    if (empty($input['category'])) {
        jsonResponse(['error' => 'Kategori er påkrevd'], 400);
    }
    
    $news = readJsonFile(JSON_NEWS);
    
    // Generate new ID
    $newId = !empty($news) ? max(array_column($news, 'id')) + 1 : 1;
    
    // Build new article with all supported fields
    $newItem = [
        'id' => $newId,
        'title' => trim($input['title']),
        'date' => $input['date'],
        'category' => $input['category'],
        'excerpt' => trim($input['excerpt'] ?? ''),
        'content' => trim($input['content'] ?? ''),
        'image' => $input['image'] ?? '',
        'gallery' => $input['gallery'] ?? [],
        'author' => $input['author'] ?? '',
        'authorImage' => $input['authorImage'] ?? '',
        'readTime' => $input['readTime'] ?? '',
        'tags' => $input['tags'] ?? [],
        'createdAt' => date('Y-m-d H:i:s'),
        'updatedAt' => date('Y-m-d H:i:s'),
    ];
    
    // Clean up empty optional fields
    foreach (['content', 'image', 'author', 'authorImage', 'readTime'] as $field) {
        if (empty($newItem[$field])) {
            unset($newItem[$field]);
        }
    }
    if (empty($newItem['gallery'])) unset($newItem['gallery']);
    if (empty($newItem['tags'])) unset($newItem['tags']);
    
    // Add to beginning of array (newest first)
    array_unshift($news, $newItem);
    
    writeJsonFile(JSON_NEWS, $news);
    jsonResponse(['success' => true, 'data' => $newItem, 'message' => 'Artikkel opprettet']);
}

// Handle PUT - Update existing article
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonResponse(['error' => 'Ugyldig JSON: ' . json_last_error_msg()], 400);
    }
    
    $id = $input['id'] ?? null;
    if (!$id) {
        jsonResponse(['error' => 'ID er påkrevd for oppdatering'], 400);
    }
    
    $news = readJsonFile(JSON_NEWS);
    $found = false;
    
    foreach ($news as &$item) {
        if ($item['id'] == $id) {
            // Update fields
            $item['title'] = trim($input['title'] ?? $item['title']);
            $item['date'] = $input['date'] ?? $item['date'];
            $item['category'] = $input['category'] ?? $item['category'];
            $item['excerpt'] = trim($input['excerpt'] ?? $item['excerpt'] ?? '');
            $item['updatedAt'] = date('Y-m-d H:i:s');
            
            // Optional fields - update if provided
            if (isset($input['content'])) {
                if (!empty($input['content'])) {
                    $item['content'] = trim($input['content']);
                } else {
                    unset($item['content']);
                }
            }
            if (isset($input['image'])) {
                if (!empty($input['image'])) {
                    $item['image'] = $input['image'];
                } else {
                    unset($item['image']);
                }
            }
            if (isset($input['gallery'])) {
                if (!empty($input['gallery']) && is_array($input['gallery'])) {
                    $item['gallery'] = $input['gallery'];
                } else {
                    unset($item['gallery']);
                }
            }
            if (isset($input['author'])) {
                if (!empty($input['author'])) {
                    $item['author'] = $input['author'];
                } else {
                    unset($item['author']);
                }
            }
            if (isset($input['authorImage'])) {
                if (!empty($input['authorImage'])) {
                    $item['authorImage'] = $input['authorImage'];
                } else {
                    unset($item['authorImage']);
                }
            }
            if (isset($input['readTime'])) {
                if (!empty($input['readTime'])) {
                    $item['readTime'] = $input['readTime'];
                } else {
                    unset($item['readTime']);
                }
            }
            if (isset($input['tags'])) {
                if (!empty($input['tags']) && is_array($input['tags'])) {
                    $item['tags'] = $input['tags'];
                } else {
                    unset($item['tags']);
                }
            }
            
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        jsonResponse(['error' => 'Artikkel ikke funnet'], 404);
    }
    
    writeJsonFile(JSON_NEWS, $news);
    jsonResponse(['success' => true, 'data' => $news, 'message' => 'Artikkel oppdatert']);
}

// Handle DELETE - Remove article
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'ID er påkrevd for sletting'], 400);
    }
    
    $news = readJsonFile(JSON_NEWS);
    $originalCount = count($news);
    
    $news = array_filter($news, function($item) use ($id) {
        return $item['id'] != $id;
    });
    
    if (count($news) === $originalCount) {
        jsonResponse(['error' => 'Artikkel ikke funnet'], 404);
    }
    
    writeJsonFile(JSON_NEWS, array_values($news));
    jsonResponse(['success' => true, 'message' => 'Artikkel slettet']);
}

// Handle GET - Retrieve all news
$news = readJsonFile(JSON_NEWS);

// Sort by date descending (newest first)
usort($news, function($a, $b) {
    $dateA = strtotime($a['date'] ?? '2000-01-01');
    $dateB = strtotime($b['date'] ?? '2000-01-01');
    return $dateB - $dateA;
});

jsonResponse($news);
