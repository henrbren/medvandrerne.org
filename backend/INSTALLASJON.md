# Installasjonsguide - Medvandrerne Admin Backend

## Steg-for-steg installasjon

### 1. Last opp filer

**Viktig:** Filer skal organiseres i root, ikke i `/backend/`-mappen:

1. Kopier `backend/index.php` til root som `index.php`
2. Kopier `backend/.htaccess` til root som `.htaccess`
3. Opprett `api/`-mappe i root og kopier alle filer fra `backend/api/`
4. Last opp hele `backend/`-mappen til root

Se `DEPLOYMENT.md` for detaljert instruksjoner.

### 2. Opprett passordfil (.htpasswd)

**Alternativ A: Via SSH/Terminal**
```bash
cd /home/henrikb30/
htpasswd -c .htpasswd admin
```
Du vil bli bedt om å oppgi et passord. Husk dette passordet!

**Alternativ B: Via cPanel**
1. Gå til "Password Protection" eller "Directory Privacy"
2. Velg `/backend/`-mappen
3. Opprett bruker "admin" med passord

**Alternativ C: Online generator**
1. Gå til https://hostingcanada.org/htpasswd-generator/
2. Skriv inn brukernavn: `admin`
3. Skriv inn passord
4. Kopier den genererte linjen
5. Opprett fil `.htpasswd` i `/home/henrikb30/` med innholdet

### 3. Sett filrettigheter

Via SSH/Terminal:
```bash
chmod 755 backend/data/
chmod 644 backend/data/*.json
```

Via cPanel File Manager:
- Høyreklikk på `data/`-mappen → "Change Permissions" → sett til `755`
- Høyreklikk på hver JSON-fil → "Change Permissions" → sett til `644`

### 4. Test installasjonen

1. Gå til `https://henrikb30.sg-host.com?page=dashboard` i nettleseren
2. Du skal se en innloggingsdialog
3. Logg inn med:
   - Brukernavn: `admin`
   - Passord: (det du satte opp i steg 2)

### 5. Verifiser at alt fungerer

1. Gå til Dashboard-siden
2. Prøv å redigere noe i "Organisasjon"-seksjonen
3. Klikk "Lagre endringer"
4. Du skal se en bekreftelsesmelding

## Feilsøking

### "401 Unauthorized" eller ingen innloggingsdialog
- Sjekk at `.htaccess`-filen er lastet opp
- Sjekk at `.htpasswd`-filen eksisterer på riktig sted
- Kontroller at Apache mod_rewrite er aktivert

### "500 Internal Server Error"
- Sjekk PHP error logs
- Sjekk at `data/`-mappen har skriverettigheter (755)
- Sjekk at JSON-filene har leserettigheter (644)

### Data lagres ikke
- Sjekk filrettigheter på `data/`-mappen (må være 755 eller 777)
- Sjekk at PHP har skriverettigheter til mappen
- Sjekk diskplass på serveren

### API-endepunkter returnerer feil
- Test endepunktet direkte i nettleseren: `https://henrikb30.sg-host.com/backend/api/organization.php`
- Sjekk at JSON-filene er gyldig JSON (bruk JSON validator)
- Sjekk PHP error logs

## Neste steg

Når backend er installert og fungerer:

1. Test alle admin-sidene
2. Legg til ekte innhold i stedet for dummy-data
3. Oppdater React Native-appen til å hente data fra API-endepunktene
4. Implementer caching i appen for offline-tilgang

## Sikkerhetstips

- Bruk et sterkt passord for admin-brukeren
- Vurder å endre brukernavnet fra "admin" til noe mer unikt
- Hold PHP-versjonen oppdatert
- Vurder å legge til IP-restriksjoner hvis mulig
- Ta backup av `data/`-mappen regelmessig
