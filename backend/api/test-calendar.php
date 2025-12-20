<?php
/**
 * Test Calendar Connection
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../services/icsParser.php';

$url = $_GET['url'] ?? '';

if (empty($url)) {
    jsonResponse(['success' => false, 'error' => 'Ingen URL oppgitt'], 400);
}

// Validate URL
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    jsonResponse(['success' => false, 'error' => 'Ugyldig URL-format'], 400);
}

// Only allow HTTPS URLs from Google Calendar
$parsedUrl = parse_url($url);
if ($parsedUrl['scheme'] !== 'https') {
    jsonResponse(['success' => false, 'error' => 'Kun HTTPS URL-er er tillatt'], 400);
}

if (!isset($parsedUrl['host']) || (strpos($parsedUrl['host'], 'google.com') === false && strpos($parsedUrl['host'], 'googleapis.com') === false)) {
    jsonResponse(['success' => false, 'error' => 'Kun Google Calendar URL-er er tillatt'], 400);
}

try {
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'user_agent' => 'Medvandrerne Calendar Test',
            'follow_location' => true,
            'max_redirects' => 3,
        ],
    ]);
    
    $icsContent = @file_get_contents($url, false, $context);
    
    if ($icsContent === false) {
        throw new Exception('Kunne ikke hente kalender-data. Sjekk at URL-en er riktig og at kalenderen er offentlig.');
    }
    
    $parser = new ICSParser($icsContent);
    $allEvents = $parser->getEvents();
    
    // Filter future events
    $now = date('Y-m-d');
    $futureEvents = array_filter($allEvents, function($event) use ($now) {
        return ($event['date'] ?? '') >= $now;
    });
    
    // Sort and limit
    usort($futureEvents, function($a, $b) {
        return strcmp($a['date'] ?? '', $b['date'] ?? '');
    });
    
    // Debug info - check for VEVENT markers
    $veventCount = substr_count($icsContent, 'BEGIN:VEVENT');
    $hasVcalendar = strpos($icsContent, 'BEGIN:VCALENDAR') !== false;
    
    // Find a sample VEVENT
    $sampleEvent = '';
    $veventStart = strpos($icsContent, 'BEGIN:VEVENT');
    if ($veventStart !== false) {
        $veventEnd = strpos($icsContent, 'END:VEVENT', $veventStart);
        if ($veventEnd !== false) {
            $sampleEvent = substr($icsContent, $veventStart, $veventEnd - $veventStart + 12);
        }
    }
    
    // Check if it's HTML instead of ICS
    $isHtml = stripos($icsContent, '<html') !== false || stripos($icsContent, '<!DOCTYPE') !== false;
    $contentType = 'unknown';
    if ($isHtml) {
        $contentType = 'HTML (feil URL!)';
    } elseif ($hasVcalendar) {
        $contentType = 'ICS (riktig)';
    } elseif (stripos($icsContent, '{') === 0) {
        $contentType = 'JSON';
    }
    
    $debug = [
        'ics_length' => strlen($icsContent),
        'content_type' => $contentType,
        'is_html' => $isHtml,
        'raw_start' => substr($icsContent, 0, 1000),
        'has_vcalendar' => $hasVcalendar,
        'vevent_count_in_raw' => $veventCount,
        'sample_vevent' => $sampleEvent,
        'total_events_parsed' => count($allEvents),
        'future_events' => count($futureEvents),
        'today' => $now,
        'all_dates' => array_map(function($e) { 
            return ['title' => $e['title'] ?? '?', 'date' => $e['date'] ?? 'no date']; 
        }, array_slice($allEvents, 0, 20)),
    ];
    
    jsonResponse([
        'success' => true,
        'eventCount' => count($futureEvents),
        'totalParsed' => count($allEvents),
        'events' => array_slice($futureEvents, 0, 10),
        'debug' => $debug,
    ]);
    
} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'error' => $e->getMessage(),
    ], 500);
}
