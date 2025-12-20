<?php
/**
 * Input validation helper functions
 */

/**
 * Sanitize string input
 */
function sanitizeString($input, $maxLength = 1000) {
    if (!is_string($input)) {
        return '';
    }
    $input = trim($input);
    $input = substr($input, 0, $maxLength);
    return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate URL
 */
function validateUrl($url) {
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

/**
 * Validate phone number (Norwegian format)
 */
function validatePhone($phone) {
    // Remove spaces and dashes
    $clean = preg_replace('/[\s-]/', '', $phone);
    // Check if it's 8 digits
    return preg_match('/^\d{8}$/', $clean);
}

/**
 * Sanitize array recursively
 */
function sanitizeArray($data, $maxDepth = 10) {
    if ($maxDepth <= 0) {
        return '';
    }
    
    if (is_array($data)) {
        return array_map(function($item) use ($maxDepth) {
            return sanitizeArray($item, $maxDepth - 1);
        }, $data);
    } elseif (is_string($data)) {
        return sanitizeString($data);
    } else {
        return $data;
    }
}

