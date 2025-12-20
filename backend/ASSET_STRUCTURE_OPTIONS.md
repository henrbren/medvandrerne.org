# Asset Structure Options

## Current Setup (Recommended)
- `index.php` i root
- Assets i `backend/assets/`
- URL: `https://henrikb30.sg-host.com/backend/assets/css/admin.css`

## Alternative: Assets in Root
Hvis du vil ha assets direkte i root (uten `/backend` i URL):

### Option 1: Copy assets to root
```bash
# On server
cp -r backend/assets assets
```

### Option 2: Symlink (better - no duplication)
```bash
# On server
ln -s backend/assets assets
```

### Then update index.php:
Endre linje 27-34 til:
```php
if ($isInBackendDir) {
    $cssUrl = 'assets/css/admin.css';
    $jsUrl = 'assets/js/admin.js';
} else {
    // Assets in root/assets/ instead of backend/assets/
    $cssUrl = 'assets/css/admin.css';
    $jsUrl = 'assets/js/admin.js';
}
```

Dette gir URL: `https://henrikb30.sg-host.com/assets/css/admin.css`

## Current Fix Applied
Koden bruker nå relative paths som automatisk detekterer hvor `index.php` ligger:
- Hvis i `backend/`: bruker `assets/css/admin.css`
- Hvis i root: bruker `backend/assets/css/admin.css`

Dette skal fungere uavhengig av BASE_URL eller domain!
