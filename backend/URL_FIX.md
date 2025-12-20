# URL Fix - Flytt fra /backend/ til root

## Endringer gjort

Alle referanser er oppdatert fra `/backend/` til root:

### Konfigurasjon
- `BASE_URL`: `https://henrikb30.sg-host.com/` (uten /backend/)
- `API_URL`: `https://henrikb30.sg-host.com/api/` (uten /backend/)

### Filer oppdatert
1. `backend/config.php` - BASE_URL og API_URL
2. `services/api.js` - API_BASE_URL
3. `backend/index.php` - Asset paths og page paths

## Installasjon

### Struktur på serveren
```
/public_html/ (eller root)
├── index.php (kopier fra backend/index.php)
├── .htaccess (kopier fra backend/.htaccess)
├── backend/
│   ├── config.php
│   ├── pages/
│   ├── api/
│   ├── assets/
│   ├── data/
│   └── services/
└── api/ (kopier alle filer fra backend/api/)
    ├── all.php
    ├── organization.php
    ├── calendar.php
    etc.
```

### Steg-for-steg

1. **Kopier index.php til root:**
   ```bash
   cp backend/index.php index.php
   ```

2. **Kopier .htaccess til root:**
   ```bash
   cp backend/.htaccess .htaccess
   ```

3. **Opprett api/ mappe i root og kopier filer:**
   ```bash
   mkdir api
   cp backend/api/* api/
   ```

4. **Oppdater require paths i api-filene:**
   Endre fra `require_once '../config.php'` til `require_once __DIR__ . '/../backend/config.php'`

5. **Test:**
   - Gå til `https://henrikb30.sg-host.com?page=dashboard`
   - Test API: `https://henrikb30.sg-host.com/api/all.php`

## Alternativ: Behold alt i backend/

Hvis du foretrekker å beholde alt i backend/-mappen, kan du:
1. Opprett en `.htaccess` i root som redirecter til backend/
2. Eller bruk en rewrite rule

Men basert på URL-en du ga, ser det ut som filene skal være i root.
