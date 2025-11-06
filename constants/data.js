// Organization information
export const ORGANIZATION_INFO = {
  name: 'Stiftelsen Medvandrerne',
  orgNumber: '929 447 999',
  bankAccount: '1506 76 74992',
  website: 'https://www.medvandrerne.org',
  address: 'Krokoddveien 18, 3440 RØYKEN',
  municipality: 'ASKER',
  vipps: '792526',
  spleis: 'https://spleis.no/medvandrerne',
};

// Mission and values
export const MISSION = {
  title: 'Om Medvandrerne',
  description: 'Medvandrerne fokuserer på salutogenese og recovery, som betyr at de fokuserer på det som gjør den enkelte frisk og flytter fokus vekk fra selve «sykdomsbildet». De fokuserer på mulighetene og vekstpotensialet til deltakerne, og ikke på diagnoser og begrensninger.',
  nature: 'Naturen spiller en sentral rolle i Medvandrernes konsept. De arrangerer motivasjonsturer for rusavhengige og som utfordrer og gir muligheter for vekst. Turene gir deltakerne anledning til å komme seg vekk fra en vanskelig hverdag og finne innsikt og sunt fellesskap.',
  equality: 'På turene er alle likestilte, og det er ingen "ovenfra og ned"-relasjon mellom hjelpere og brukere. Deltakerne sitter rundt bålet kveld etter kveld og deler erfaringer, sorger og håp. Dette skaper en følelse av fellesskap og tilhørighet som kan være vanskelig å finne andre steder.',
  responsibility: 'Medvandrerne legger vekt på at deltakerne skal ta ansvar for seg selv og hverandre. Gjennom å mestre utfordringer i naturen, får deltakerne økt selvtillit og mestringsfølelse som de kan ta med seg tilbake til hverdagen.',
};

// Core activities
export const CORE_ACTIVITIES = [
  {
    id: 1,
    title: 'Motivasjonsturer',
    description: 'Utendørsturer som gir deltakerne mulighet til å komme seg vekk fra en vanskelig hverdag og finne innsikt og sunt fellesskap.',
    icon: 'map',
  },
  {
    id: 2,
    title: 'Femundløpet',
    description: 'For Medvandrerne er Femundløpet en unik arena for å finne mestringsarenaer og styrke sunne relasjoner. Gjennom fysisk aktivitet, problemløsning og samhandling får deltakerne erfaringer som styrker troen på egne evner.',
    icon: 'snow',
    detailedDescription: 'For Medvandrerne er Femundløpet en unik arena for å finne mestringsarenaer og styrke sunne relasjoner og utvikle oss i spann med våre samarbeidspartnere på rusfeltet. Med et langvarig samarbeid med Femundløpet har vi etablert oss som en viktig del av arrangementet, samtidig som det gir våre deltakere en mulighet til å skrive et nytt kapittel i sine egne liv.\n\nFor mange blir Femundløpet en "brobygger" tilbake til samfunnet. Gjennom fysisk aktivitet, problemløsning og samhandling får de erfaringer som styrker troen på egne evner. Noen oppdager til og med hundekjøring som en meningsfull fritidsaktivitet, noe som kan gi en ny retning i livet.\n\nMedvandrerne løfter frem det friske i mennesket og viser at alle har noe å bidra med, uansett fortid. Gjennom deltakelsen i Femundløpet får rusavhengige mulighet til å hjelpe andre – både hverandre og arrangementet som helhet. Dette skaper en følelse av tilhørighet til noe større enn seg selv. For noen blir det et vendepunkt, en sjanse til å tre ut av gamle roller og mønstre og gi seg selv nye muligheter.',
    website: 'https://www.medvandrerne.org/kjernevirksomhet/femundl%C3%B8pet',
    year: 2025,
    participants: 45,
    location: 'Tos arena, Os kommune / Røros',
    tasks: [
      'Tidtaking',
      'Hjelpe hunder til spann',
      'Parkeringsvakter',
      'Salg av mat og effekter',
      'Utplassering av halmballer',
      'Publikumsservice',
      'Hjelpe spann inn og ut av stolpe',
    ],
    partners: [
      'Femundløpet AS',
      'Solliakollektivet',
      'Tyrili',
    ],
    impact: 'Medvandrerne skal delta med rundt 45 personer på Femundløpet 2025, med base på Tos arena i Os kommune. Herfra skal de drifte flere sjekkpunkter og bidra i start- og målområdet i Røros.',
  },
  {
    id: 3,
    title: 'Lokallagsvirksomhet',
    description: 'Faste turer og aktiviteter arrangert av lokallagene, minst en dag i uken.',
    icon: 'people-outline',
  },
  {
    id: 4,
    title: 'Miljøansvar',
    description: 'Miljøaksjoner og prosjekter som Rein Sognefjord og rydding av Alnaelva.',
    icon: 'leaf',
  },
  {
    id: 5,
    title: 'Utendørsterapi',
    description: 'Faglig kompetanse innen utendørsterapi og recovery-filosofi.',
    icon: 'medical-outline',
  },
];

// Local groups
export const LOCAL_GROUPS = [
  {
    id: 1,
    name: 'Bergen',
    coordinator: 'Siri Otterskred',
    phone: '988 65 645',
    email: 'siri@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/709169972883175/',
    coordinatorImage: require('../assets/img/folk/siri.png'),
  },
  {
    id: 2,
    name: 'Hallingdal',
    coordinator: 'Hanne Lunde',
    phone: '936 80 952',
    email: 'hanne@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/597383110927203',
    coordinatorImage: require('../assets/img/folk/hanne.png'),
  },
  {
    id: 3,
    name: 'Marine/Ekspedisjon',
    coordinator: 'Patrick Larsen',
    phone: '407 42 322',
    email: 'patrick@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/189498986112969',
    coordinatorImage: require('../assets/img/folk/patrick.png'),
  },
  {
    id: 4,
    name: 'Modum',
    coordinator: 'Sven Sande',
    phone: '970 42 144',
    email: 'sven.sande@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/184188560572263',
    coordinatorImage: require('../assets/img/folk/sven.png'),
  },
  {
    id: 5,
    name: 'Telemark/Viken',
    coordinator: 'Ivar Brecke Nygaard',
    phone: '923 18 386',
    email: 'ivar@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/407645723586023',
    coordinatorImage: require('../assets/img/folk/ivar.jpg'),
  },
  {
    id: 6,
    name: 'Rogaland',
    coordinator: 'Torben Breivik',
    phone: '936 64 596',
    email: 'torben.breivik@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/3388077521212643',
    coordinatorImage: require('../assets/img/folk/torben.png'),
  },
  {
    id: 7,
    name: 'Trønderlag',
    coordinator: 'Didrik Sørli Didriksen',
    phone: '451 65 159',
    email: 'didrik@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/619804148685842',
    coordinatorImage: require('../assets/img/folk/didrik.png'),
  },
  {
    id: 8,
    name: 'Oslofjorden',
    coordinator: 'Ivar Brecke Nygaard',
    phone: '923 18 386',
    email: 'ivar@medvandrerne.org',
    facebook: 'https://www.facebook.com/groups/189498986112969',
    coordinatorImage: require('../assets/img/folk/ivar.jpg'),
  },
  {
    id: 9,
    name: 'Sogn',
    coordinator: '',
    phone: '',
    email: '',
    facebook: 'https://www.facebook.com/groups/433811482705184',
    coordinatorImage: null,
  },
];

// Administration contacts
export const ADMINISTRATION = [
  {
    id: 1,
    role: 'Daglig leder',
    name: 'Roger Wangberg',
    phone: '936 60 011',
    email: 'roger@medvandrerne.org',
    image: require('../assets/img/folk/roger.png'),
  },
  {
    id: 2,
    role: 'Lokallagskoordinator',
    name: 'Elin Larsen',
    phone: '95932919',
    email: 'elin.larsen@medvandrerne.org',
    image: require('../assets/img/folk/elin.png'),
  },
  {
    id: 3,
    role: 'Fagansvarlig',
    name: 'Raymond Tollefsen',
    phone: '',
    email: 'raymond@medvandrerne.org',
    image: require('../assets/img/folk/raymond.png'),
  },
  {
    id: 4,
    role: 'Utstyrsansvarlig',
    name: 'Ivar Brecke Nygaard',
    phone: '',
    email: 'ivar@medvandrerne.org',
    image: require('../assets/img/folk/ivar.jpg'),
  },
  {
    id: 5,
    role: 'Miljø og samfunnsansvar',
    name: 'Siri Otterskred',
    phone: '',
    email: 'siri@medvandrerne.org',
    image: require('../assets/img/folk/siri.png'),
  },
  {
    id: 6,
    role: 'Kaoskoordinator',
    name: 'Henrik Brendhagen',
    phone: '991 22 328',
    email: 'henrik@medvandrerne.org',
    image: require('../assets/img/folk/henrik.png'),
  },
];

// Board members
export const BOARD = {
  leader: 'Sigmund Aunan',
  leaderImage: null, // Image not available
  members: [
    { name: 'Are Lerstein', image: null },
    { name: 'Ivar Brecke Nygaard', image: require('../assets/img/folk/ivar.jpg') },
    { name: 'Pål Berger', image: null },
    { name: 'Per Sandvik', image: null },
    { name: 'Raymond Tollefsen', image: require('../assets/img/folk/raymond.png') },
    { name: 'Aina Rype', image: null },
  ],
};

// Sample activities (from calendar)
export const SAMPLE_ACTIVITIES = [
  {
    id: 1,
    title: 'Admmøte',
    date: '2025-11-09',
    time: '18:00-19:00',
    location: 'Har ikke sted',
    type: 'Møte',
  },
  {
    id: 2,
    title: 'Strafferettskonferanse',
    date: '2025-11-14',
    time: '09:00-16:00',
    location: 'Har ikke sted',
    type: 'Konferanse',
  },
  {
    id: 3,
    title: 'MV Oslofjorden: Tur til Vardåsen',
    date: '2025-11-15',
    time: '11:00-12:00',
    location: 'Asker stasjon, Torvveien 4, 1383 Asker',
    type: 'Tur',
  },
  {
    id: 4,
    title: 'Mush Synnfjell',
    date: '2026-01-09',
    time: 'Hele dagen',
    endDate: '2026-01-11',
    location: 'Har ikke sted',
    type: 'Motivasjonstur',
    multiDay: true,
  },
  {
    id: 5,
    title: 'Femundløpet 2026',
    date: '2026-02-08',
    time: 'Hele dagen',
    endDate: '2026-02-15',
    location: 'Har ikke sted',
    type: 'Arrangement',
    multiDay: true,
  },
  {
    id: 6,
    title: 'Fjellbris 2026',
    date: '2026-04-25',
    time: 'Hele dagen',
    endDate: '2026-04-26',
    location: 'Har ikke sted',
    type: 'Motivasjonstur',
    multiDay: true,
  },
];

// Supporters
export const SUPPORTERS = {
  financial: [
    'Gjensidigestiftelsen',
    'Kavlifondet',
    'Helle Bennets Fond',
    'Fred. Olsen Social Engagement Group',
  ],
  partners: [
    'Brynje of Norway',
    'Asker Bilutleie',
    'Helsport',
    'Drytech',
    'Piteraq - Tinder og banditter',
  ],
  friends: [
    'Stiftelsen Petter Uteligger',
    'Femundløpet',
    'Solliakollektivet',
    'Asker Gatelag',
    'Tyrilistiftelsen',
    'Blåkors Steg for Steg',
    'Frelsesarmeens rusomsorg',
    'Kirkens Bymisjon Kongsberg',
    'Mina og Meg',
    'Matsentralen',
    'DNT',
    'Erfaringssentrum',
    'Fremtidshavet',
    'KORUS',
    'LAFT',
    'VIXON',
  ],
};

