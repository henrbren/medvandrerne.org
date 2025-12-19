import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAMIFICATION_STORAGE_KEY = '@medvandrerne_gamification';
const XP_PER_ACTIVITY_REGISTRATION = 10; // XP for registering
const XP_PER_ACTIVITY_COMPLETION = 40; // XP for completing (total 50)
const XP_PER_REFLECTION = 30;
const XP_PER_MASTERY_MOMENT = 40;
const XP_PER_EXPEDITION = 60;
const XP_PER_ENVIRONMENT_ACTION = 35;
const XP_PER_WEEK_STREAK = 25;

// Level thresholds (XP required for each level)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  800,    // Level 5
  1200,   // Level 6
  1700,   // Level 7
  2300,   // Level 8
  3000,   // Level 9
  4000,   // Level 10
  5200,   // Level 11
  6600,   // Level 12
  8200,   // Level 13
  10000,  // Level 14
  12000,  // Level 15
  14500,  // Level 16
  17500,  // Level 17
  21000,  // Level 18
  25000,  // Level 19
  29500,  // Level 20
  34500,  // Level 21
  40000,  // Level 22
  46000,  // Level 23
  52500,  // Level 24
  59500,  // Level 25
  67000,  // Level 26
  75000,  // Level 27
  83500,  // Level 28
  92500,  // Level 29
  102000, // Level 30
];

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first_activity',
    title: 'Første steg',
    description: 'Fullfør din første aktivitet',
    icon: 'star',
    category: 'activities',
    threshold: 1,
    xpReward: 50,
  },
  {
    id: 'five_activities',
    title: 'I gang!',
    description: 'Fullfør 5 aktiviteter eller ferdigheter',
    icon: 'trophy',
    category: 'combined',
    threshold: 5,
    xpReward: 100,
  },
  {
    id: 'ten_activities',
    title: 'Aktiv deltaker',
    description: 'Fullfør 10 aktiviteter',
    icon: 'star',
    category: 'activities',
    threshold: 10,
    xpReward: 200,
  },
  {
    id: 'first_reflection',
    title: 'Refleksjon',
    description: 'Skriv din første refleksjon',
    icon: 'book',
    category: 'reflections',
    threshold: 1,
    xpReward: 30,
  },
  {
    id: 'five_reflections',
    title: 'Refleksjonstenker',
    description: 'Skriv 5 refleksjoner',
    icon: 'book-open',
    category: 'reflections',
    threshold: 5,
    xpReward: 100,
  },
  {
    id: 'first_moment',
    title: 'Mestring',
    description: 'Registrer ditt første mestringsmoment',
    icon: 'trophy',
    category: 'moments',
    threshold: 1,
    xpReward: 40,
  },
  {
    id: 'streak_week',
    title: 'Ukestreak',
    description: 'Hold en uke på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 1,
    xpReward: 50,
  },
  {
    id: 'streak_month',
    title: 'Månedstreak',
    description: 'Hold 4 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 4,
    xpReward: 200,
  },
  {
    id: 'first_expedition',
    title: 'Oppdagelse',
    description: 'Gå på din første ekspedisjon',
    icon: 'map',
    category: 'expeditions',
    threshold: 1,
    xpReward: 60,
  },
  {
    id: 'environment_warrior',
    title: 'Miljøkriger',
    description: 'Utfør 5 miljøaksjoner',
    icon: 'leaf',
    category: 'environment',
    threshold: 5,
    xpReward: 150,
  },
  {
    id: 'first_skill',
    title: 'Ferdighet',
    description: 'Lær din første ferdighet',
    icon: 'star',
    category: 'skills',
    threshold: 1,
    xpReward: 50,
  },
  {
    id: 'five_skills',
    title: 'Kompetent',
    description: 'Lær 5 ferdigheter',
    icon: 'star',
    category: 'skills',
    threshold: 5,
    xpReward: 150,
  },
  {
    id: 'all_skills',
    title: 'Ferdighetsmester',
    description: 'Lær alle ferdigheter',
    icon: 'trophy',
    category: 'skills',
    threshold: 10,
    xpReward: 500,
  },
  {
    id: 'level_5',
    title: 'Erfaren',
    description: 'Nå nivå 5',
    icon: 'star',
    category: 'level',
    threshold: 5,
    xpReward: 0,
  },
  {
    id: 'level_10',
    title: 'Nivåmester',
    description: 'Nå nivå 10',
    icon: 'trophy',
    category: 'level',
    threshold: 10,
    xpReward: 0,
  },
  // Additional Activities milestones
  {
    id: 'three_activities',
    title: 'I gang med aktiviteter',
    description: 'Fullfør 3 aktiviteter',
    icon: 'walk',
    category: 'activities',
    threshold: 3,
    xpReward: 75,
  },
  {
    id: 'fifteen_activities',
    title: 'Aktiv',
    description: 'Fullfør 15 aktiviteter',
    icon: 'walk',
    category: 'activities',
    threshold: 15,
    xpReward: 300,
  },
  {
    id: 'twenty_activities',
    title: 'Engasjert',
    description: 'Fullfør 20 aktiviteter',
    icon: 'trophy',
    category: 'activities',
    threshold: 20,
    xpReward: 400,
  },
  {
    id: 'twenty_five_activities',
    title: 'Dedikert aktivist',
    description: 'Fullfør 25 aktiviteter',
    icon: 'trophy',
    category: 'activities',
    threshold: 25,
    xpReward: 500,
  },
  {
    id: 'fifty_activities',
    title: 'Veteran',
    description: 'Fullfør 50 aktiviteter',
    icon: 'star',
    category: 'activities',
    threshold: 50,
    xpReward: 1000,
  },
  {
    id: 'hundred_activities',
    title: 'Legende',
    description: 'Fullfør 100 aktiviteter',
    icon: 'trophy',
    category: 'activities',
    threshold: 100,
    xpReward: 2000,
  },
  // Additional Reflections milestones
  {
    id: 'three_reflections',
    title: 'Reflekterer',
    description: 'Skriv 3 refleksjoner',
    icon: 'book',
    category: 'reflections',
    threshold: 3,
    xpReward: 60,
  },
  {
    id: 'ten_reflections',
    title: 'Dyp tenker',
    description: 'Skriv 10 refleksjoner',
    icon: 'book-open',
    category: 'reflections',
    threshold: 10,
    xpReward: 200,
  },
  {
    id: 'twenty_reflections',
    title: 'Filosof',
    description: 'Skriv 20 refleksjoner',
    icon: 'book-open',
    category: 'reflections',
    threshold: 20,
    xpReward: 400,
  },
  {
    id: 'fifty_reflections',
    title: 'Visdom',
    description: 'Skriv 50 refleksjoner',
    icon: 'book',
    category: 'reflections',
    threshold: 50,
    xpReward: 800,
  },
  {
    id: 'hundred_reflections',
    title: 'Sage',
    description: 'Skriv 100 refleksjoner',
    icon: 'book-open',
    category: 'reflections',
    threshold: 100,
    xpReward: 1500,
  },
  // Additional Moments milestones
  {
    id: 'three_moments',
    title: 'Mestringsmønster',
    description: 'Registrer 3 mestringsmomenter',
    icon: 'trophy',
    category: 'moments',
    threshold: 3,
    xpReward: 120,
  },
  {
    id: 'five_moments',
    title: 'Mestringsmiljø',
    description: 'Registrer 5 mestringsmomenter',
    icon: 'trophy',
    category: 'moments',
    threshold: 5,
    xpReward: 200,
  },
  {
    id: 'ten_moments',
    title: 'Mestringsmaster',
    description: 'Registrer 10 mestringsmomenter',
    icon: 'trophy',
    category: 'moments',
    threshold: 10,
    xpReward: 400,
  },
  {
    id: 'twenty_moments',
    title: 'Mestringsekspert',
    description: 'Registrer 20 mestringsmomenter',
    icon: 'trophy',
    category: 'moments',
    threshold: 20,
    xpReward: 800,
  },
  {
    id: 'fifty_moments',
    title: 'Mestringsmester',
    description: 'Registrer 50 mestringsmomenter',
    icon: 'trophy',
    category: 'moments',
    threshold: 50,
    xpReward: 1500,
  },
  // Additional Streak milestones
  {
    id: 'streak_two_weeks',
    title: 'To uker',
    description: 'Hold 2 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 2,
    xpReward: 100,
  },
  {
    id: 'streak_three_weeks',
    title: 'Tre uker',
    description: 'Hold 3 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 3,
    xpReward: 150,
  },
  {
    id: 'streak_two_months',
    title: 'To måneder',
    description: 'Hold 8 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 8,
    xpReward: 400,
  },
  {
    id: 'streak_three_months',
    title: 'Tre måneder',
    description: 'Hold 12 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 12,
    xpReward: 600,
  },
  {
    id: 'streak_four_months',
    title: 'Fire måneder',
    description: 'Hold 16 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 16,
    xpReward: 800,
  },
  {
    id: 'streak_six_months',
    title: 'Halvt år',
    description: 'Hold 24 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 24,
    xpReward: 1200,
  },
  {
    id: 'streak_year',
    title: 'Hele året',
    description: 'Hold 52 uker på rad',
    icon: 'flame',
    category: 'streak',
    threshold: 52,
    xpReward: 2500,
  },
  // Additional Expeditions milestones
  {
    id: 'three_expeditions',
    title: 'Utforsker',
    description: 'Gå på 3 ekspedisjoner',
    icon: 'map',
    category: 'expeditions',
    threshold: 3,
    xpReward: 180,
  },
  {
    id: 'five_expeditions',
    title: 'Oppdager',
    description: 'Gå på 5 ekspedisjoner',
    icon: 'map',
    category: 'expeditions',
    threshold: 5,
    xpReward: 300,
  },
  {
    id: 'ten_expeditions',
    title: 'Eventyrer',
    description: 'Gå på 10 ekspedisjoner',
    icon: 'map',
    category: 'expeditions',
    threshold: 10,
    xpReward: 600,
  },
  {
    id: 'twenty_expeditions',
    title: 'Pioner',
    description: 'Gå på 20 ekspedisjoner',
    icon: 'map',
    category: 'expeditions',
    threshold: 20,
    xpReward: 1200,
  },
  // Additional Environment milestones
  {
    id: 'first_environment',
    title: 'Miljøbevisst',
    description: 'Utfør din første miljøaksjon',
    icon: 'leaf',
    category: 'environment',
    threshold: 1,
    xpReward: 35,
  },
  {
    id: 'ten_environment',
    title: 'Miljøforkjemper',
    description: 'Utfør 10 miljøaksjoner',
    icon: 'leaf',
    category: 'environment',
    threshold: 10,
    xpReward: 300,
  },
  {
    id: 'twenty_environment',
    title: 'Miljøaktivist',
    description: 'Utfør 20 miljøaksjoner',
    icon: 'leaf',
    category: 'environment',
    threshold: 20,
    xpReward: 600,
  },
  {
    id: 'fifty_environment',
    title: 'Miljøhelt',
    description: 'Utfør 50 miljøaksjoner',
    icon: 'leaf',
    category: 'environment',
    threshold: 50,
    xpReward: 1500,
  },
  // Additional Skills milestones
  {
    id: 'three_skills',
    title: 'Lærer',
    description: 'Lær 3 ferdigheter',
    icon: 'star',
    category: 'skills',
    threshold: 3,
    xpReward: 100,
  },
  {
    id: 'seven_skills',
    title: 'Erfaren',
    description: 'Lær 7 ferdigheter',
    icon: 'star',
    category: 'skills',
    threshold: 7,
    xpReward: 250,
  },
  {
    id: 'fifteen_skills',
    title: 'Ekspert',
    description: 'Lær 15 ferdigheter',
    icon: 'star',
    category: 'skills',
    threshold: 15,
    xpReward: 600,
  },
  {
    id: 'twenty_skills',
    title: 'Ferdighetsekspert',
    description: 'Lær 20 ferdigheter',
    icon: 'trophy',
    category: 'skills',
    threshold: 20,
    xpReward: 1000,
  },
  {
    id: 'twenty_five_skills',
    title: 'Grandmaster',
    description: 'Lær 25 ferdigheter',
    icon: 'trophy',
    category: 'skills',
    threshold: 25,
    xpReward: 2000,
  },
  // Additional Level milestones
  {
    id: 'level_3',
    title: 'Nybegynner',
    description: 'Nå nivå 3',
    icon: 'star',
    category: 'level',
    threshold: 3,
    xpReward: 0,
  },
  {
    id: 'level_7',
    title: 'Avansert',
    description: 'Nå nivå 7',
    icon: 'star',
    category: 'level',
    threshold: 7,
    xpReward: 0,
  },
  {
    id: 'level_15',
    title: 'Ekspert',
    description: 'Nå nivå 15',
    icon: 'trophy',
    category: 'level',
    threshold: 15,
    xpReward: 0,
  },
  {
    id: 'level_20',
    title: 'Nivålegende',
    description: 'Nå nivå 20',
    icon: 'trophy',
    category: 'level',
    threshold: 20,
    xpReward: 0,
  },
  {
    id: 'level_25',
    title: 'Legende',
    description: 'Nå nivå 25',
    icon: 'trophy',
    category: 'level',
    threshold: 25,
    xpReward: 0,
  },
  {
    id: 'level_30',
    title: 'Univers',
    description: 'Nå nivå 30',
    icon: 'trophy',
    category: 'level',
    threshold: 30,
    xpReward: 0,
  },
  // Additional Combined milestones
  {
    id: 'ten_combined',
    title: 'Mangefasettert',
    description: 'Fullfør 10 aktiviteter eller ferdigheter',
    icon: 'trophy',
    category: 'combined',
    threshold: 10,
    xpReward: 200,
  },
  {
    id: 'twenty_combined',
    title: 'Allsidig',
    description: 'Fullfør 20 aktiviteter eller ferdigheter',
    icon: 'trophy',
    category: 'combined',
    threshold: 20,
    xpReward: 400,
  },
  {
    id: 'fifty_combined',
    title: 'Komplett',
    description: 'Fullfør 50 aktiviteter eller ferdigheter',
    icon: 'trophy',
    category: 'combined',
    threshold: 50,
    xpReward: 1000,
  },
  {
    id: 'hundred_combined',
    title: 'Uomtvistelig',
    description: 'Fullfør 100 aktiviteter eller ferdigheter',
    icon: 'trophy',
    category: 'combined',
    threshold: 100,
    xpReward: 2000,
  },
  {
    id: 'two_hundred_combined',
    title: 'Uovertruffen',
    description: 'Fullfør 200 aktiviteter eller ferdigheter',
    icon: 'trophy',
    category: 'combined',
    threshold: 200,
    xpReward: 5000,
  },
];

export const useGamification = (stats) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [totalXP, setTotalXP] = useState(null); // Start with null to indicate not loaded yet
  const [loading, setLoading] = useState(true);
  const [lastXPUpdate, setLastXPUpdate] = useState(null);

  useEffect(() => {
    loadGamificationData();
  }, []);

  // Single useEffect to handle all stats changes and recalculations
  useEffect(() => {
    if (!loading && stats) {
      const statsHash = JSON.stringify({
        activities: stats.totalCompletedActivities || 0,
        registrations: stats.totalRegistrations || 0,
        reflections: stats.totalReflections || 0,
        moments: stats.totalMoments || 0,
        streak: stats.currentStreak || 0,
        expeditions: stats.totalExpeditions || 0,
        environment: stats.totalEnvironmentActions || 0,
        skills: stats.totalSkills || 0,
        skillsXP: stats.skillsXP || 0,
      });
      
      // Only recalculate if stats actually changed
      if (statsHash !== lastXPUpdate) {
        setLastXPUpdate(statsHash);
        // Use a debounce to avoid rapid recalculations during data loading
        const timeoutId = setTimeout(() => {
          // Calculate XP first, then check achievements
          calculateXP().then(() => {
            // Use a small delay to ensure state is updated
            setTimeout(() => {
              checkAchievements();
            }, 50);
          });
        }, 100); // Debounce to wait for all stats to settle
        
        return () => clearTimeout(timeoutId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, loading]);

  const loadGamificationData = async () => {
    try {
      const stored = await AsyncStorage.getItem(GAMIFICATION_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setUnlockedAchievements(data.unlockedAchievements || []);
        setTotalXP(data.totalXP || 0);
      } else {
        // Explicitly reset to empty when no data exists
        setUnlockedAchievements([]);
        setTotalXP(0); // Only set to 0 after confirming no data exists
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setUnlockedAchievements([]);
      setTotalXP(0);
    } finally {
      setLoading(false);
    }
  };

  const saveGamificationData = async (data) => {
    try {
      await AsyncStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  };

  const calculateBaseXP = () => {
    if (!stats) return 0;

    let baseXP = 0;
    
    // XP from activity registrations (10 XP per registration)
    const totalRegistrations = stats.totalRegistrations || 0;
    baseXP += totalRegistrations * XP_PER_ACTIVITY_REGISTRATION;
    
    // XP from completed activities (40 XP per completion)
    const totalCompleted = stats.totalCompletedActivities || 0;
    baseXP += totalCompleted * XP_PER_ACTIVITY_COMPLETION;
    
    // XP from reflections
    baseXP += (stats.totalReflections || 0) * XP_PER_REFLECTION;
    
    // XP from mastery moments
    baseXP += (stats.totalMoments || 0) * XP_PER_MASTERY_MOMENT;
    
    // XP from expeditions
    baseXP += (stats.totalExpeditions || 0) * XP_PER_EXPEDITION;
    
    // XP from environment actions
    baseXP += (stats.totalEnvironmentActions || 0) * XP_PER_ENVIRONMENT_ACTION;
    
    // XP from streak (convert days to weeks)
    const streakDays = stats.currentStreak || 0;
    const streakWeeks = Math.floor(streakDays / 7);
    baseXP += streakWeeks * XP_PER_WEEK_STREAK;
    
    // XP from skills - add skills XP from stats (can be 0, so check for undefined/null)
    if (stats.skillsXP !== undefined && stats.skillsXP !== null) {
      baseXP += stats.skillsXP;
    }
    
    // Ensure baseXP is never negative
    return Math.max(0, baseXP);
  };

  const calculateXP = async () => {
    if (!stats) return;

    const baseXP = calculateBaseXP();
    
    // Add XP from unlocked achievements
    let achievementXP = 0;
    unlockedAchievements.forEach(achievementId => {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement && achievement.xpReward > 0) {
        achievementXP += achievement.xpReward;
      }
    });

    const total = baseXP + achievementXP;
    // Ensure total is never negative or NaN
    const validTotal = Math.max(0, isNaN(total) ? 0 : total);
    setTotalXP(validTotal);
    // Only save if we have valid data (not during initial load)
    if (validTotal > 0 || unlockedAchievements.length > 0) {
      await saveGamificationData({ unlockedAchievements, totalXP: validTotal });
    }
  };

  const checkAchievements = async () => {
    if (!stats) return;

    // Calculate current XP to use for level achievements (avoid stale state)
    const baseXP = calculateBaseXP();
    let currentAchievementXP = 0;
    unlockedAchievements.forEach(achievementId => {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement && achievement.xpReward > 0) {
        currentAchievementXP += achievement.xpReward;
      }
    });
    const currentCalculatedXP = baseXP + currentAchievementXP;
    const currentLevel = getLevel(currentCalculatedXP);

    const newUnlocks = [];
    const currentUnlocks = [...unlockedAchievements];

    ACHIEVEMENTS.forEach(achievement => {
      if (currentUnlocks.includes(achievement.id)) return;

      let currentValue = 0;

      switch (achievement.category) {
        case 'activities':
          currentValue = stats.totalCompletedActivities || 0;
          break;
        case 'reflections':
          currentValue = stats.totalReflections || 0;
          break;
        case 'moments':
          currentValue = stats.totalMoments || 0;
          break;
        case 'streak':
          // Convert days to weeks for streak achievements
          const streakDays = stats.currentStreak || 0;
          currentValue = Math.floor(streakDays / 7);
          break;
        case 'expeditions':
          currentValue = stats.totalExpeditions || 0;
          break;
        case 'environment':
          currentValue = stats.totalEnvironmentActions || 0;
          break;
        case 'skills':
          currentValue = stats.totalSkills || 0;
          break;
        case 'combined':
          // Combined activities and skills
          currentValue = (stats.totalActivities || 0) + (stats.totalSkills || 0);
          break;
        case 'level':
          currentValue = currentLevel;
          break;
      }

      if (currentValue >= achievement.threshold) {
        newUnlocks.push(achievement.id);
      }
    });

    if (newUnlocks.length > 0) {
      const updatedUnlocks = [...currentUnlocks, ...newUnlocks];
      setUnlockedAchievements(updatedUnlocks);
      
      // Recalculate XP with new achievements
      const baseXP = calculateBaseXP();
      let achievementXP = 0;
      updatedUnlocks.forEach(achievementId => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement && achievement.xpReward > 0) {
          achievementXP += achievement.xpReward;
        }
      });
      
      const newXP = baseXP + achievementXP;
      // Ensure newXP is never negative or NaN
      const validNewXP = Math.max(0, isNaN(newXP) ? 0 : newXP);
      setTotalXP(validNewXP);
      await saveGamificationData({ 
        unlockedAchievements: updatedUnlocks, 
        totalXP: validNewXP 
      });
    }
  };

  const getLevel = (xp) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getXPForNextLevel = (xp) => {
    // Ensure xp is valid
    const validXP = Math.max(0, isNaN(xp) ? 0 : xp);
    const currentLevel = getLevel(validXP);
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return null; // Max level
    }
    return LEVEL_THRESHOLDS[currentLevel];
  };

  const getXPProgress = (xp) => {
    // Ensure xp is valid
    const validXP = Math.max(0, isNaN(xp) ? 0 : xp);
    const currentLevel = getLevel(validXP);
    
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      // Max level reached
      return { current: validXP, next: null, progress: 1 };
    }
    
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
    const thresholdDiff = nextThreshold - currentThreshold;
    
    // Prevent division by zero
    if (thresholdDiff <= 0) {
      return { current: validXP - currentThreshold, next: thresholdDiff, progress: 1 };
    }
    
    const progress = (validXP - currentThreshold) / thresholdDiff;
    
    return {
      current: Math.max(0, validXP - currentThreshold),
      next: thresholdDiff,
      progress: Math.min(Math.max(0, progress), 1), // Clamp between 0 and 1
    };
  };

  const getAchievements = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id),
    }));
  }, [unlockedAchievements]);

  const getUnlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
  }, [unlockedAchievements]);

  const getLockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id));
  }, [unlockedAchievements]);

  const nextMilestones = useMemo(() => {
    if (!stats) return [];
    
    const limit = 3;
    const locked = [...getLockedAchievements]; // Create a copy to avoid mutating
    
    if (locked.length === 0) return [];
    
    // Calculate current XP for level achievements (avoid stale state)
    const baseXP = calculateBaseXP();
    let currentAchievementXP = 0;
    unlockedAchievements.forEach(achievementId => {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement && achievement.xpReward > 0) {
        currentAchievementXP += achievement.xpReward;
      }
    });
    const currentCalculatedXP = baseXP + currentAchievementXP;
    const currentCalculatedLevel = getLevel(currentCalculatedXP);
    
    // Calculate progress for each achievement and sort by progress (highest first)
    const milestonesWithProgress = locked.map(achievement => {
      let currentValue = 0;
      switch (achievement.category) {
        case 'activities': currentValue = stats?.totalActivities || 0; break;
        case 'reflections': currentValue = stats?.totalReflections || 0; break;
        case 'moments': currentValue = stats?.totalMoments || 0; break;
        case 'streak': 
          // Convert days to weeks for streak achievements
          const streakDaysMilestone = stats?.currentStreak || 0;
          currentValue = Math.floor(streakDaysMilestone / 7);
          break;
        case 'expeditions': currentValue = stats?.totalExpeditions || 0; break;
        case 'environment': currentValue = stats?.totalEnvironmentActions || 0; break;
        case 'skills': currentValue = stats?.totalSkills || 0; break;
        case 'combined': currentValue = (stats?.totalActivities || 0) + (stats?.totalSkills || 0); break;
        case 'level': currentValue = currentCalculatedLevel; break;
      }

      const progress = achievement.threshold > 0 
        ? Math.min(currentValue / achievement.threshold, 1) 
        : 0;

      return {
        ...achievement,
        currentValue,
        progress,
      };
    });

    // Sort by progress (highest first) - shows closest milestones first
    const sorted = milestonesWithProgress.sort((a, b) => {
      // If progress is equal, prefer lower threshold (easier to achieve)
      if (Math.abs(a.progress - b.progress) < 0.01) {
        return a.threshold - b.threshold;
      }
      return b.progress - a.progress;
    });

    return sorted.slice(0, limit);
  }, [stats, unlockedAchievements, getLockedAchievements]);

  // Only calculate level and progress if totalXP has been loaded (not null)
  const level = totalXP !== null ? getLevel(totalXP) : 1;
  const xpProgress = totalXP !== null ? getXPProgress(totalXP) : { current: 0, next: 100, progress: 0 };

  // Function to manually trigger XP recalculation
  const recalculateXP = async () => {
    if (stats) {
      await calculateXP();
      await checkAchievements();
    }
  };

  const reloadData = async () => {
    setLoading(true);
    // First reset state to ensure clean slate
    setUnlockedAchievements([]);
    setTotalXP(0);
    setLastXPUpdate(null);
    // Then load from storage (which should be empty after reset)
    await loadGamificationData();
    // Recalculate based on current stats (which should be 0 after reset)
    if (stats) {
      await calculateXP();
      await checkAchievements();
    }
    setLoading(false);
  };

  return {
    level,
    totalXP,
    xpProgress,
    achievements: getAchievements,
    unlockedAchievements: getUnlockedAchievements,
    lockedAchievements: getLockedAchievements,
    nextMilestones,
    loading,
    recalculateXP,
    reloadData,
  };
};

