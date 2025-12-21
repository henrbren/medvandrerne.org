import { theme } from '../constants/theme';

export const getLevelName = (levelNum) => {
  const levelNames = {
    1: 'Sokk',
    2: 'Sko',
    3: 'Sovepose',
    4: 'Ryggsekk',
    5: 'Skalljakke',
    6: 'Lue',
    7: 'Ski',
    8: 'Bålet',
    9: 'Kompass',
    10: 'Vandrestav',
    11: 'Fjellvandrer',
    12: 'Nordlys',
    13: 'Midnattssol',
    14: 'Aurora',
    15: 'Stjernevandrer',
    16: 'Måneskinn',
    17: 'Soloppgang',
    18: 'Fjelltopp',
    19: 'Stormvind',
    20: 'Torden',
    21: 'Blitz',
    22: 'Regnbue',
    23: 'Tornado',
    24: 'Orkan',
    25: 'Tsunami',
    26: 'Vulkan',
    27: 'Jordskjelv',
    28: 'Nova',
    29: 'Supernova',
    30: 'Univers',
  };
  return levelNames[levelNum] || `Nivå ${levelNum}`;
};

export const getLevelColors = (levelNum) => {
  if (levelNum <= 2) {
    // Medvandrer red theme for beginners
    return {
      primary: '#E53935',
      secondary: '#EF5350',
      glow: '#FF5252',
      background: null,
    };
  } else if (levelNum <= 4) {
    return {
      primary: theme.colors.primary,
      secondary: theme.colors.primaryLight,
      glow: theme.colors.primary,
      background: null,
    };
  } else if (levelNum <= 6) {
    return {
      primary: theme.colors.success,
      secondary: '#4ADE80',
      glow: theme.colors.success,
      background: null,
    };
  } else if (levelNum <= 8) {
    return {
      primary: theme.colors.info,
      secondary: '#22D3EE',
      glow: theme.colors.info,
      background: null,
    };
  } else if (levelNum <= 10) {
    return {
      primary: theme.colors.warning,
      secondary: '#FBBF24',
      glow: theme.colors.warning,
      background: null,
    };
  } else if (levelNum <= 12) {
    return {
      primary: '#A855F7',
      secondary: '#C084FC',
      glow: '#E879F9',
      background: '#0A0510',
    };
  } else if (levelNum <= 15) {
    return {
      primary: '#EC4899',
      secondary: '#F472B6',
      glow: '#FB7185',
      background: '#0F0509',
    };
  } else if (levelNum <= 18) {
    return {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      glow: '#FCD34D',
      background: '#0F0A05',
    };
  } else if (levelNum <= 21) {
    return {
      primary: '#EF4444',
      secondary: '#F87171',
      glow: '#FCA5A5',
      background: '#0F0505',
    };
  } else if (levelNum <= 24) {
    return {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      glow: '#C4B5FD',
      background: '#0D0510',
    };
  } else if (levelNum <= 27) {
    return {
      primary: '#06B6D4',
      secondary: '#22D3EE',
      glow: '#67E8F9',
      background: '#050F12',
    };
  } else if (levelNum <= 29) {
    return {
      primary: '#F97316',
      secondary: '#FB923C',
      glow: '#FDBA74',
      background: '#0F0805',
    };
  } else {
    return {
      primary: '#6366F1',
      secondary: '#818CF8',
      glow: '#A5B4FC',
      background: '#050510',
    };
  }
};

export const getLevelAnimationConfig = (levelNum) => {
  if (levelNum <= 4) {
    return { pulse: false, glow: false, stars: false, particles: false, intensity: 1 };
  } else if (levelNum <= 7) {
    return { pulse: true, glow: false, stars: true, particles: false, intensity: 1.2 };
  } else if (levelNum <= 10) {
    return { pulse: true, glow: true, stars: true, particles: true, intensity: 1.5 };
  } else if (levelNum <= 12) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 2 };
  } else if (levelNum <= 15) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 2.5, rainbow: true };
  } else if (levelNum <= 18) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 3, rainbow: true, rapid: true };
  } else if (levelNum <= 21) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 3.5, rainbow: true, rapid: true, flash: true };
  } else if (levelNum <= 24) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 4, rainbow: true, rapid: true, flash: true, wave: true };
  } else if (levelNum <= 27) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 4.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true };
  } else if (levelNum <= 29) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, legendary: true };
  } else {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 6, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, legendary: true, universe: true };
  }
};

export const getAchievementMotivation = (achievementId) => {
  const motivations = {
    'first_activity': 'Fantastisk! Du har tatt det første steget på din reise mot bedring. Hver aktivitet er en seier over fortiden, og du viser at du har styrken til å velge noe annet. Fortsett å bygge på denne styrken - du er på rett vei!',
    'five_activities': 'Imponerende! Du har nå fullført 5 aktiviteter, og det viser at du har utholdenhet og viljestyrke. Hver gang du velger aktivitet over avhengighet, bygger du en ny identitet. Du er i gang med å skape en bedre versjon av deg selv. Hold ut!',
    'ten_activities': 'Aktiv deltaker! 10 aktiviteter viser at du har tatt et reelt valg om forandring. Du har bevist at du kan gjøre det vanskelige valget dag etter dag. Dette er ekte styrke - styrken til å fortsette selv når det er vanskelig. Du er en inspirasjon!',
    'first_reflection': 'Refleksjon er en kraftfull verktøy i bedringsprosessen. Ved å reflektere over din reise, anerkjenner du både utfordringene og seirene. Dette viser at du tar ansvar for din egen vekst. Fortsett å være ærlig med deg selv - det er der sanningen og friheten ligger.',
    'five_reflections': 'Refleksjonstenker! Du har nå skrevet 5 refleksjoner, og det viser at du tar tiden til å forstå deg selv bedre. Selvinnsikt er grunnlaget for varig forandring. Ved å reflektere, bygger du en sterkere forståelse av hvem du er og hvem du vil bli. Fortsett denne viktige praksisen!',
    'first_moment': 'Mestringsmoment! Dette er øyeblikkene som teller - når du erkjenner din egen styrke og prestasjoner. Å feire disse øyeblikkene er viktig i bedringsprosessen. Du fortjener å anerkjenne hvor langt du har kommet. Dette er bare begynnelsen!',
    'streak_week': 'Ukestreak! En hel uke på rad viser at du har utholdenhet og konsistens. Disse egenskapene er avgjørende i bedringsprosessen. Du bygger nye rutiner og viser deg selv at du kan holde ut. Hver dag er en seier - fortsett!',
    'streak_month': 'Månedstreak! 4 uker på rad er en enorm prestasjon. Du har bevist at du kan holde ut gjennom utfordringer og motgang. Dette viser ekte transformasjon - du er ikke lenger den personen du var. Du er sterkere, visere og mer bestemt. Fortsett å bygge på denne styrken!',
    'first_expedition': 'Oppdagelse! Å gå på ekspedisjon er en metafor for din reise - du utforsker nye steder både utenfor og inni deg. Hver ekspedisjon viser at du er villig til å ta risiko og utforske det ukjente. Dette er modig, og modighet er nødvendig for forandring.',
    'environment_warrior': 'Miljøkriger! Ved å ta vare på miljøet, viser du at du bryr deg om noe større enn deg selv. Dette er en viktig del av bedringsprosessen - å finne mening og formål utenfor deg selv. Du bygger en identitet som er basert på omsorg og ansvar.',
    'first_skill': 'Ferdighet! Å lære nye ferdigheter viser at du er villig til å vokse og utvikle deg. I bedringsprosessen handler det om å bygge en ny identitet, og ferdigheter er byggesteinene. Hver ferdighet du lærer, gjør deg sterkere og mer selvsikker.',
    'five_skills': 'Kompetent! Du har nå lært 5 ferdigheter, og det viser at du har evnen til å lære og vokse. Dette er bevis på at du kan mestre nye utfordringer. I bedringsprosessen handler det om å erstatte gamle mønstre med nye ferdigheter og styrker.',
    'all_skills': 'Ferdighetsmester! Du har lært alle ferdighetene, og det viser eksepsjonell dedikasjon og viljestyrke. Dette er bevis på at du kan fullføre det du begynner på. Du har bygget en solid grunnmur av ferdigheter som vil støtte deg gjennom hele bedringsprosessen.',
    'level_5': 'Erfaren! Du har nådd nivå 5, og det viser at du har kommet langt på din reise. Du har bygget opp betydelig erfaring og visdom gjennom din innsats. Dette er et bevis på at hardt arbeid og dedikasjon lønner seg. Du er på vei til å bli den personen du vil være.',
    'level_10': 'Nivåmester! Nivå 10 er en eksepsjonell prestasjon som viser at du har fullført en betydelig del av din reise. Du har bevist at du har styrken, utholdenheten og viljestyrken til å nå dine mål. Dette er ikke slutten - det er begynnelsen på en ny fase hvor du kan hjelpe andre og fortsette å vokse.',
    'three_activities': 'Bra start! Du har nå fullført 3 aktiviteter, og det viser at du er i gang med å bygge nye rutiner. Hver aktivitet er et valg om forandring, og du viser at du kan gjøre det vanskelige valget.',
    'fifteen_activities': 'Aktiv! 15 aktiviteter viser at du har etablert en solid rutine. Du har bevist at du kan holde ut og fortsette selv når det er vanskelig. Dette er ekte transformasjon.',
    'twenty_activities': 'Engasjert! Du har nå fullført 20 aktiviteter, og det viser eksepsjonell dedikasjon. Du har bygget en identitet som er basert på aktivitet og vekst, ikke avhengighet.',
    'twenty_five_activities': 'Dedikert aktivist! 25 aktiviteter er en imponerende milepæl. Du har bevist at du kan fullføre det du begynner på, og du bygger en historie av suksess som erstatter fortiden.',
    'fifty_activities': 'Veteran! 50 aktiviteter viser at du har blitt til en person som velger aktivitet over avhengighet. Dette er ikke lenger et valg - det er hvem du er. Du er en inspirasjon!',
    'hundred_activities': 'Legende! 100 aktiviteter er en eksepsjonell prestasjon. Du har fullstendig transformert livet ditt og bevist at ingen forandring er umulig. Du er en levende bevis på at bedring er mulig.',
    'three_reflections': 'Reflekterer! Du har nå skrevet 3 refleksjoner, og det viser at du tar tiden til å forstå din egen reise. Selvinnsikt er grunnlaget for varig forandring.',
    'ten_reflections': 'Dyp tenker! 10 refleksjoner viser at du har etablert en praksis av selvrefleksjon. Ved å reflektere, bygger du en sterkere forståelse av hvem du er og hvem du vil bli.',
    'twenty_reflections': 'Filosof! Du har nå skrevet 20 refleksjoner, og det viser dyp selvinnsikt. Du forstår nå mønstrene i livet ditt og hvordan du kan endre dem.',
    'fifty_reflections': 'Visdom! 50 refleksjoner viser at du har bygget opp en enorm mengde selvinnsikt. Du har lært å se deg selv klart, og det er der sanningen og friheten ligger.',
    'hundred_reflections': 'Sage! 100 refleksjoner er en eksepsjonell prestasjon. Du har bygget opp en dyp forståelse av deg selv og din reise. Dette er visdom som vil støtte deg resten av livet.',
    'three_moments': 'Mestringsmønster! Du har nå registrert 3 mestringsmomenter, og det viser at du begynner å se mønstrene i din egen styrke. Å feire disse øyeblikkene er viktig.',
    'five_moments': 'Mestringsmiljø! 5 mestringsmomenter viser at du har skapt et miljø hvor du anerkjenner din egen styrke. Dette er en viktig del av å bygge selvtillit.',
    'ten_moments': 'Mestringsmaster! Du har nå registrert 10 mestringsmomenter, og det viser at du har lært å feire dine prestasjoner. Dette er en viktig del av bedringsprosessen.',
    'twenty_moments': 'Mestringsekspert! 20 mestringsmomenter viser at du har etablert en praksis av å anerkjenne din egen styrke. Du ser nå mønstrene i din egen mestring.',
    'fifty_moments': 'Mestringsmester! 50 mestringsmomenter er en eksepsjonell prestasjon. Du har bygget opp en solid historie av mestring som viser deg selv at du kan overvinne utfordringer.',
    'streak_two_weeks': 'To uker på rad! Dette viser at du har etablert en solid rutine. Du bygger nye mønstre som erstatter de gamle, og det er der transformasjonen skjer.',
    'streak_three_weeks': 'Tre uker på rad! Du har nå bevist at du kan holde ut gjennom utfordringer. Dette er ikke lenger et valg - det er hvem du er.',
    'streak_two_months': 'To måneder på rad! 8 uker viser eksepsjonell utholdenhet. Du har bevist at du kan holde ut gjennom langvarige utfordringer, og det er der ekte styrke ligger.',
    'streak_three_months': 'Tre måneder på rad! 12 uker er en enorm prestasjon som viser at du har fullstendig transformert rutinene dine. Du er ikke lenger den personen du var.',
    'streak_four_months': 'Fire måneder på rad! 16 uker viser at du har blitt til en person som konsekvent velger det som er best for deg. Dette er ekte transformasjon.',
    'streak_six_months': 'Halvt år på rad! 24 uker er en eksepsjonell prestasjon. Du har bevist at du kan holde ut gjennom alle sesonger og utfordringer. Du er en inspirasjon!',
    'streak_year': 'Hele året på rad! 52 uker er en legendarisk prestasjon. Du har fullstendig transformert livet ditt og bevist at ingen forandring er umulig. Du er en levende bevis på at bedring er mulig.',
    'three_expeditions': 'Utforsker! Du har nå gått på 3 ekspedisjoner, og det viser at du er villig til å utforske nye steder både utenfor og inni deg. Dette er modig.',
    'five_expeditions': 'Oppdager! 5 ekspedisjoner viser at du har etablert en praksis av å utforske det ukjente. Hver ekspedisjon er en metafor for din reise mot bedring.',
    'ten_expeditions': 'Eventyrer! Du har nå gått på 10 ekspedisjoner, og det viser at du er en person som søker nye opplevelser og utfordringer. Dette er en viktig del av vekst.',
    'twenty_expeditions': 'Pioner! 20 ekspedisjoner er en eksepsjonell prestasjon. Du har utforsket nye steder og nye deler av deg selv. Du er en pioner på din egen reise.',
    'first_environment': 'Miljøbevisst! Du har nå utført din første miljøaksjon, og det viser at du bryr deg om noe større enn deg selv. Dette er en viktig del av å finne mening og formål.',
    'ten_environment': 'Miljøforkjemper! Du har nå utført 10 miljøaksjoner, og det viser at du har etablert en praksis av å ta vare på miljøet. Dette bygger en identitet basert på omsorg.',
    'twenty_environment': 'Miljøaktivist! 20 miljøaksjoner viser at du har blitt til en person som konsekvent tar vare på miljøet. Dette er en viktig del av å bygge en identitet basert på ansvar.',
    'fifty_environment': 'Miljøhelt! 50 miljøaksjoner er en eksepsjonell prestasjon. Du har bevist at du bryr deg om miljøet og tar ansvar for å ta vare på det. Du er en helt!',
    'three_skills': 'Lærer! Du har nå lært 3 ferdigheter, og det viser at du er villig til å vokse og utvikle deg. I bedringsprosessen handler det om å bygge en ny identitet, og ferdigheter er byggesteinene.',
    'seven_skills': 'Erfaren! Du har nå lært 7 ferdigheter, og det viser at du har evnen til å lære og vokse. Dette er bevis på at du kan mestre nye utfordringer.',
    'fifteen_skills': 'Ekspert! Du har nå lært 15 ferdigheter, og det viser eksepsjonell dedikasjon. Du har bygget en solid grunnmur av ferdigheter som vil støtte deg gjennom hele bedringsprosessen.',
    'twenty_skills': 'Ferdighetsekspert! Du har nå lært 20 ferdigheter, og det viser at du er en person som konsekvent lærer og vokser. Dette er en viktig del av å bygge en ny identitet.',
    'twenty_five_skills': 'Grandmaster! 25 ferdigheter er en eksepsjonell prestasjon. Du har bygget opp en enorm mengde ferdigheter som viser at du kan mestre hva som helst du setter deg for.',
    'level_3': 'Nybegynner! Du har nådd nivå 3, og det viser at du har kommet i gang på din reise. Du har tatt de første stegene mot forandring, og det er noe å feire.',
    'level_7': 'Avansert! Du har nådd nivå 7, og det viser at du har kommet langt på din reise. Du har bygget opp betydelig erfaring og visdom gjennom din innsats.',
    'level_15': 'Ekspert! Du har nådd nivå 15, og det viser at du har fullført en betydelig del av din reise. Du har bevist at du har styrken og utholdenheten til å nå dine mål.',
    'level_20': 'Nivålegende! Nivå 20 er en eksepsjonell prestasjon som viser at du har fullført en stor del av din reise. Du har bevist at du kan nå hva som helst du setter deg for.',
    'level_25': 'Legende! Nivå 25 er en legendarisk prestasjon. Du har fullstendig transformert livet ditt og bevist at ingen forandring er umulig. Du er en inspirasjon for alle.',
    'level_30': 'Univers! Nivå 30 er den ultimate prestasjonen. Du har nådd toppen av din reise og bevist at du kan overvinne hva som helst. Du er en levende bevis på at bedring er mulig, og du kan nå hjelpe andre på deres reise.',
    'ten_combined': 'Mangefasettert! Du har nå fullført 10 aktiviteter eller ferdigheter, og det viser at du er en person som utforsker mange ulike områder. Dette er en viktig del av vekst.',
    'twenty_combined': 'Allsidig! Du har nå fullført 20 aktiviteter eller ferdigheter, og det viser at du er en person som konsekvent lærer og vokser. Dette bygger en sterk identitet.',
    'fifty_combined': 'Komplett! Du har nå fullført 50 aktiviteter eller ferdigheter, og det viser eksepsjonell dedikasjon. Du har bygget en solid grunnmur av erfaringer som vil støtte deg resten av livet.',
    'hundred_combined': 'Uomtvistelig! Du har nå fullført 100 aktiviteter eller ferdigheter, og det er en eksepsjonell prestasjon. Du har bevist at du kan fullføre hva som helst du setter deg for.',
    'two_hundred_combined': 'Uovertruffen! Du har nå fullført 200 aktiviteter eller ferdigheter, og det er en legendarisk prestasjon. Du har fullstendig transformert livet ditt og bevist at ingen forandring er umulig. Du er en levende bevis på at bedring er mulig.',
  };
  return motivations[achievementId] || 'Du har oppnådd noe fantastisk! Fortsett å bygge på denne styrken og hold ut på din reise mot bedring.';
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
  });
};

