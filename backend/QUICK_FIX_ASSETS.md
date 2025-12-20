# Quick Fix for 404 Asset Errors

## Hvis du får 404 på admin.css og admin.js

### Løsning 1: Sjekk filstruktur på serveren

Verifiser at filene eksisterer:
```
/public_html/ (eller root)
├── index.php
└── backend/
    └── assets/
        ├── css/
        │   └── admin.css
        └── js/
            └── admin.js
```

### Løsning 2: Bruk absolute paths

Hvis relative paths ikke fungerer, endre i `index.php` linje ~34:

**Før:**
```php
$assetsBase = $isBackendDir ? 'assets' : 'backend/assets';
```

**Etter:**
```php
// Force absolute URL
$assetsBase = BASE_URL . 'backend/assets';
```

Og oppdater HTML:
```php
<link rel="stylesheet" href="<?= $assetsBase ?>/css/admin.css">
```
blir til:
```php
<link rel="stylesheet" href="<?= BASE_URL ?>backend/assets/css/admin.css">
```

### Løsning 3: Debug

1. Gå til `https://henrikb30.sg-host.com/backend/ASSET_PATH_DEBUG.php`
2. Se hva som detekteres
3. Sjekk nettleser console for faktiske paths som lastes

### Løsning 4: Hardcode paths

Hvis ingenting fungerer, hardcode paths direkte i HTML:

```php
<link rel="stylesheet" href="https://henrikb30.sg-host.com/backend/assets/css/admin.css">
<script src="https://henrikb30.sg-host.com/backend/assets/js/admin.js"></script>
```

## Verifisering

Etter fix:
- Åpne nettleser console (F12)
- Sjekk Network-tab
- Verifiser at admin.css og admin.js laster uten 404
- Sjekk at styling fungerer (sidebar skal være rød)

