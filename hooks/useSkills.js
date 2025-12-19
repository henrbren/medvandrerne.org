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

