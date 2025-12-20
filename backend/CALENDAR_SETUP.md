# Google Calendar Integrasjon - Oppsett

## Oversikt

Backend er nå konfigurert til å hente aktiviteter fra Google Calendar via ICS-feed i stedet for statisk galleri-data.

## Hvordan det fungerer

1. **ICS Parser** (`services/icsParser.php`) - Parser Google Calendar ICS-format
2. **Calendar API** (`api/calendar.php`) - Henter og cacher kalenderdata
3. **Admin Panel** - Konfigurerer Google Calendar URL
4. **Cache** - Kalenderdata caches i 1 time for bedre ytelse

## Oppsett i Admin Panel

1. Gå til admin-panelet: `https://henrikb30.sg-host.com?page=dashboard`
2. Klikk på "Google Calendar" i menyen
3. Følg instruksjonene for å hente Google Calendar ICS URL
4. Lim inn URL-en og aktiver synkronisering
5. Klikk "Test kalender-tilkobling" for å verifisere
6. Lagre innstillinger

## Hente Google Calendar ICS URL

### Metode 1: Offentlig kalender
1. Gå til [Google Calendar](https://calendar.google.com)
2. Klikk på "Innstillinger" (tannhjul) → "Innstillinger"
3. I venstre meny, under "Kalendere", klikk på kalenderen du vil dele
4. Scroll ned til "Integrer kalender"
5. Kopier "Offentlig URL i iCal-format"
6. Format: `https://calendar.google.com/calendar/ical/.../public/basic.ics`

### Metode 2: Privat kalender med deling
1. Gå til kalenderinnstillinger
2. Under "Del med spesifikke personer", legg til e-post
3. Under "Integrer kalender", kopier "Privat URL i iCal-format"
4. Format: `https://calendar.google.com/calendar/ical/.../private-xxxxx/basic.ics`

## API Endpoints

### Hent kalenderaktiviteter
```
GET /api/calendar.php
```
Returnerer array med aktiviteter fra Google Calendar.

### Test kalender-tilkobling
```
GET /api/test-calendar.php?url=<ICS_URL>
```
Tester en ICS URL og returnerer antall aktiviteter.

### Lagre kalender-konfigurasjon
```
POST /api/save-calendar-config.php
Body: { "enabled": true, "googleCalendarUrl": "..." }
```

### Tøm cache
```
POST /api/clear-calendar-cache.php
```

## Dataformat

Kalenderaktiviteter returneres i følgende format:

```json
{
  "id": "unique-id",
  "title": "Aktivitetsnavn",
  "description": "Beskrivelse",
  "location": "Sted",
  "date": "2024-01-15",
  "time": "14:00",
  "start": "2024-01-15 14:00:00",
  "end": "2024-01-15 16:00:00",
  "multiDay": false,
  "endDate": null,
  "uid": "google-calendar-uid"
}
```

## Cache

- Kalenderdata caches i 1 time
- Cache lagres i `data/calendar_cache.json`
- Ved oppdatering av konfigurasjon, tøm cache for å hente ny data

## Feilsøking

### Kalenderen laster ikke aktiviteter
1. Sjekk at Google Calendar URL er riktig
2. Verifiser at kalenderen er offentlig eller delt
3. Test URL-en direkte i nettleseren (skal laste ned .ics-fil)
4. Sjekk server error logs

### Cache oppdateres ikke
1. Tøm cache via admin-panelet eller API
2. Vent 1 time for automatisk oppdatering
3. Sjekk filrettigheter på `data/calendar_cache.json`

### Feil ved parsing
1. Sjekk at ICS-formatet er gyldig
2. Verifiser at kalenderen har aktiviteter
3. Sjekk PHP error logs for detaljerte feilmeldinger

## Frontend Integrasjon

I React Native-appen, bruk:

```javascript
const { data } = useAppData();
const calendarEvents = data.calendar || [];
```

Kalenderaktiviteter er automatisk tilgjengelige via `useAppData()` hook.

## Sikkerhet

- Privat ICS URL-er inneholder tokens - ikke del disse offentlig
- Bruk offentlige kalendere når mulig
- Vurder å begrense tilgang til admin-panelet

