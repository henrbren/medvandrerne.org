# Asset Path Fix - 404 Feil

## Problem

Hvis du får 404-feil på `admin.css` og `admin.js`, betyr det at asset paths ikke er riktige.

## Løsning

`index.php` har nå automatisk deteksjon av hvor den ligger og setter asset paths deretter.

### Hvis index.php er i root:
- Assets: `backend/assets/css/admin.css`
- Assets: `backend/assets/js/admin.js`

### Hvis index.php er i backend/:
- Assets: `assets/css/admin.css`
- Assets: `assets/js/admin.js`

## Debugging

1. Gå til `https://henrikb30.sg-host.com/backend/ASSET_PATH_DEBUG.php`
2. Se hvilke paths som detekteres
3. Verifiser at filene faktisk eksisterer på de stedene som vises

## Manuell Fix

Hvis automatisk deteksjon ikke fungerer, kan du manuelt sette asset base i `index.php`:

```php
// Sett denne direkte basert på hvor index.php ligger
$assetsBase = 'backend/assets'; // Hvis index.php er i root
// ELLER
$assetsBase = 'assets'; // Hvis index.php er i backend/
```

## Verifisering

Etter fix, sjekk nettleser console:
- Skal ikke se 404 på `admin.css`
- Skal ikke se 404 på `admin.js`
- CSS skal lastes og styling skal fungere
- JavaScript skal fungere (modaler, forms, etc.)

## Vanlige Årsaker

1. **Filer ikke lastet opp:** Sjekk at `backend/assets/` mappen eksisterer på serveren
2. **Feil filrettigheter:** `chmod 644 backend/assets/css/admin.css`
3. **Feil struktur:** Verifiser at mappestrukturen er riktig
4. **Cache:** Prøv hard refresh (Ctrl+F5 eller Cmd+Shift+R)
