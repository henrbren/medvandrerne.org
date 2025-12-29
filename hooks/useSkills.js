import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SKILLS_STORAGE_KEY = '@medvandrerne_skills';

// Define all available skills
export const SKILLS = [
  {
    id: 'bonfire',
    name: 'Bålfyring',
    category: 'survival',
    icon: 'flame',
    xpReward: 50,
    description: 'Kunne tenne og vedlikeholde et bål',
  },
  {
    id: 'compass',
    name: 'Kompass',
    category: 'navigation',
    icon: 'map',
    xpReward: 50,
    description: 'Kunne bruke kompass for navigasjon',
  },
  {
    id: 'first_aid',
    name: 'HLR',
    category: 'safety',
    icon: 'medical',
    xpReward: 75,
    description: 'Kunne utføre førstehjelp og HLR',
  },
  {
    id: 'tent',
    name: 'Telt',
    category: 'survival',
    icon: 'home',
    xpReward: 40,
    description: 'Kunne sette opp og ta ned telt',
  },
  {
    id: 'leadership',
    name: 'Lederskap',
    category: 'social',
    icon: 'people',
    xpReward: 60,
    description: 'Vist lederegenskaper i gruppesituasjoner',
  },
  {
    id: 'swimming',
    name: 'Svømming',
    category: 'physical',
    icon: 'fitness',
    xpReward: 50,
    description: 'Kunne svømme trygt i naturen',
  },
  {
    id: 'diving',
    name: 'Dykking',
    category: 'physical',
    icon: 'fitness',
    xpReward: 80,
    description: 'Kunne dykke trygt',
  },
  {
    id: 'ice_bathing',
    name: 'Isbading',
    category: 'physical',
    icon: 'snow',
    xpReward: 100,
    description: 'Fullført isbading',
  },
  {
    id: 'long_hike',
    name: 'Langtur',
    category: 'endurance',
    icon: 'walk',
    xpReward: 70,
    description: 'Fullført lang tur (10+ km)',
  },
  {
    id: 'campfire_talk',
    name: 'Bålprat',
    category: 'social',
    icon: 'people',
    xpReward: 30,
    description: 'Deltatt i bålprat',
  },
  {
    id: 'motivation_hike',
    name: 'Motivasjonstur',
    category: 'endurance',
    icon: 'walk',
    xpReward: 60,
    description: 'Gått motivasjonstur',
  },
  {
    id: 'five_motivation_hikes',
    name: '5 motivasjonsturer',
    category: 'endurance',
    icon: 'flag',
    xpReward: 200,
    description: 'Gått 5 motivasjonsturer',
  },
  {
    id: 'femundlop',
    name: 'Femundløp',
    category: 'endurance',
    icon: 'trophy',
    xpReward: 150,
    description: 'Deltatt på femundløp',
  },
  {
    id: 'femundlop_three_times',
    name: 'Femundløp 3 ganger',
    category: 'endurance',
    icon: 'star',
    xpReward: 400,
    description: 'Deltatt på femundløp 3 ganger',
  },
  {
    id: 'slept_minus_degrees',
    name: 'Sovet ute i minusgrader',
    category: 'survival',
    icon: 'snow',
    xpReward: 120,
    description: 'Sovet ute når temperaturen var under null',
  },
  {
    id: 'slept_summer',
    name: 'Sovet ute på sommeren',
    category: 'survival',
    icon: 'sunny',
    xpReward: 40,
    description: 'Sovet ute i sommeren',
  },
  {
    id: 'slept_with_dog',
    name: 'Sovet ute med en hund',
    category: 'social',
    icon: 'paw',
    xpReward: 60,
    description: 'Sovet ute sammen med en hund',
  },
  {
    id: 'slept_open_sky',
    name: 'Sovet ute under åpen himmel',
    category: 'survival',
    icon: 'moon',
    xpReward: 80,
    description: 'Sovet ute uten telt eller tak over hodet',
  },
  {
    id: 'slept_hammock',
    name: 'Sovet i hengekøye',
    category: 'survival',
    icon: 'bed',
    xpReward: 50,
    description: 'Sovet i en hengekøye',
  },
  {
    id: 'mountain_summit',
    name: 'Besteget en fjelltopp',
    category: 'endurance',
    icon: 'flag',
    xpReward: 150,
    description: 'Besteget en fjelltopp',
  },
  {
    id: 'neighborhood_walk',
    name: 'Gått en tur rundt kvartalet',
    category: 'endurance',
    icon: 'walk',
    xpReward: 20,
    description: 'Gått en tur rundt kvartalet',
  },
  {
    id: 'helped_someone',
    name: 'Hjulpet noen i dag',
    category: 'social',
    icon: 'heart',
    xpReward: 30,
    description: 'Hjulpet noen i dag',
  },
  // Survival - Overlevelse (4 nye for å få 10 totalt)
  {
    id: 'water_purification',
    name: 'Vannrensing',
    category: 'survival',
    icon: 'water',
    xpReward: 60,
    description: 'Kunne rense vann i naturen',
  },
  {
    id: 'knot_tying',
    name: 'Knutebinding',
    category: 'survival',
    icon: 'link',
    xpReward: 40,
    description: 'Kunne binde ulike knuter',
  },
  {
    id: 'shelter_building',
    name: 'Bygge skjul',
    category: 'survival',
    icon: 'home',
    xpReward: 80,
    description: 'Bygget et skjul i naturen',
  },
  {
    id: 'fire_cooking',
    name: 'Matlaging på bål',
    category: 'survival',
    icon: 'restaurant',
    xpReward: 50,
    description: 'Laget mat over bål',
  },
  // Navigation - Navigasjon (9 nye for å få 10 totalt)
  {
    id: 'map_reading',
    name: 'Kartlesing',
    category: 'navigation',
    icon: 'map',
    xpReward: 50,
    description: 'Kunne lese og bruke kart',
  },
  {
    id: 'gps_navigation',
    name: 'GPS-navigasjon',
    category: 'navigation',
    icon: 'location',
    xpReward: 40,
    description: 'Kunne bruke GPS for navigasjon',
  },
  {
    id: 'star_navigation',
    name: 'Stjernenavigasjon',
    category: 'navigation',
    icon: 'star',
    xpReward: 70,
    description: 'Kunne navigere ved hjelp av stjerner',
  },
  {
    id: 'terrain_reading',
    name: 'Terrenglesing',
    category: 'navigation',
    icon: 'eye',
    xpReward: 60,
    description: 'Kunne lese terrenget for navigasjon',
  },
  {
    id: 'route_planning',
    name: 'Ruteplanlegging',
    category: 'navigation',
    icon: 'map',
    xpReward: 50,
    description: 'Planlagt en tur med kart',
  },
  {
    id: 'orienteering',
    name: 'Orientering',
    category: 'navigation',
    icon: 'compass',
    xpReward: 60,
    description: 'Deltatt i orienteringsløp',
  },
  {
    id: 'trail_marking',
    name: 'Sti-merking',
    category: 'navigation',
    icon: 'flag',
    xpReward: 40,
    description: 'Markert sti for andre',
  },
  {
    id: 'night_navigation',
    name: 'Nattnavigasjon',
    category: 'navigation',
    icon: 'moon',
    xpReward: 80,
    description: 'Navigert i mørket',
  },
  {
    id: 'weather_reading',
    name: 'Værlesing',
    category: 'navigation',
    icon: 'cloud',
    xpReward: 50,
    description: 'Kunne lese været for navigasjon',
  },
  // Safety - Sikkerhet (9 nye for å få 10 totalt)
  {
    id: 'safety_briefing',
    name: 'Sikkerhetsbriefing',
    category: 'safety',
    icon: 'shield',
    xpReward: 40,
    description: 'Gitt sikkerhetsbriefing til gruppe',
  },
  {
    id: 'emergency_signal',
    name: 'Nød-signalering',
    category: 'safety',
    icon: 'warning',
    xpReward: 60,
    description: 'Kunne sende nød-signaler',
  },
  {
    id: 'hypothermia_prevention',
    name: 'Forebygge hypotermi',
    category: 'safety',
    icon: 'snow',
    xpReward: 70,
    description: 'Kunne forebygge og håndtere hypotermi',
  },
  {
    id: 'wildlife_safety',
    name: 'Vilt-sikkerhet',
    category: 'safety',
    icon: 'paw',
    xpReward: 60,
    description: 'Kunne håndtere møte med vilt trygt',
  },
  {
    id: 'equipment_check',
    name: 'Utstyrskontroll',
    category: 'safety',
    icon: 'checkmark-circle',
    xpReward: 40,
    description: 'Gjennomført grundig utstyrskontroll',
  },
  {
    id: 'rescue_procedures',
    name: 'Redningsprosedyrer',
    category: 'safety',
    icon: 'people',
    xpReward: 80,
    description: 'Kjent med redningsprosedyrer',
  },
  {
    id: 'risk_assessment',
    name: 'Risikovurdering',
    category: 'safety',
    icon: 'alert',
    xpReward: 50,
    description: 'Gjort risikovurdering før aktivitet',
  },
  {
    id: 'safety_equipment',
    name: 'Sikkerhetsutstyr',
    category: 'safety',
    icon: 'shield',
    xpReward: 45,
    description: 'Brukt riktig sikkerhetsutstyr',
  },
  {
    id: 'emergency_plan',
    name: 'Nødplan',
    category: 'safety',
    icon: 'document',
    xpReward: 55,
    description: 'Laget nødplan for tur',
  },
  // Social - Sosialt (6 nye for å få 10 totalt)
  {
    id: 'group_coordination',
    name: 'Gruppekoordinering',
    category: 'social',
    icon: 'people',
    xpReward: 50,
    description: 'Koordinert gruppeaktivitet',
  },
  {
    id: 'conflict_resolution',
    name: 'Konflikthåndtering',
    category: 'social',
    icon: 'heart',
    xpReward: 60,
    description: 'Håndtert konflikt i gruppe',
  },
  {
    id: 'mentoring',
    name: 'Mentoring',
    category: 'social',
    icon: 'school',
    xpReward: 70,
    description: 'Veiledet noen i en ferdighet',
  },
  {
    id: 'team_building',
    name: 'Teambygging',
    category: 'social',
    icon: 'people',
    xpReward: 60,
    description: 'Deltatt i teambyggingsaktivitet',
  },
  {
    id: 'active_listening',
    name: 'Aktiv lyttering',
    category: 'social',
    icon: 'ear',
    xpReward: 40,
    description: 'Vist aktiv lytting i gruppe',
  },
  {
    id: 'sharing_experience',
    name: 'Delt erfaring',
    category: 'social',
    icon: 'chatbubbles',
    xpReward: 35,
    description: 'Delt personlig erfaring med gruppe',
  },
  // Physical - Fysisk (7 nye for å få 10 totalt)
  {
    id: 'climbing',
    name: 'Klatre',
    category: 'physical',
    icon: 'fitness',
    xpReward: 80,
    description: 'Klattret i naturen',
  },
  {
    id: 'kayaking',
    name: 'Kajakk',
    category: 'physical',
    icon: 'boat',
    xpReward: 70,
    description: 'Padlet kajakk',
  },
  {
    id: 'cycling',
    name: 'Sykkel',
    category: 'physical',
    icon: 'bicycle',
    xpReward: 50,
    description: 'Sykklet i naturen',
  },
  {
    id: 'skiing',
    name: 'Ski',
    category: 'physical',
    icon: 'snow',
    xpReward: 60,
    description: 'Gått på ski',
  },
  {
    id: 'running',
    name: 'Løping',
    category: 'physical',
    icon: 'fitness',
    xpReward: 45,
    description: 'Løpt i naturen',
  },
  {
    id: 'yoga_outdoor',
    name: 'Yoga utendørs',
    category: 'physical',
    icon: 'body',
    xpReward: 40,
    description: 'Gjort yoga utendørs',
  },
  {
    id: 'strength_training',
    name: 'Styrketrening',
    category: 'physical',
    icon: 'fitness',
    xpReward: 50,
    description: 'Gjort styrketrening utendørs',
  },
  // Endurance - Utholdenhet (3 nye for å få 10 totalt)
  {
    id: 'multi_day_hike',
    name: 'Flere dagers tur',
    category: 'endurance',
    icon: 'walk',
    xpReward: 200,
    description: 'Fullført tur over flere dager',
  },
  {
    id: 'marathon_hike',
    name: 'Maraton-tur',
    category: 'endurance',
    icon: 'flag',
    xpReward: 250,
    description: 'Gått tur på 42+ km',
  },
  {
    id: 'winter_hike',
    name: 'Vintertur',
    category: 'endurance',
    icon: 'snow',
    xpReward: 120,
    description: 'Fullført vintertur',
  },
  // ============================================
  // EKSTRA FERDIGHETER - Utvidet ferdighetsliste
  // ============================================
  
  // SURVIVAL - Ekstra overlevelse
  {
    id: 'foraging',
    name: 'Sanking',
    category: 'survival',
    icon: 'leaf',
    xpReward: 60,
    description: 'Sanket spiselige planter i naturen',
  },
  {
    id: 'fishing',
    name: 'Fiske',
    category: 'survival',
    icon: 'fish',
    xpReward: 50,
    description: 'Fisket og tilberedt fangsten',
  },
  {
    id: 'snow_cave',
    name: 'Snøhule',
    category: 'survival',
    icon: 'snow',
    xpReward: 100,
    description: 'Bygget og sovet i snøhule',
  },
  {
    id: 'trangia_cooking',
    name: 'Trangia-matlaging',
    category: 'survival',
    icon: 'flame',
    xpReward: 35,
    description: 'Laget mat med trangia/primus',
  },
  {
    id: 'axe_skills',
    name: 'Øksbruk',
    category: 'survival',
    icon: 'hammer',
    xpReward: 55,
    description: 'Trygg bruk av øks',
  },
  {
    id: 'knife_skills',
    name: 'Knivbruk',
    category: 'survival',
    icon: 'cut',
    xpReward: 45,
    description: 'Trygg bruk av kniv i naturen',
  },
  {
    id: 'fire_without_matches',
    name: 'Ild uten fyrstikker',
    category: 'survival',
    icon: 'flame',
    xpReward: 90,
    description: 'Tent bål uten fyrstikker eller lighter',
  },
  {
    id: 'tarp_shelter',
    name: 'Tarp-leir',
    category: 'survival',
    icon: 'umbrella',
    xpReward: 55,
    description: 'Satt opp leir med tarp/presenning',
  },
  {
    id: 'dry_clothes',
    name: 'Tørke klær',
    category: 'survival',
    icon: 'shirt',
    xpReward: 30,
    description: 'Tørket klær effektivt i felt',
  },
  {
    id: 'emergency_bivouac',
    name: 'Nødbivuakk',
    category: 'survival',
    icon: 'alert',
    xpReward: 80,
    description: 'Gjennomført nødbivuakk',
  },
  
  // NAVIGATION - Ekstra navigasjon
  {
    id: 'sun_navigation',
    name: 'Sol-navigasjon',
    category: 'navigation',
    icon: 'sunny',
    xpReward: 50,
    description: 'Navigert ved hjelp av solen',
  },
  {
    id: 'moss_navigation',
    name: 'Mose-retning',
    category: 'navigation',
    icon: 'leaf',
    xpReward: 40,
    description: 'Brukt mose til å finne retning',
  },
  {
    id: 'contour_lines',
    name: 'Høydekurver',
    category: 'navigation',
    icon: 'analytics',
    xpReward: 60,
    description: 'Mestret lesing av høydekurver',
  },
  {
    id: 'pace_counting',
    name: 'Skrittelling',
    category: 'navigation',
    icon: 'footsteps',
    xpReward: 45,
    description: 'Brukt skrittelling for avstand',
  },
  {
    id: 'landmark_navigation',
    name: 'Landemerke-navigasjon',
    category: 'navigation',
    icon: 'pin',
    xpReward: 40,
    description: 'Navigert ved hjelp av landemerker',
  },
  {
    id: 'water_crossing',
    name: 'Elve-kryssing',
    category: 'navigation',
    icon: 'water',
    xpReward: 70,
    description: 'Funnet trygt sted å krysse elv',
  },
  {
    id: 'fog_navigation',
    name: 'Tåke-navigasjon',
    category: 'navigation',
    icon: 'cloud',
    xpReward: 75,
    description: 'Navigert trygt i tåke',
  },
  {
    id: 'geocaching',
    name: 'Geocaching',
    category: 'navigation',
    icon: 'locate',
    xpReward: 35,
    description: 'Funnet en geocache',
  },
  
  // SAFETY - Ekstra sikkerhet
  {
    id: 'avalanche_awareness',
    name: 'Snøskredbevissthet',
    category: 'safety',
    icon: 'warning',
    xpReward: 80,
    description: 'Kunnskap om snøskredfare',
  },
  {
    id: 'lightning_safety',
    name: 'Lynsikkerhet',
    category: 'safety',
    icon: 'thunderstorm',
    xpReward: 50,
    description: 'Vet hvordan handle ved tordenvær',
  },
  {
    id: 'water_safety',
    name: 'Vannsikkerhet',
    category: 'safety',
    icon: 'water',
    xpReward: 55,
    description: 'Kunnskap om trygg ferdsel ved vann',
  },
  {
    id: 'ice_safety',
    name: 'Is-sikkerhet',
    category: 'safety',
    icon: 'snow',
    xpReward: 65,
    description: 'Vet hvordan ferdes trygt på is',
  },
  {
    id: 'tick_prevention',
    name: 'Flått-forebygging',
    category: 'safety',
    icon: 'bug',
    xpReward: 35,
    description: 'Kunnskap om flåttforebygging',
  },
  {
    id: 'blister_care',
    name: 'Gnagsår-behandling',
    category: 'safety',
    icon: 'bandage',
    xpReward: 30,
    description: 'Behandlet gnagsår i felt',
  },
  {
    id: 'dehydration_prevention',
    name: 'Væskebalanse',
    category: 'safety',
    icon: 'water',
    xpReward: 40,
    description: 'Opprettholdt god væskebalanse på tur',
  },
  {
    id: 'sun_protection',
    name: 'Solbeskyttelse',
    category: 'safety',
    icon: 'sunny',
    xpReward: 25,
    description: 'Beskyttet seg mot sol på tur',
  },
  {
    id: 'bear_awareness',
    name: 'Bjørnekunnskap',
    category: 'safety',
    icon: 'paw',
    xpReward: 60,
    description: 'Kunnskap om ferdsel i bjørneområder',
  },
  {
    id: 'emergency_call',
    name: 'Nødanrop',
    category: 'safety',
    icon: 'call',
    xpReward: 45,
    description: 'Vet hvordan kontakte nødetater',
  },
  
  // SOCIAL - Ekstra sosialt
  {
    id: 'group_songs',
    name: 'Gruppesang',
    category: 'social',
    icon: 'musical-notes',
    xpReward: 30,
    description: 'Deltatt i sang rundt bålet',
  },
  {
    id: 'storytelling',
    name: 'Fortelling',
    category: 'social',
    icon: 'book',
    xpReward: 40,
    description: 'Fortalt historie ved bålet',
  },
  {
    id: 'teaching',
    name: 'Undervisning',
    category: 'social',
    icon: 'school',
    xpReward: 65,
    description: 'Lært bort en ferdighet til andre',
  },
  {
    id: 'new_friend',
    name: 'Ny venn',
    category: 'social',
    icon: 'person-add',
    xpReward: 45,
    description: 'Blitt kjent med noen nye på tur',
  },
  {
    id: 'motivational_talk',
    name: 'Motivasjonsprat',
    category: 'social',
    icon: 'megaphone',
    xpReward: 50,
    description: 'Gitt noen motiverende ord',
  },
  {
    id: 'group_cooking',
    name: 'Fellesmiddag',
    category: 'social',
    icon: 'restaurant',
    xpReward: 35,
    description: 'Laget mat sammen med gruppen',
  },
  {
    id: 'cleanup_crew',
    name: 'Ryddegjengen',
    category: 'social',
    icon: 'trash',
    xpReward: 40,
    description: 'Ryddet søppel i naturen med andre',
  },
  {
    id: 'gratitude_sharing',
    name: 'Takknemlighet',
    category: 'social',
    icon: 'heart',
    xpReward: 30,
    description: 'Delt takknemlighet med gruppen',
  },
  {
    id: 'icebreaker',
    name: 'Isbryter',
    category: 'social',
    icon: 'sparkles',
    xpReward: 35,
    description: 'Ledet en bli-kjent-aktivitet',
  },
  {
    id: 'peer_support',
    name: 'Likemannsstøtte',
    category: 'social',
    icon: 'hand-left',
    xpReward: 60,
    description: 'Gitt støtte til en medvandrer',
  },
  
  // PHYSICAL - Ekstra fysisk
  {
    id: 'snowshoeing',
    name: 'Truger',
    category: 'physical',
    icon: 'footsteps',
    xpReward: 55,
    description: 'Gått på truger',
  },
  {
    id: 'rock_hopping',
    name: 'Steinhopping',
    category: 'physical',
    icon: 'footsteps',
    xpReward: 40,
    description: 'Hoppet over steiner i elv/terreng',
  },
  {
    id: 'scrambling',
    name: 'Klyving',
    category: 'physical',
    icon: 'trending-up',
    xpReward: 65,
    description: 'Klyvd bratt terreng',
  },
  {
    id: 'packrafting',
    name: 'Packraft',
    category: 'physical',
    icon: 'boat',
    xpReward: 85,
    description: 'Padlet packraft',
  },
  {
    id: 'canoeing',
    name: 'Kano',
    category: 'physical',
    icon: 'boat',
    xpReward: 60,
    description: 'Padlet kano',
  },
  {
    id: 'sup_paddle',
    name: 'SUP',
    category: 'physical',
    icon: 'water',
    xpReward: 50,
    description: 'Padlet SUP (Stand Up Paddle)',
  },
  {
    id: 'cross_country_skiing',
    name: 'Langrenn',
    category: 'physical',
    icon: 'snow',
    xpReward: 55,
    description: 'Gått langrenn',
  },
  {
    id: 'dog_sledding',
    name: 'Hundekjøring',
    category: 'physical',
    icon: 'paw',
    xpReward: 100,
    description: 'Kjørt hundespann',
  },
  {
    id: 'pulk_pulling',
    name: 'Pulk-trekking',
    category: 'physical',
    icon: 'snow',
    xpReward: 70,
    description: 'Trukket pulk på tur',
  },
  {
    id: 'heavy_backpack',
    name: 'Tung sekk',
    category: 'physical',
    icon: 'bag',
    xpReward: 60,
    description: 'Båret sekk over 15 kg på tur',
  },
  
  // ENDURANCE - Ekstra utholdenhet
  {
    id: 'sunrise_hike',
    name: 'Soloppgangstur',
    category: 'endurance',
    icon: 'sunny',
    xpReward: 60,
    description: 'Gått tur for å se soloppgang',
  },
  {
    id: 'night_hike',
    name: 'Nattevandring',
    category: 'endurance',
    icon: 'moon',
    xpReward: 70,
    description: 'Gått tur om natten',
  },
  {
    id: 'rain_hike',
    name: 'Regntur',
    category: 'endurance',
    icon: 'rainy',
    xpReward: 45,
    description: 'Gått tur i regn',
  },
  {
    id: 'storm_hike',
    name: 'Vindtur',
    category: 'endurance',
    icon: 'thunderstorm',
    xpReward: 80,
    description: 'Gått tur i sterk vind',
  },
  {
    id: 'consecutive_days',
    name: '7 dager på rad',
    category: 'endurance',
    icon: 'calendar',
    xpReward: 150,
    description: 'Gått tur 7 dager på rad',
  },
  {
    id: 'altitude_hike',
    name: 'Høydefjell',
    category: 'endurance',
    icon: 'trending-up',
    xpReward: 100,
    description: 'Gått tur over 1500 moh',
  },
  {
    id: 'glacier_hike',
    name: 'Bretur',
    category: 'endurance',
    icon: 'snow',
    xpReward: 150,
    description: 'Gått på bre',
  },
  {
    id: 'pilgrimage',
    name: 'Pilegrimstur',
    category: 'endurance',
    icon: 'walk',
    xpReward: 200,
    description: 'Gått pilegrimsrute',
  },
  {
    id: 'ultra_hike',
    name: 'Ultra-tur',
    category: 'endurance',
    icon: 'trophy',
    xpReward: 300,
    description: 'Gått over 50 km på én dag',
  },
  {
    id: 'twenty_hikes',
    name: '20 turer',
    category: 'endurance',
    icon: 'ribbon',
    xpReward: 250,
    description: 'Fullført 20 turer med Medvandrerne',
  },
  
  // NY KATEGORI: NATURE - Natur/Kunnskap
  {
    id: 'bird_watching',
    name: 'Fuglekikking',
    category: 'nature',
    icon: 'eye',
    xpReward: 40,
    description: 'Observert og identifisert fugler',
  },
  {
    id: 'plant_identification',
    name: 'Plantegjenkjenning',
    category: 'nature',
    icon: 'leaf',
    xpReward: 50,
    description: 'Identifisert ville planter',
  },
  {
    id: 'mushroom_picking',
    name: 'Sopplukking',
    category: 'nature',
    icon: 'nutrition',
    xpReward: 60,
    description: 'Plukket og identifisert sopp',
  },
  {
    id: 'berry_picking',
    name: 'Bærplukking',
    category: 'nature',
    icon: 'nutrition',
    xpReward: 35,
    description: 'Plukket bær i naturen',
  },
  {
    id: 'animal_tracks',
    name: 'Dyrespor',
    category: 'nature',
    icon: 'paw',
    xpReward: 45,
    description: 'Identifisert dyrespor',
  },
  {
    id: 'stargazing',
    name: 'Stjernekikking',
    category: 'nature',
    icon: 'star',
    xpReward: 40,
    description: 'Observert stjernehimmelen',
  },
  {
    id: 'northern_lights',
    name: 'Nordlys',
    category: 'nature',
    icon: 'color-palette',
    xpReward: 80,
    description: 'Sett nordlys',
  },
  {
    id: 'wildlife_photography',
    name: 'Naturfoto',
    category: 'nature',
    icon: 'camera',
    xpReward: 45,
    description: 'Tatt naturfoto på tur',
  },
  {
    id: 'leave_no_trace',
    name: 'Sporløs ferdsel',
    category: 'nature',
    icon: 'leaf',
    xpReward: 50,
    description: 'Praktisert sporløs ferdsel',
  },
  {
    id: 'nature_meditation',
    name: 'Naturmeditasjon',
    category: 'nature',
    icon: 'flower',
    xpReward: 40,
    description: 'Meditert i naturen',
  },
  
  // NY KATEGORI: MINDFULNESS - Mental helse
  {
    id: 'morning_routine',
    name: 'Morgenrutine',
    category: 'mindfulness',
    icon: 'sunny',
    xpReward: 30,
    description: 'Gjennomført morgenrutine på tur',
  },
  {
    id: 'digital_detox',
    name: 'Digital detox',
    category: 'mindfulness',
    icon: 'phone-portrait',
    xpReward: 50,
    description: 'Gått tur uten mobil',
  },
  {
    id: 'journaling',
    name: 'Dagbok',
    category: 'mindfulness',
    icon: 'book',
    xpReward: 35,
    description: 'Skrevet i dagbok på tur',
  },
  {
    id: 'breathing_exercise',
    name: 'Pusteøvelse',
    category: 'mindfulness',
    icon: 'body',
    xpReward: 30,
    description: 'Gjort pusteøvelse i naturen',
  },
  {
    id: 'solo_time',
    name: 'Alenetid',
    category: 'mindfulness',
    icon: 'person',
    xpReward: 45,
    description: 'Tatt tid for seg selv på tur',
  },
  {
    id: 'silence_hour',
    name: 'Stille time',
    category: 'mindfulness',
    icon: 'volume-mute',
    xpReward: 40,
    description: 'Gått i stillhet i en time',
  },
  {
    id: 'gratitude_practice',
    name: 'Takknemlighetspraksis',
    category: 'mindfulness',
    icon: 'heart',
    xpReward: 30,
    description: 'Praktisert takknemlighet på tur',
  },
  {
    id: 'cold_exposure',
    name: 'Kuldeeksponering',
    category: 'mindfulness',
    icon: 'snow',
    xpReward: 60,
    description: 'Bevisst kuldeeksponering',
  },
  {
    id: 'reflection_walk',
    name: 'Refleksjonsvandring',
    category: 'mindfulness',
    icon: 'walk',
    xpReward: 40,
    description: 'Gått refleksjonstur alene',
  },
  {
    id: 'presence_practice',
    name: 'Tilstedeværelse',
    category: 'mindfulness',
    icon: 'eye',
    xpReward: 35,
    description: 'Praktisert tilstedeværelse i naturen',
  },
];

export const useSkills = () => {
  const [completedSkills, setCompletedSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const stored = await AsyncStorage.getItem(SKILLS_STORAGE_KEY);
      if (stored) {
        setCompletedSkills(JSON.parse(stored));
      } else {
        setCompletedSkills([]);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      setCompletedSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSkills = async (skills) => {
    try {
      await AsyncStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skills));
      setCompletedSkills(skills);
    } catch (error) {
      console.error('Error saving skills:', error);
    }
  };

  const toggleSkill = async (skillId) => {
    const isCompleted = completedSkills.includes(skillId);
    let updatedSkills;

    if (isCompleted) {
      // Remove skill
      updatedSkills = completedSkills.filter(id => id !== skillId);
    } else {
      // Add skill
      updatedSkills = [...completedSkills, skillId];
    }

    await saveSkills(updatedSkills);
    return !isCompleted; // Return true if skill was added, false if removed
  };

  const isSkillCompleted = (skillId) => {
    return completedSkills.includes(skillId);
  };

  const getCompletedSkillsCount = () => {
    return completedSkills.length;
  };

  const getTotalXPEarned = () => {
    return completedSkills.reduce((total, skillId) => {
      const skill = SKILLS.find(s => s.id === skillId);
      return total + (skill?.xpReward || 0);
    }, 0);
  };

  const getSkillsByCategory = () => {
    const categories = {};
    SKILLS.forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push({
        ...skill,
        completed: isSkillCompleted(skill.id),
      });
    });
    return categories;
  };

  const getStats = () => {
    return {
      totalSkills: SKILLS.length,
      completedSkills: completedSkills.length,
      totalXPEarned: getTotalXPEarned(),
      byCategory: Object.keys(getSkillsByCategory()).reduce((acc, category) => {
        const skills = getSkillsByCategory()[category];
        acc[category] = {
          total: skills.length,
          completed: skills.filter(s => s.completed).length,
        };
        return acc;
      }, {}),
    };
  };

  return {
    skills: SKILLS,
    completedSkills,
    loading,
    toggleSkill,
    isSkillCompleted,
    getCompletedSkillsCount,
    getTotalXPEarned,
    getSkillsByCategory,
    getStats,
    loadSkills,
  };
};

