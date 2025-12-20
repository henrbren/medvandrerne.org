# Medvandrerne Admin Backend

PHP-basert administrasjonspanel for Medvandrerne-appen. Dette systemet lar deg administrere alt statisk innhold som vises i appen.

## Installasjon

### 1. Last opp filer til serveren

**Viktig:** Filer skal organiseres slik:
- `index.php` skal være i **root** (kopier fra `backend/index.php`)
- `.htaccess` skal være i **root** (kopier fra `backend/.htaccess`)
- `api/`-mappen skal være i **root** (kopier alle filer fra `backend/api/`)
- `backend/`-mappen skal være i **root** (hele mappen)

Se `DEPLOYMENT.md` for detaljert instruksjoner.

### 2. Opprett .htpasswd-fil for autentisering

På serveren, kjør denne kommandoen (eller bruk cPanel/plesk):
```bash
htpasswd -c /home/henrikb30/.htpasswd admin
```

Du vil bli bedt om å oppgi et passord. Dette passordet bruker du for å logge inn i admin-panelet.

Alternativt kan du bruke en online generator: https://hostingcanada.org/htpasswd-generator/

### 3. Sett riktige filrettigheter

Sørg for at `data/`-mappen har skriverettigheter:
```bash
chmod 755 backend/data/
chmod 644 backend/data/*.json
```

### 4. Test installasjonen

Gå til `https://henrikb30.sg-host.com?page=dashboard` i nettleseren. Du skal se admin-panelet.

## Struktur

```
backend/
├── .htaccess              # Autentisering og sikkerhet
├── .htpasswd.example      # Eksempel på passordfil
├── config.php             # Konfigurasjon
├── index.php              # Hovedside
├── README.md              # Denne filen
├── api/                   # API-endepunkter
│   ├── all.php           # Hent alle data
│   ├── organization.php
│   ├── mission.php
│   ├── core-activities.php
│   ├── local-groups.php
│   ├── administration.php
│   ├── board.php
│   ├── activities.php
│   ├── supporters.php
│   ├── news.php
│   ├── gallery.php
│   ├── resources.php
│   └── save.php          # Generisk lagre-endepunkt
├── pages/                 # Admin-sider
│   ├── dashboard.php
│   ├── organization.php
│   ├── mission.php
│   ├── activities.php
│   ├── local-groups.php
│   ├── administration.php
│   ├── board.php
│   ├── supporters.php
│   ├── news.php
│   ├── gallery.php
│   ├── resources.php
│   └── core-activities.php
├── data/                  # JSON-datafiler
│   ├── organization.json
│   ├── mission.json
│   ├── core_activities.json
│   ├── local_groups.json
│   ├── administration.json
│   ├── board.json
│   ├── activities.json
│   ├── supporters.json
│   ├── news.json
│   ├── gallery.json
│   └── resources.json
└── assets/
    ├── css/
    │   └── admin.css
    └── js/
        └── admin.js
```

## Bruk

### Admin Panel

1. Gå til `https://henrikb30.sg-host.com?page=dashboard`
2. Logg inn med brukernavn og passord (satt opp i .htpasswd)
3. Naviger mellom ulike seksjoner i menyen
4. Rediger innhold og klikk "Lagre endringer"

### API Endpoints

Appen kan hente data via følgende endepunkter:

- `api/all.php` - Alle data i én request
- `api/organization.php` - Organisasjonsinfo
- `api/mission.php` - Misjon og verdier
- `api/core-activities.php` - Kjerneaktiviteter
- `api/local-groups.php` - Lokallag
- `api/administration.php` - Administrasjon
- `api/board.php` - Styret
- `api/activities.php` - Kalenderaktiviteter
- `api/supporters.php` - Støttespillere
- `api/news.php` - Nyheter
- `api/gallery.php` - Galleri
- `api/resources.php` - Ressurser

Alle endepunkter returnerer JSON og støtter CORS.

## Sikkerhet

- Admin-panelet er beskyttet med HTTP Basic Authentication via .htaccess
- API-endepunktene er åpne for lesing (GET), men skriving (POST/PUT/DELETE) krever autentisering
- JSON-filer lagres lokalt på serveren
- Alle input sanitizes før lagring

## Oppdatering av appen

For å hente data fra backend i React Native-appen, kan du:

1. Opprett en service-fil som henter data fra API-endepunktene
2. Cache data lokalt i appen
3. Oppdater cache når appen starter eller når brukeren trekker for å oppdatere

Eksempel:
```javascript
// services/api.js
const API_BASE = 'https://henrikb30.sg-host.com/api/';

export async function fetchAllData() {
  const response = await fetch(`${API_BASE}all.php`);
  return await response.json();
}
```

## Feilsøking

**Problem: Innlogging fungerer ikke**
- Sjekk at .htpasswd-filen eksisterer og er plassert riktig
- Sjekk at .htaccess-filen er aktivert på serveren
- Kontroller filrettigheter

**Problem: Data lagres ikke**
- Sjekk at `data/`-mappen har skriverettigheter (chmod 755)
- Sjekk serverlogs for PHP-feil

**Problem: API returnerer feil**
- Sjekk at JSON-filene er gyldig JSON
- Sjekk PHP error logs
- Test endepunktene direkte i nettleseren

## Support

For spørsmål eller problemer, kontakt utvikleren.

