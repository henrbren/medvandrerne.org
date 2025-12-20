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
        $formatted = [
            'id' => md5($event['uid'] ?? uniqid()),
            'title' => $event['title'] ?? 'Uten tittel',
            'description' => $event['description'] ?? '',
            'location' => $event['location'] ?? '',
            'start' => $event['start'] ?? '',
            'end' => $event['end'] ?? $event['start'] ?? '',
            'uid' => $event['uid'] ?? '',
        ];
        
        // Extract date and time
        if (!empty($formatted['start'])) {
            $parts = explode(' ', $formatted['start']);
            $formatted['date'] = $parts[0];
            $formatted['time'] = isset($parts[1]) ? substr($parts[1], 0, 5) : '';
        }
        
        // Determine if multi-day
        if (!empty($formatted['start']) && !empty($formatted['end'])) {
            $startDate = $formatted['date'];
            $endDate = explode(' ', $formatted['end'])[0];
            $formatted['multiDay'] = $startDate !== $endDate;
            if ($formatted['multiDay']) {
                $formatted['endDate'] = $endDate;
            }
        }
        
        return $formatted;
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
