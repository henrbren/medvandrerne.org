# Deployment Guide - Root Installasjon

## Struktur på Serveren

Filer skal organiseres slik på serveren:

```
/public_html/ (eller root directory)
├── index.php              # Kopier fra backend/index.php
├── .htaccess             # Kopier fra backend/.htaccess
├── .htpasswd             # Opprett på serveren
│
├── api/                  # Kopier alle filer fra backend/api/
│   ├── all.php
│   ├── organization.php
│   ├── calendar.php
│   └── ... (alle andre API-filer)
│
└── backend/              # Hele backend-mappen
    ├── config.php
    ├── pages/
    ├── assets/
    ├── data/
    └── services/
```

## Steg-for-steg Installasjon

### 1. Last opp backend-mappen
Last opp hele `backend/`-mappen til serveren som den er.

### 2. Kopier index.php til root
```bash
cp backend/index.php index.php
```

### 3. Kopier .htaccess til root
```bash
cp backend/.htaccess .htaccess
```

### 4. Opprett api-mappe og kopier filer
```bash
mkdir api
cp backend/api/* api/
```

### 5. Opprett .htpasswd
På serveren:
```bash
htpasswd -c /home/henrikb30/.htpasswd admin
```

### 6. Sett filrettigheter
```bash
chmod 755 backend/
chmod 755 backend/data/
chmod 755 api/
chmod 644 backend/data/*.json
chmod 644 api/*.php
chmod 644 index.php
```

## URL Struktur

Etter installasjon:
- **Admin Panel:** `https://henrikb30.sg-host.com?page=dashboard`
- **API Endpoints:** `https://henrikb30.sg-host.com/api/all.php`
- **Assets:** `https://henrikb30.sg-host.com/backend/assets/css/admin.css`

## Verifisering

1. Test admin panel: `https://henrikb30.sg-host.com?page=dashboard`
2. Test API: `https://henrikb30.sg-host.com/api/all.php`
3. Test health: `https://henrikb30.sg-host.com/api/health.php`

## Viktig

- Alle API-filer bruker `__DIR__ . '/../backend/config.php'` for å finne config
- `index.php` bruker `__DIR__ . '/backend/pages/...'` for å finne pages
- Asset paths i `index.php` peker til `backend/assets/...`

## Feilsøking

Hvis API-endepunkter ikke fungerer:
1. Sjekk at `api/`-mappen eksisterer i root
2. Sjekk at alle API-filer er kopiert
3. Sjekk filrettigheter (644 for PHP-filer)
4. Sjekk error logs for require_once feil

Hvis admin panel ikke laster:
1. Sjekk at `index.php` er i root
2. Sjekk at `backend/`-mappen eksisterer
3. Sjekk asset paths i nettleser console

