<?php
/**
 * Activities API Endpoint
 * Returns activities with registration counts
 */
require_once __DIR__ . '/../config.php';
setCorsHeaders();

// Load activities
$activities = readJsonFile(JSON_ACTIVITIES, []);

// Load registrations
$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

// Add registration counts to activities
foreach ($activities as &$activity) {
    $activityId = (string)$activity['id'];
    $activity['registrationCount'] = isset($registrations[$activityId]) 
        ? $registrations[$activityId]['count'] 
        : 0;
        
    // Generate description if missing
    if (empty($activity['description'])) {
        $activity['description'] = generateActivityDescription($activity);
    }
}

jsonResponse($activities);

/**
 * Generate smart description based on activity type
 */
function generateActivityDescription($activity) {
    $type = $activity['type'] ?? 'Aktivitet';
    $title = $activity['title'] ?? '';
    $location = $activity['location'] ?? '';
    
    $descriptions = [
        'Tur' => [
            "Bli med på en flott tur i naturskjønne omgivelser! Dette er en ypperlig mulighet til å oppleve norsk natur sammen med andre medvandrere.",
            "En herlig turopplevelse venter! Vi utforsker naturen sammen og skaper gode minner underveis.",
        ],
        'Motivasjonstur' => [
            "En inspirerende helgetur som gir nye impulser og motivasjon! Vi kombinerer naturopplevelser med personlig utvikling.",
            "Ladepause for kropp og sinn! Opplev naturen og bygg relasjoner med andre medvandrere.",
        ],
        'Møte' => [
            "Viktig møte for medlemmer. Vi diskuterer aktuelle saker og planlegger kommende aktiviteter.",
        ],
        'Arrangement' => [
            "Et spennende arrangement som bringer oss sammen! Opplev fellesskap og nye bekjentskaper.",
        ],
        'Konferanse' => [
            "En faglig samling med interessante foredrag og mulighet for nettverksbygging.",
        ],
    ];
    
    $typeDescriptions = $descriptions[$type] ?? ["En flott aktivitet arrangert av Medvandrerne!"];
    $index = abs(crc32($title)) % count($typeDescriptions);
    $description = $typeDescriptions[$index];
    
    if (!empty($location) && $location !== 'Har ikke sted') {
        $description .= " Vi møtes ved " . $location . ".";
    }
    
    return $description;
}

