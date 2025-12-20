# Quick Fix: Use Relative Paths

If you're getting 404 errors for CSS/JS files, try using relative paths instead of absolute URLs.

## Quick Fix

Edit `backend/index.php` and find these lines (around line 54-62):

```php
<?php
// Try absolute URL first, fallback to relative if needed
$cssUrl = $assetsBase . '/css/admin.css';
$jsUrl = $assetsBase . '/js/admin.js';

// Alternative: Use relative path (uncomment if absolute doesn't work)
// $cssUrl = 'backend/assets/css/admin.css';
// $jsUrl = 'backend/assets/js/admin.js';
?>
```

**Change to:**

```php
<?php
// Use relative paths (works better on some servers)
$cssUrl = 'backend/assets/css/admin.css';
$jsUrl = 'backend/assets/js/admin.js';
?>
```

This will use relative paths that work regardless of domain or BASE_URL configuration.

## Why This Works

Relative paths like `backend/assets/css/admin.css` are resolved relative to the current page URL:
- If page is `https://henrikb30.sg-host.com?page=dashboard`
- CSS loads from `https://henrikb30.sg-host.com/backend/assets/css/admin.css`

This avoids issues with:
- BASE_URL configuration
- Document root detection
- File system path detection

## After Making Change

1. Save the file
2. Upload to server
3. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
4. Refresh the page

The CSS and JS should now load correctly!

