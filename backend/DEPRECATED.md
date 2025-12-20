# Deprecated Features

## Gallery System

**Status:** Deprecated - Bruk Google Calendar i stedet

Gallery-systemet er erstattet av Google Calendar-integrasjonen. Følgende filer er deprecated:

- `backend/pages/gallery.php` - Erstattet av `calendar-config.php`
- `backend/api/gallery.php` - Erstattet av `calendar.php`
- `backend/data/gallery.json` - Brukes ikke lenger

**Migrering:**
1. Konfigurer Google Calendar i admin-panelet under "Google Calendar"
2. Gallery-data vil ikke lenger vises i appen
3. For å beholde bilder, vurder å legge dem til som nyheter eller ressurser

**Fjernelse:**
Disse filene kan fjernes i fremtidige versjoner, men er beholdt for bakoverkompatibilitet.
