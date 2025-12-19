# Medvandrerne App

En komplett React Native-app for Stiftelsen Medvandrerne, bygget med Expo.

## Funksjonalitet

Appen inneholder følgende hovedfunksjoner:

### 1. Hjem-skjerm
- Informasjon om organisasjonen
- Oversikt over kjernevirksomhet
- Mulighet til å støtte organisasjonen (Spleis, VIPPS, bankkonto)
- Kontaktinformasjon

### 2. Aktiviteter-skjerm
- Interaktiv kalender med markering av aktiviteter
- Liste over aktiviteter for valgt dato
- Link til Google Kalender
- Oversikt over kommende større arrangementer

### 3. Lokallag-skjerm
- Oversikt over alle lokallagene
- Kontaktinformasjon for hvert lokallag (koordinator, telefon, e-post)
- Direkte lenker til Facebook-grupper
- Linker til hoved-Facebook-sidene

### 4. Om oss-skjerm
- Organisasjonens verdier og symboler
- Detaljert informasjon om kjernevirksomhet
- Organisasjonsinformasjon
- Liste over støttespillere og samarbeidspartnere

### 5. Kontakt-skjerm
- Komplett kontaktliste for administrasjonen
- Informasjon om styret
- Organisasjonsinformasjon (org.nr, bankkonto, VIPPS)
- Mulighet til å støtte organisasjonen

## Teknisk informasjon

### Teknologier
- **Expo** ~51.0.0
- **React Native** 0.74.5
- **React Navigation** (Bottom Tabs)
- **React Native Calendars** for kalenderfunksjonalitet
- **Expo Vector Icons** for ikoner

### Prosjektstruktur
```
Medvandrerne_app-kopi/
├── App.js                 # Hovedkomponent med navigasjon
├── screens/               # Alle skjermkomponenter
│   ├── HomeScreen.js
│   ├── ActivitiesScreen.js
│   ├── LocalGroupsScreen.js
│   ├── AboutScreen.js
│   └── ContactScreen.js
├── constants/
│   └── data.js           # All organisasjonsdata
├── package.json
├── app.json
└── babel.config.js
```

## Installasjon og kjøring

### Forutsetninger
- Node.js (v14 eller nyere)
- npm eller yarn
- Expo CLI (`npm install -g expo-cli`)

### Installasjon
```bash
# Installer avhengigheter
npm install

# Start utviklingsserveren
npm start
```

### Kjøre på enhet
- **iOS**: Skann QR-koden med Camera-appen
- **Android**: Skann QR-koden med Expo Go-appen
- **Web**: Trykk `w` i terminalen

### Bygge for produksjon
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Design og styling

Appen bruker en grønn fargepalett (#2E7D32) som reflekterer organisasjonens fokus på natur og miljø. Designet er moderne og brukervennlig med:

- Kortbasert layout for lett lesbarhet
- Konsistent fargebruk gjennom hele appen
- Intuitive ikoner fra Ionicons
- Responsivt design som fungerer på alle skjermstørrelser

## Data og innhold

All organisasjonsdata er lagret i `constants/data.js` og kan enkelt oppdateres. Dette inkluderer:

- Organisasjonsinformasjon
- Lokallag og kontakter
- Aktiviteter og arrangementer
- Støttespillere og partnere
- Verdier og misjon

## Funksjoner som kan utvides

- Push-varsler for nye aktiviteter
- Integrasjon med Google Calendar API
- Brukerautentisering for medlemmer
- Påmelding til aktiviteter direkte i appen
- Kartvisning for aktivitetslokasjoner
- Sosial feed fra Facebook
- Offline-støtte

## Lisens

Dette prosjektet er utviklet for Stiftelsen Medvandrerne.

## Kontakt

For spørsmål eller tilbakemeldinger, kontakt:
- E-post: henrik@medvandrerne.org
- Nettsted: https://www.medvandrerne.org


