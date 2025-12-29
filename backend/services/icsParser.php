<?php
/**
 * ICS Calendar Parser
 * Parser for Google Calendar ICS feeds
 */

class ICSParser {
    private $icsContent;
    private $events = [];
    
    public function __construct($icsContent) {
        $this->icsContent = $icsContent;
        $this->parse();
    }
    
    /**
     * Parse ICS content into events array
     */
    private function parse() {
        // Normalize line endings (Google Calendar uses \r\n)
        $content = str_replace("\r\n", "\n", $this->icsContent);
        $content = str_replace("\r", "\n", $content);
        
        $lines = explode("\n", $content);
        $event = null;
        $inEvent = false;
        $currentLine = '';
        
        foreach ($lines as $line) {
            // Handle line continuation (lines starting with space or tab)
            if (strlen($line) > 0 && ($line[0] === ' ' || $line[0] === "\t")) {
                // This is a continuation of the previous line
                $currentLine .= substr($line, 1);
                continue;
            }
            
            // Process previous line if exists
            if (!empty($currentLine)) {
                $this->processLine(trim($currentLine), $event, $inEvent);
            }
            
            $currentLine = $line;
        }
        
        // Process last line
        if (!empty($currentLine)) {
            $this->processLine(trim($currentLine), $event, $inEvent);
        }
    }
    
    /**
     * Process a single complete line
     */
    private function processLine($line, &$event, &$inEvent) {
        if (empty($line)) return;
            
        // Start of event
        if ($line === 'BEGIN:VEVENT') {
            $event = [];
            $inEvent = true;
            return;
        }
        
        // End of event
        if ($line === 'END:VEVENT') {
            if ($event && $inEvent) {
                $this->events[] = $this->formatEvent($event);
            }
            $event = null;
            $inEvent = false;
            return;
        }
        
        // Parse event properties
        if ($inEvent && $event !== null) {
            $this->parseLine($line, $event);
        }
    }
    
    /**
     * Parse a single line of ICS content
     */
    private function parseLine($line, &$event) {
        // Handle parameters (e.g., DTSTART;VALUE=DATE:20240101)
        if (strpos($line, ':') === false) return;
        
        list($key, $value) = explode(':', $line, 2);
        
        // Remove parameters
        $key = preg_replace('/;.*$/', '', $key);
        
        switch ($key) {
            case 'DTSTART':
                $event['start'] = $this->parseDate($value);
                break;
            case 'DTEND':
                $event['end'] = $this->parseDate($value);
                break;
            case 'SUMMARY':
                $event['title'] = $value;
                break;
            case 'DESCRIPTION':
                $event['description'] = str_replace('\\n', "\n", $value);
                break;
            case 'LOCATION':
                $event['location'] = $value;
                break;
            case 'UID':
                $event['uid'] = $value;
                break;
            case 'RRULE':
                $event['rrule'] = $value;
                break;
        }
    }
    
    /**
     * Parse ICS date format
     * Supports: YYYYMMDD, YYYYMMDDTHHmmss, YYYYMMDDTHHmmssZ
     */
    private function parseDate($dateString) {
        // Remove T and Z separators but keep the structure
        $cleanDate = str_replace(['T', 'Z'], '', $dateString);
        
        // Handle date-only format (YYYYMMDD)
        if (strlen($cleanDate) === 8) {
            $year = substr($cleanDate, 0, 4);
            $month = substr($cleanDate, 4, 2);
            $day = substr($cleanDate, 6, 2);
            
            // Validate date
            if (!checkdate((int)$month, (int)$day, (int)$year)) {
                return null;
            }
            
            return "$year-$month-$day";
        }
        
        // Handle datetime format (YYYYMMDDHHmmss or longer)
        if (strlen($cleanDate) >= 8) {
            $year = substr($cleanDate, 0, 4);
            $month = substr($cleanDate, 4, 2);
            $day = substr($cleanDate, 6, 2);
            
            // Validate date
            if (!checkdate((int)$month, (int)$day, (int)$year)) {
                return null;
            }
            
            $hour = strlen($cleanDate) > 8 ? substr($cleanDate, 8, 2) : '00';
            $minute = strlen($cleanDate) > 10 ? substr($cleanDate, 10, 2) : '00';
            $second = strlen($cleanDate) > 12 ? substr($cleanDate, 12, 2) : '00';
            
            // Validate time
            $hour = (int)$hour;
            $minute = (int)$minute;
            $second = (int)$second;
            
            if ($hour < 0 || $hour > 23 || $minute < 0 || $minute > 59 || $second < 0 || $second > 59) {
                return "$year-$month-$day";
            }
            
            return sprintf("%s-%s-%s %02d:%02d:%02d", $year, $month, $day, $hour, $minute, $second);
        }
        
        return null;
    }
    
    /**
     * Format event for app consumption
     */
    private function formatEvent($event) {
        $title = $event['title'] ?? 'Uten tittel';
        $description = $event['description'] ?? '';
        $location = $event['location'] ?? '';
        
        // Detect activity type from title or description
        $type = $this->detectActivityType($title, $description);
        
        // Generate smart description if missing
        if (empty($description)) {
            $description = $this->generateDescription($title, $type, $location);
        }
        
        // Clean up location
        $location = $this->cleanLocation($location);
        
        $formatted = [
            'id' => md5($event['uid'] ?? uniqid()),
            'title' => $title,
            'description' => $description,
            'location' => $location,
            'start' => $event['start'] ?? '',
            'end' => $event['end'] ?? $event['start'] ?? '',
            'uid' => $event['uid'] ?? '',
            'type' => $type,
        ];
        
        // Extract date and time
        if (!empty($formatted['start'])) {
            $parts = explode(' ', $formatted['start']);
            $formatted['date'] = $parts[0];
            $formatted['time'] = isset($parts[1]) ? substr($parts[1], 0, 5) : '';
            
            // If we have end time, create time range
            if (!empty($formatted['end'])) {
                $endParts = explode(' ', $formatted['end']);
                if (isset($endParts[1]) && $parts[0] === $endParts[0]) {
                    // Same day, add end time
                    $endTime = substr($endParts[1], 0, 5);
                    if (!empty($formatted['time']) && $formatted['time'] !== $endTime) {
                        $formatted['time'] = $formatted['time'] . '-' . $endTime;
                    }
                }
            }
        }
        
        // Determine if multi-day
        if (!empty($formatted['start']) && !empty($formatted['end'])) {
            $startDate = $formatted['date'];
            $endDate = explode(' ', $formatted['end'])[0];
            $formatted['multiDay'] = $startDate !== $endDate;
            if ($formatted['multiDay']) {
                $formatted['endDate'] = $endDate;
                $formatted['time'] = 'Hele dagen';
            }
        }
        
        return $formatted;
    }
    
    /**
     * Detect activity type from title and description
     */
    private function detectActivityType($title, $description) {
        $titleLower = mb_strtolower($title);
        $descLower = mb_strtolower($description);
        $combined = $titleLower . ' ' . $descLower;
        
        // Check for specific keywords
        $patterns = [
            'Tur' => ['tur til', 'vandring', 'gåtur', 'fjelltur', 'skogtur', 'natursti', 'turmål'],
            'Motivasjonstur' => ['motivasjonstur', 'mush', 'fjellbris', 'helgetur', 'overnattingstur'],
            'Møte' => ['møte', 'styremøte', 'årsmøte', 'admmøte', 'dugnad', 'planlegging'],
            'Arrangement' => ['arrangement', 'festival', 'femundløpet', 'løp', 'konkurranse', 'stevne'],
            'Kurs' => ['kurs', 'opplæring', 'workshop', 'seminar'],
            'Konferanse' => ['konferanse', 'symposium', 'fagdag'],
            'Sosial' => ['sosial', 'fest', 'samling', 'middag', 'lunsj', 'kafé'],
        ];
        
        foreach ($patterns as $type => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($combined, $keyword) !== false) {
                    return $type;
                }
            }
        }
        
        // Check for local group prefixes
        if (preg_match('/^mv\s|medvandrerne\s/i', $title)) {
            return 'Tur';
        }
        
        return 'Aktivitet';
    }
    
    /**
     * Generate smart description based on activity type
     */
    private function generateDescription($title, $type, $location) {
        $descriptions = [
            'Tur' => [
                "Bli med på en flott tur i naturskjønne omgivelser! Dette er en ypperlig mulighet til å oppleve norsk natur sammen med andre medvandrere. Ta med passende bekledning og godt humør.",
                "En herlig turopplevelse venter! Vi utforsker naturen sammen og skaper gode minner underveis. Turen passer for alle som liker å gå i naturen.",
                "Opplev gleden av å vandre i naturen! Turen byr på frisk luft, flott utsikt og godt fellesskap. Husk å ta med niste og varme klær.",
            ],
            'Motivasjonstur' => [
                "En inspirerende helgetur som gir nye impulser og motivasjon! Vi kombinerer naturopplevelser med personlig utvikling og fellesskap i trygge rammer.",
                "Ladepause for kropp og sinn! Denne turen gir deg mulighet til å koble av fra hverdagen, oppleve naturen og bygge relasjoner med andre medvandrere.",
                "En unik opplevelse som kombinerer friluftsliv, fellesskap og personlig vekst. Sammen skaper vi minner for livet!",
            ],
            'Møte' => [
                "Viktig møte for medlemmer og interesserte. Her diskuterer vi aktuelle saker og planlegger kommende aktiviteter. Din stemme er viktig!",
                "Bli med på møtet og bidra til fellesskapet! Vi tar opp viktige saker og planlegger fremtidige aktiviteter sammen.",
            ],
            'Arrangement' => [
                "Et spennende arrangement som bringer oss sammen! Opplev fellesskap, aktiviteter og nye bekjentskaper i trivelige omgivelser.",
                "Ikke gå glipp av dette arrangementet! Her får du mulighet til å delta, bidra og oppleve noe spesielt sammen med andre.",
            ],
            'Kurs' => [
                "Lær noe nytt og utvikl deg! Dette kurset gir deg verdifull kunnskap og praktiske ferdigheter du kan bruke videre.",
                "En flott mulighet til å utvide horisonten! Kurset kombinerer teori og praksis i et inspirerende læringsmiljø.",
            ],
            'Konferanse' => [
                "En faglig samling med interessante foredrag og mulighet for nettverksbygging. Møt likesinnede og bli inspirert!",
            ],
            'Sosial' => [
                "En hyggelig sosial samling der vi kobler av og bygger vennskap! Ta med godt humør og nyt fellesskapet.",
            ],
            'Aktivitet' => [
                "En flott aktivitet arrangert av Medvandrerne! Vi inviterer deg til å være med på en opplevelse som gir muligheter for vekst, mestring og fellesskap.",
            ],
        ];
        
        // Get descriptions for the type
        $typeDescriptions = $descriptions[$type] ?? $descriptions['Aktivitet'];
        
        // Pick a random description (or cycle based on title hash for consistency)
        $index = abs(crc32($title)) % count($typeDescriptions);
        $description = $typeDescriptions[$index];
        
        // Add location-specific text if available
        if (!empty($location) && $location !== 'Har ikke sted') {
            $description .= "\n\nVi møtes ved " . $location . ".";
        }
        
        return $description;
    }
    
    /**
     * Clean up location string
     */
    private function cleanLocation($location) {
        if (empty($location)) {
            return 'Ikke oppgitt';
        }
        
        // Remove URL schemes if present
        $location = preg_replace('/https?:\/\/[^\s]+/', '', $location);
        $location = trim($location);
        
        if (empty($location)) {
            return 'Se beskrivelse';
        }
        
        return $location;
    }
    
    /**
     * Get parsed events
     */
    public function getEvents() {
        return $this->events;
    }
    
    /**
     * Filter events by date range
     */
    public function filterByDateRange($startDate, $endDate = null) {
        if ($endDate === null) {
            $endDate = date('Y-m-d', strtotime('+1 year'));
        }
        
        return array_filter($this->events, function($event) use ($startDate, $endDate) {
            $eventDate = $event['date'] ?? '';
            return $eventDate >= $startDate && $eventDate <= $endDate;
        });
    }
}

