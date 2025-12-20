# Fix JSON Error - "Failed to execute 'json' on 'Response'"

## Problem
Feilmelding: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

Dette betyr at API-endpointet returnerer tom respons eller ugyldig JSON.

## Løsninger implementert

### 1. Forbedret feilhåndtering i admin.js
- Sjekker om responsen er OK før JSON-parsing
- Sjekker om responsen er tom
- Gir bedre feilmeldinger ved JSON-parse-feil

### 2. Forbedret jsonResponse() i config.php
- Håndterer JSON-encoding-feil
- Returnerer feilmelding hvis encoding feiler
- Logger feil til error_log

### 3. Robust config.php path detection
- API-filer prøver flere mulige stier til config.php
- Gir klar feilmelding hvis config ikke finnes

## Vanlige årsaker

1. **Config.php ikke funnet:**
   - API-filer kan ikke finne config.php
   - Sjekk at config.php ligger på riktig sted
   - Sjekk server logs for "Config file not found"

2. **Tom respons fra server:**
   - PHP-feil som ikke vises
   - Sjekk PHP error logs
   - Aktiver `display_errors` midlertidig for debugging

3. **JSON encoding feiler:**
   - Data inneholder ugyldige tegn
   - Sjekk error_log for "JSON encoding failed"

## Debugging

1. **Aktiver error display midlertidig:**
   I `config.php`, endre:
   ```php
   ini_set('display_errors', 1);
   ```

2. **Sjekk browser console:**
   - Åpne DevTools (F12)
   - Gå til Network tab
   - Se på responsen fra `api/save.php`
   - Sjekk Response tab for faktisk innhold

3. **Test API direkte:**
   ```
   https://henrikb30.sg-host.com/api/save.php
   ```
   Skal returnere JSON-feil hvis noe er galt

4. **Sjekk server logs:**
   - cPanel Error Logs
   - PHP error log
   - Apache error log

## Test

Etter oppdatering, test:
1. Last opp oppdaterte filer
2. Åpne admin panel
3. Prøv å lagre noe
4. Sjekk browser console for bedre feilmeldinger

