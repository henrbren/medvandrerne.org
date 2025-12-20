# Feilsøking - 500 Internal Server Error

## Vanlige årsaker og løsninger

### 1. .htaccess-problemer

**Problem:** `.htaccess` kan forårsake 500-feil hvis:
- `.htpasswd`-filen ikke eksisterer
- Stien til `.htpasswd` er feil
- Apache-modulen `mod_auth_basic` ikke er aktivert

**Løsning:**
1. Kommenter ut autentisering i `.htaccess` midlertidig:
```apache
# <IfModule mod_auth_basic.c>
#     AuthType Basic
#     ...
# </IfModule>
```

2. Test om siden laster uten autentisering
3. Hvis det fungerer, opprett `.htpasswd` først, deretter aktiver autentisering

### 2. PHP-versjon eller handler

**Problem:** `AddHandler php7-script .php` fungerer ikke på alle servere

**Løsning:**
- Fjern `AddHandler`-linjen fra `.htaccess` (mange servere håndterer PHP automatisk)
- Eller endre til `AddHandler php-script .php` eller `AddHandler application/x-httpd-php .php`

### 3. Filrettigheter

**Problem:** PHP kan ikke lese/skrive filer

**Løsning:**
```bash
# Sett riktige rettigheter
chmod 755 backend/
chmod 755 backend/data/
chmod 644 backend/data/*.json
chmod 644 backend/*.php
chmod 644 backend/pages/*.php
```

### 4. Data-mappen eksisterer ikke

**Problem:** `data/`-mappen er ikke opprettet

**Løsning:**
```bash
# Opprett mappen manuelt
mkdir -p backend/data/
chmod 755 backend/data/
```

### 5. PHP-feil i koden

**Problem:** Syntaksfeil eller runtime-feil i PHP

**Løsning:**
1. Aktiver error reporting midlertidig i `config.php`:
```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

2. Sjekk PHP error logs på serveren
3. Bruk `test.php` for å diagnostisere problemer

### 6. Manglende filer

**Problem:** Noen filer er ikke lastet opp

**Løsning:**
- Verifiser at alle filer er lastet opp
- Sjekk spesielt at `pages/dashboard.php` eksisterer
- Sjekk at alle JSON-filer i `data/`-mappen eksisterer

## Steg-for-steg feilsøking

### Steg 1: Test PHP
Gå til `https://henrikb30.sg-host.com/backend/test.php`
- Hvis dette fungerer, er PHP aktivert
- Hvis ikke, er problemet med PHP-konfigurasjonen

### Steg 2: Test config
Gå til `https://henrikb30.sg-host.com/backend/config.php`
- Hvis du ser en blank side eller feil, sjekk `config.php`
- Hvis du ser kode, er PHP ikke aktivert for `.php`-filer

**OBS:** Hvis filene er i root, bruk:
- Admin: `https://henrikb30.sg-host.com?page=dashboard`
- API: `https://henrikb30.sg-host.com/api/all.php`

### Steg 3: Test uten .htaccess
1. Gi `.htaccess` et annet navn (f.eks. `.htaccess.bak`)
2. Test om `index.php` laster
3. Hvis det fungerer, er problemet med `.htaccess`

### Steg 4: Sjekk error logs
- Sjekk server error logs (vanligvis i cPanel eller `/var/log/`)
- Se etter spesifikke PHP-feilmeldinger

### Steg 5: Minimal test
Opprett en enkel `test-simple.php`:
```php
<?php
echo "PHP works!";
phpinfo();
?>
```

Hvis dette ikke fungerer, er problemet med PHP-installasjonen, ikke koden.

## Quick Fix

Hvis du trenger en rask løsning:

1. **Fjern autentisering midlertidig:**
   - Kommenter ut AuthType-linjene i `.htaccess`

2. **Fjern AddHandler:**
   - Kommenter ut eller fjern `AddHandler`-linjen

3. **Sjekk filrettigheter:**
   ```bash
   chmod -R 755 backend/
   chmod -R 644 backend/*.php
   ```

4. **Test med test.php:**
   - Gå til `backend/test.php` og se hva som feiler

## Kontakt hosting-provider

Hvis ingenting fungerer, kontakt hosting-provideren (sg-host.com) og spør om:
- PHP-versjon og konfigurasjon
- Hvor error logs finnes
- Om mod_auth_basic er aktivert
- Om .htaccess er aktivert

