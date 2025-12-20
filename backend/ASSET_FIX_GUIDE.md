# Asset Path Fix Guide

## Problem
Getting 404 errors for `admin.css` and `admin.js`:
- `GET https://henrikb30.sg-host.com/backend/assets/css/admin.css 404`
- `GET https://henrikb30.sg-host.com/backend/assets/js/admin.js 404`

## Quick Fix Options

### Option 1: Verify File Structure
Ensure your server has this structure:
```
/public_html/ (or root)
├── index.php
├── backend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── admin.css
│   │   └── js/
│   │       └── admin.js
│   ├── config.php
│   └── pages/
```

### Option 2: Use Relative Paths
If absolute URLs don't work, edit `index.php` and change:
```php
// From:
$cssUrl = $assetsBase . '/css/admin.css';
$jsUrl = $assetsBase . '/js/admin.js';

// To:
$cssUrl = 'backend/assets/css/admin.css';
$jsUrl = 'backend/assets/js/admin.js';
```

### Option 3: Check File Permissions
On server, run:
```bash
chmod -R 755 backend/assets/
```

### Option 4: Test Asset Paths
1. Visit: `https://henrikb30.sg-host.com/backend/debug-assets.php`
2. This will show where files are located
3. Use the recommended path shown

### Option 5: Verify BASE_URL
Check `backend/config.php`:
```php
define('BASE_URL', 'https://henrikb30.sg-host.com/');
```
Make sure there's a trailing slash and the domain is correct.

## Debug Steps

1. **Check if files exist:**
   - Visit: `https://henrikb30.sg-host.com/backend/assets/css/admin.css` directly
   - If 404, files aren't uploaded correctly

2. **Check server structure:**
   - Use FTP/cPanel File Manager
   - Verify `backend/assets/` folder exists
   - Verify CSS and JS files are inside

3. **Test with debug script:**
   - Upload `test-assets.php` to root
   - Visit: `https://henrikb30.sg-host.com/test-assets.php`
   - Check output for file locations

4. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Network tab
   - See exact URL being requested
   - Verify it matches server structure

## Most Common Issues

1. **Files not uploaded:** Assets folder missing on server
2. **Wrong path:** Server structure different than expected  
3. **Permissions:** Files not readable by web server
4. **BASE_URL wrong:** Domain or trailing slash incorrect

## Solution Applied

The code now:
- Detects asset location automatically
- Falls back to default path if detection fails
- Uses absolute URLs (can switch to relative if needed)
- Includes debug comments in HTML source

If still getting 404, try Option 2 (relative paths) first.
