# API Integrasjon Guide

Denne guiden forklarer hvordan API-integrasjonen fungerer i Medvandrerne-appen.

## Oversikt

Appen bruker nå backend API i stedet for hardkodede data. Data hentes fra serveren, caches lokalt, og oppdateres automatisk.

## Arkitektur

### 1. API Service (`services/api.js`)
- Håndterer kommunikasjon med backend
- Implementerer caching med AsyncStorage
- Cache varer i 24 timer
- Fallback til cache hvis API feiler
- Fallback til default data hvis både API og cache feiler

### 2. App Data Context (`contexts/AppDataContext.js`)
- Provider som deler data gjennom hele appen
- Laster data automatisk ved oppstart
- Støtter manuell oppdatering (`refreshData()`)
- Gir tilgang til loading-state og feilmeldinger

### 3. Oppdaterte komponenter
- `App.js` - Wrapper med `AppDataProvider`
- `HomeScreen.js` - Bruker `useAppData()` hook
- `useRegistrations.js` - Bruker aktiviteter fra context

## Bruk i komponenter

### Grunnleggende bruk

```javascript
import { useAppData } from '../contexts/AppDataContext';

function MyComponent() {
  const { data, loading, error, refreshData } = useAppData();
  
  // Tilgang til data
  const activities = data.activities;
  const news = data.news;
  const organization = data.organization;
  
  // Loading state
  if (loading) {
    return <Text>Laster data...</Text>;
  }
  
  // Feilhåndtering
  if (error) {
    return <Text>Feil: {error}</Text>;
  }
  
  return (
    <View>
      {/* Bruk data her */}
    </View>
  );
}
```

### Manuell oppdatering

```javascript
const { refreshData } = useAppData();

// Oppdater data fra server
const handleRefresh = async () => {
  await refreshData();
};
```

## Tilgjengelig data

Fra `useAppData()` hook:

- `data.organization` - Organisasjonsinfo
- `data.mission` - Misjon og verdier
- `data.coreActivities` - Kjerneaktiviteter
- `data.localGroups` - Lokallag
- `data.administration` - Administrasjon
- `data.board` - Styret
- `data.activities` - Kalenderaktiviteter
- `data.supporters` - Støttespillere
- `data.news` - Nyheter
- `data.gallery` - Galleri
- `data.resources` - Ressurser

## Caching

- Data caches automatisk i AsyncStorage
- Cache varer i 24 timer
- Ved API-feil brukes cache (selv om den er utløpt)
- Cache kan tømmes med `clearCache()` fra API service

## Oppdatere eksisterende skjermer

For å oppdatere en skjerm til å bruke API-data:

1. **Erstatt imports:**
```javascript
// Før:
import { SAMPLE_ACTIVITIES, LOCAL_GROUPS } from '../constants/data';

// Etter:
import { useAppData } from '../contexts/AppDataContext';
```

2. **Bruk hook:**
```javascript
function MyScreen() {
  const { data } = useAppData();
  const activities = data.activities;
  const localGroups = data.localGroups;
  // ...
}
```

## Skjermer som trenger oppdatering

Følgende skjermer bruker fortsatt direkte imports og bør oppdateres:

- [ ] `ActivitiesScreen.js` - Bruker `SAMPLE_ACTIVITIES`
- [ ] `LocalGroupsScreen.js` - Bruker `LOCAL_GROUPS`
- [ ] `AboutScreen.js` - Bruker `MISSION`, `CORE_ACTIVITIES`
- [ ] `ContactScreen.js` - Bruker `ADMINISTRATION`, `BOARD`
- [ ] `NewsScreen.js` - Bruker hardkodede `NEWS_ITEMS`
- [ ] `GalleryScreen.js` - Bruker hardkodede `GALLERY_ITEMS`
- [ ] `ResourcesScreen.js` - Bruker hardkodede `RESOURCES`
- [ ] `CoreActivityDetailScreen.js` - Bruker `CORE_ACTIVITIES`
- [ ] `LocalGroupDetailScreen.js` - Bruker `LOCAL_GROUPS`
- [ ] `PersonDetailScreen.js` - Bruker `ADMINISTRATION`, `BOARD`

## Testing

### Test API-tilkobling

1. Start appen
2. Sjekk console for "Fetching data from API..." eller "Using cached data"
3. Verifiser at data lastes inn

### Test offline-funksjonalitet

1. Last appen med nettverk
2. Skru av nettverk
3. Restart appen
4. Verifiser at cache brukes

### Test oppdatering

1. Oppdater data i admin-panelet
2. I appen: Pull-to-refresh eller restart app
3. Verifiser at ny data vises

## Feilsøking

### Data lastes ikke

- Sjekk at backend er tilgjengelig på `https://henrikb30.sg-host.com/api/all.php`
- Sjekk console for feilmeldinger
- Verifiser at `AppDataProvider` wrapper hele appen i `App.js`

### Cache fungerer ikke

- Sjekk AsyncStorage permissions
- Sjekk console for cache-relaterte feil
- Prøv å tømme cache og starte på nytt

### Feil ved oppdatering

- Sjekk at API-endepunktet returnerer gyldig JSON
- Sjekk CORS-headers på serveren
- Verifiser at data-strukturen matcher forventet format

## Neste steg

1. Oppdater alle skjermer til å bruke `useAppData()`
2. Legg til pull-to-refresh på relevante skjermer
3. Legg til loading-indikatorer
4. Implementer feilhåndtering i UI
5. Legg til "Sist oppdatert"-indikator

## Eksempel: Oppdatere NewsScreen

```javascript
// Før:
const NEWS_ITEMS = [/* hardkodede data */];

// Etter:
import { useAppData } from '../contexts/AppDataContext';

export default function NewsScreen() {
  const { data, loading } = useAppData();
  const newsItems = data.news || [];
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <ScrollView>
      {newsItems.map(news => (
        <NewsCard key={news.id} news={news} />
      ))}
    </ScrollView>
  );
}
```

