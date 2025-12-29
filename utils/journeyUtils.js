import { theme } from '../constants/theme';

export const getLevelName = (levelNum) => {
  const levelNames = {
    // Beginner (1-10): Hiking gear theme
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
    
    // Intermediate (11-20): Nature phenomena
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
    
    // Advanced (21-30): Elements of power
    21: 'Blitz',
    22: 'Regnbue',
    23: 'Tornado',
    24: 'Orkan',
    25: 'Tsunami',
    26: 'Vulkan',
    27: 'Jordskjelv',
    28: 'Nova',
    29: 'Supernova',
    30: 'Galakse',
    
    // Expert (31-40): Mythical creatures
    31: 'Valkyrie',
    32: 'Drage',
    33: 'Fenris',
    34: 'Jotun',
    35: 'Huginn',
    36: 'Muninn',
    37: 'Sleipnir',
    38: 'Bifrost',
    39: 'Yggdrasil',
    40: 'Midgard',
    
    // Master (41-50): Norse gods
    41: 'Thor',
    42: 'Odin',
    43: 'Freya',
    44: 'Baldur',
    45: 'Tyr',
    46: 'Heimdall',
    47: 'Njord',
    48: 'Frigg',
    49: 'Idunn',
    50: 'Æsir',
    
    // Grandmaster (51-60): Cosmic themes
    51: 'Komet',
    52: 'Meteor',
    53: 'Asteroid',
    54: 'Planet',
    55: 'Sol',
    56: 'Nebula',
    57: 'Pulsar',
    58: 'Kvasar',
    59: 'Svarthull',
    60: 'Univers',
    
    // Legend (61-70): Elements
    61: 'Ild',
    62: 'Vann',
    63: 'Jord',
    64: 'Luft',
    65: 'Lyn',
    66: 'Is',
    67: 'Lys',
    68: 'Skygge',
    69: 'Tid',
    70: 'Rom',
    
    // Mythic (71-80): Abstract concepts
    71: 'Visdom',
    72: 'Styrke',
    73: 'Mot',
    74: 'Håp',
    75: 'Tro',
    76: 'Kjærlighet',
    77: 'Fred',
    78: 'Harmoni',
    79: 'Balanse',
    80: 'Enhet',
    
    // Immortal (81-90): Transcendent
    81: 'Evighet',
    82: 'Uendelig',
    83: 'Opplyst',
    84: 'Åndelig',
    85: 'Guddommelig',
    86: 'Hellig',
    87: 'Ren',
    88: 'Perfekt',
    89: 'Absolutt',
    90: 'Transcendent',
    
    // Summit (91-100): The ultimate journey
    91: 'Oppstigeren',
    92: 'Veiviseren',
    93: 'Pioneren',
    94: 'Legenden',
    95: 'Ikonet',
    96: 'Mesteren',
    97: 'Grandmasteren',
    98: 'Mytisk',
    99: 'Udødelig',
    100: 'Toppen 🏔️',
  };
  return levelNames[levelNum] || `Nivå ${levelNum}`;
};

export const getLevelColors = (levelNum) => {
  // Beginner (1-10): Standard colors
  if (levelNum <= 2) {
    return { primary: '#E53935', secondary: '#EF5350', glow: '#FF5252', background: null };
  } else if (levelNum <= 4) {
    return { primary: theme.colors.primary, secondary: theme.colors.primaryLight, glow: theme.colors.primary, background: null };
  } else if (levelNum <= 6) {
    return { primary: theme.colors.success, secondary: '#4ADE80', glow: theme.colors.success, background: null };
  } else if (levelNum <= 8) {
    return { primary: theme.colors.info, secondary: '#22D3EE', glow: theme.colors.info, background: null };
  } else if (levelNum <= 10) {
    return { primary: theme.colors.warning, secondary: '#FBBF24', glow: theme.colors.warning, background: null };
  }
  
  // Intermediate (11-20): Deeper colors with backgrounds
  else if (levelNum <= 12) {
    return { primary: '#A855F7', secondary: '#C084FC', glow: '#E879F9', background: '#0A0510' };
  } else if (levelNum <= 15) {
    return { primary: '#EC4899', secondary: '#F472B6', glow: '#FB7185', background: '#0F0509' };
  } else if (levelNum <= 18) {
    return { primary: '#F59E0B', secondary: '#FBBF24', glow: '#FCD34D', background: '#0F0A05' };
  } else if (levelNum <= 20) {
    return { primary: '#EF4444', secondary: '#F87171', glow: '#FCA5A5', background: '#0F0505' };
  }
  
  // Advanced (21-30): Rich purples and blues
  else if (levelNum <= 24) {
    return { primary: '#8B5CF6', secondary: '#A78BFA', glow: '#C4B5FD', background: '#0D0510' };
  } else if (levelNum <= 27) {
    return { primary: '#06B6D4', secondary: '#22D3EE', glow: '#67E8F9', background: '#050F12' };
  } else if (levelNum <= 30) {
    return { primary: '#6366F1', secondary: '#818CF8', glow: '#A5B4FC', background: '#050510' };
  }
  
  // Expert (31-40): Mythical Norse theme - Deep greens and golds
  else if (levelNum <= 35) {
    return { primary: '#059669', secondary: '#10B981', glow: '#34D399', background: '#041F1A' };
  } else if (levelNum <= 40) {
    return { primary: '#D97706', secondary: '#F59E0B', glow: '#FBBF24', background: '#1A1505' };
  }
  
  // Master (41-50): Norse gods - Majestic blues and purples
  else if (levelNum <= 45) {
    return { primary: '#2563EB', secondary: '#3B82F6', glow: '#60A5FA', background: '#0A1628' };
  } else if (levelNum <= 50) {
    return { primary: '#7C3AED', secondary: '#8B5CF6', glow: '#A78BFA', background: '#0F0A1F' };
  }
  
  // Grandmaster (51-60): Cosmic - Deep space colors
  else if (levelNum <= 55) {
    return { primary: '#4F46E5', secondary: '#6366F1', glow: '#818CF8', background: '#0A0A1F' };
  } else if (levelNum <= 60) {
    return { primary: '#0F172A', secondary: '#1E293B', glow: '#475569', background: '#020617', special: 'cosmic' };
  }
  
  // Legend (61-70): Elemental - Vibrant elemental colors
  else if (levelNum <= 63) {
    return { primary: '#DC2626', secondary: '#EF4444', glow: '#F87171', background: '#1A0505' }; // Fire
  } else if (levelNum <= 66) {
    return { primary: '#0284C7', secondary: '#0EA5E9', glow: '#38BDF8', background: '#051525' }; // Water/Ice
  } else if (levelNum <= 70) {
    return { primary: '#FBBF24', secondary: '#FCD34D', glow: '#FDE68A', background: '#1A1505' }; // Lightning/Light
  }
  
  // Mythic (71-80): Abstract - Ethereal gradients
  else if (levelNum <= 75) {
    return { primary: '#BE185D', secondary: '#DB2777', glow: '#F472B6', background: '#1A0515' };
  } else if (levelNum <= 80) {
    return { primary: '#0D9488', secondary: '#14B8A6', glow: '#2DD4BF', background: '#051A1A' };
  }
  
  // Immortal (81-90): Transcendent - Mystical colors
  else if (levelNum <= 85) {
    return { primary: '#9333EA', secondary: '#A855F7', glow: '#C084FC', background: '#0F051A' };
  } else if (levelNum <= 90) {
    return { primary: '#6D28D9', secondary: '#7C3AED', glow: '#8B5CF6', background: '#0A0520' };
  }
  
  // Summit (91-100): Ultimate - Legendary gold and platinum
  else if (levelNum <= 95) {
    return { primary: '#B45309', secondary: '#D97706', glow: '#F59E0B', background: '#1A1005', special: 'legendary' };
  } else if (levelNum <= 99) {
    return { primary: '#78716C', secondary: '#A8A29E', glow: '#D6D3D1', background: '#1A1918', special: 'platinum' };
  } else {
    // Level 100 - The Summit! Rainbow/prismatic
    return { primary: '#FFD700', secondary: '#FFA500', glow: '#FFFFFF', background: '#0A0A0A', special: 'summit' };
  }
};

export const getLevelAnimationConfig = (levelNum) => {
  // Beginner (1-10): Simple to moderate animations
  if (levelNum <= 4) {
    return { pulse: false, glow: false, stars: false, particles: false, intensity: 1 };
  } else if (levelNum <= 7) {
    return { pulse: true, glow: false, stars: true, particles: false, intensity: 1.2 };
  } else if (levelNum <= 10) {
    return { pulse: true, glow: true, stars: true, particles: true, intensity: 1.5 };
  }
  
  // Intermediate (11-20): More impressive
  else if (levelNum <= 12) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 2 };
  } else if (levelNum <= 15) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 2.5, rainbow: true };
  } else if (levelNum <= 18) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 3, rainbow: true, rapid: true };
  } else if (levelNum <= 20) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 3.5, rainbow: true, rapid: true, flash: true };
  }
  
  // Advanced (21-30): Epic tier
  else if (levelNum <= 24) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 4, rainbow: true, rapid: true, flash: true, wave: true };
  } else if (levelNum <= 27) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 4.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true };
  } else if (levelNum <= 30) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true };
  }
  
  // Expert (31-40): Mythical tier
  else if (levelNum <= 35) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 5.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true };
  } else if (levelNum <= 40) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 6, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true };
  }
  
  // Master (41-50): Godlike tier
  else if (levelNum <= 45) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 6.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true };
  } else if (levelNum <= 50) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 7, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true };
  }
  
  // Grandmaster (51-60): Cosmic tier
  else if (levelNum <= 55) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 7.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true };
  } else if (levelNum <= 60) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 8, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true };
  }
  
  // Legend (61-70): Elemental tier
  else if (levelNum <= 65) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 8.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true };
  } else if (levelNum <= 70) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 9, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true };
  }
  
  // Mythic (71-80): Abstract tier
  else if (levelNum <= 75) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 9.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true, abstract: true };
  } else if (levelNum <= 80) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 10, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true, abstract: true };
  }
  
  // Immortal (81-90): Transcendent tier
  else if (levelNum <= 85) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 10.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true, abstract: true, transcendent: true };
  } else if (levelNum <= 90) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 11, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true, abstract: true, transcendent: true };
  }
  
  // Summit (91-100): Legendary/Ultimate tier
  else if (levelNum <= 95) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 11.5, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true, abstract: true, transcendent: true, legendary: true };
  } else if (levelNum <= 99) {
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 12, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true, abstract: true, transcendent: true, legendary: true, platinum: true };
  } else {
    // Level 100 - The Summit! Maximum effects
    return { pulse: true, glow: true, stars: true, particles: true, epic: true, intensity: 15, rainbow: true, rapid: true, flash: true, wave: true, cosmic: true, mythical: true, godlike: true, universe: true, elemental: true, abstract: true, transcendent: true, legendary: true, platinum: true, summit: true };
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
    'level_30': 'Mester! Nivå 30 viser at du har mestret grunnlaget for varig forandring. Du har bygget en solid identitet basert på vekst og utvikling.',
    'level_40': 'Ekspert! Nivå 40 viser eksepsjonell dedikasjon over lang tid. Du har bevist at du kan holde ut gjennom alle utfordringer som kommer din vei.',
    'level_50': 'Grandmaster! Halvveis til toppen! Nivå 50 er en legendarisk milepæl som viser at du har transformert livet ditt fullstendig. Du er en inspirasjon for alle rundt deg.',
    'level_60': 'Legende! Nivå 60 viser at du har oppnådd noe få klarer. Din utholdenhet og dedikasjon er eksepsjonell, og du bygger en arv som vil inspirere andre i generasjoner.',
    'level_70': 'Mytisk! Nivå 70 er en prestasjon som grenser til det mytiske. Du har vist at mennesker kan overvinne hva som helst med vilje og utholdenhet.',
    'level_80': 'Udødelig! Nivå 80 viser at du har oppnådd noe som vil leve videre. Din reise og dine prestasjoner vil inspirere andre lenge etter at du har nådd toppen.',
    'level_90': 'Transcendent! Nivå 90 viser at du har gått utover det vanlige. Du har ikke bare forandret deg selv - du har forandret måten andre ser på hva som er mulig.',
    'level_100': '🏔️ TOPPEN! Du har nådd nivå 100 - den ultimate prestasjonen! Du har bevist at med utholdenhet, vilje og mot kan man overvinne hva som helst. Du er ikke lenger en vandrer - du er en fyrtårn som viser andre veien. Din reise er en inspirasjon for alle som søker forandring. Du har nådd toppen, men reisen fortsetter - for nå kan du hjelpe andre å nå sine egne topper. Gratulerer med en legendarisk prestasjon!',
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

