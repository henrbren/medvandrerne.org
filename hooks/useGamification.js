import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api';
import { getLevelName } from '../utils/journeyUtils';

const GAMIFICATION_STORAGE_KEY = '@medvandrerne_gamification';
const LAST_SYNC_KEY = '@medvandrerne_gamification_last_sync';
const SYNC_DEBOUNCE_MS = 5000; // Wait 5 seconds before syncing to backend
const XP_PER_ACTIVITY_REGISTRATION = 10; // XP for registering
const XP_PER_ACTIVITY_COMPLETION = 40; // XP for completing (total 50)
const XP_PER_REFLECTION = 30;
const XP_PER_MASTERY_MOMENT = 40;
const XP_PER_EXPEDITION = 60;
const XP_PER_ENVIRONMENT_ACTION = 35;
const XP_PER_WEEK_STREAK = 25;
// Trip XP is calculated dynamically based on distance, elevation, difficulty

// Level thresholds (XP required for each level)
// Progression: Early levels are quick, higher levels require more dedication
// Level 100 requires significant long-term engagement
const LEVEL_THRESHOLDS = [
  // Beginner (1-10): Quick progression to hook users
  0,        // Level 1
  100,      // Level 2
  250,      // Level 3
  500,      // Level 4
  800,      // Level 5
  1200,     // Level 6
  1700,     // Level 7
  2300,     // Level 8
  3000,     // Level 9
  4000,     // Level 10
  
  // Intermediate (11-20): Steady growth
  5200,     // Level 11
  6600,     // Level 12
  8200,     // Level 13
  10000,    // Level 14
  12000,    // Level 15
  14500,    // Level 16
  17500,    // Level 17
  21000,    // Level 18
  25000,    // Level 19
  29500,    // Level 20
  
  // Advanced (21-30): Requires dedication
  34500,    // Level 21
  40000,    // Level 22
  46000,    // Level 23
  52500,    // Level 24
  59500,    // Level 25
  67000,    // Level 26
  75000,    // Level 27
  83500,    // Level 28
  92500,    // Level 29
  102000,   // Level 30
  
  // Expert (31-40): Serious commitment
  112500,   // Level 31
  124000,   // Level 32
  136500,   // Level 33
  150000,   // Level 34
  165000,   // Level 35
  181000,   // Level 36
  198000,   // Level 37
  216000,   // Level 38
  236000,   // Level 39
  257000,   // Level 40
  
  // Master (41-50): Long-term engagement
  280000,   // Level 41
  305000,   // Level 42
  332000,   // Level 43
  361000,   // Level 44
  392000,   // Level 45
  425000,   // Level 46
  460000,   // Level 47
  498000,   // Level 48
  538000,   // Level 49
  580000,   // Level 50
  
  // Grandmaster (51-60): True dedication
  625000,   // Level 51
  673000,   // Level 52
  724000,   // Level 53
  778000,   // Level 54
  835000,   // Level 55
  895000,   // Level 56
  958000,   // Level 57
  1025000,  // Level 58
  1095000,  // Level 59
  1170000,  // Level 60
  
  // Legend (61-70): Rare achievement
  1250000,  // Level 61
  1335000,  // Level 62
  1425000,  // Level 63
  1520000,  // Level 64
  1620000,  // Level 65
  1725000,  // Level 66
  1835000,  // Level 67
  1950000,  // Level 68
  2070000,  // Level 69
  2200000,  // Level 70
  
  // Mythic (71-80): Exceptional
  2340000,  // Level 71
  2490000,  // Level 72
  2650000,  // Level 73
  2820000,  // Level 74
  3000000,  // Level 75
  3190000,  // Level 76
  3390000,  // Level 77
  3600000,  // Level 78
  3820000,  // Level 79
  4050000,  // Level 80
  
  // Immortal (81-90): Elite status
  4300000,  // Level 81
  4560000,  // Level 82
  4840000,  // Level 83
  5140000,  // Level 84
  5460000,  // Level 85
  5800000,  // Level 86
  6160000,  // Level 87
  6540000,  // Level 88
  6940000,  // Level 89
  7360000,  // Level 90
  
  // Transcendent (91-100): The ultimate journey
  7810000,  // Level 91
  8280000,  // Level 92
  8780000,  // Level 93
  9310000,  // Level 94
  9870000,  // Level 95
  10460000, // Level 96
  11080000, // Level 97
  11730000, // Level 98
  12410000, // Level 99
  13130000, // Level 100 - The Summit! 🏔️
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
    title: 'Mester',
    description: 'Nå nivå 30',
    icon: 'trophy',
    category: 'level',
    threshold: 30,
    xpReward: 0,
  },
  {
    id: 'level_40',
    title: 'Ekspert',
    description: 'Nå nivå 40',
    icon: 'medal',
    category: 'level',
    threshold: 40,
    xpReward: 0,
  },
  {
    id: 'level_50',
    title: 'Grandmaster',
    description: 'Nå nivå 50 - Halvveis til toppen!',
    icon: 'ribbon',
    category: 'level',
    threshold: 50,
    xpReward: 0,
  },
  {
    id: 'level_60',
    title: 'Legende',
    description: 'Nå nivå 60',
    icon: 'diamond',
    category: 'level',
    threshold: 60,
    xpReward: 0,
  },
  {
    id: 'level_70',
    title: 'Mytisk',
    description: 'Nå nivå 70',
    icon: 'planet',
    category: 'level',
    threshold: 70,
    xpReward: 0,
  },
  {
    id: 'level_80',
    title: 'Udødelig',
    description: 'Nå nivå 80',
    icon: 'infinite',
    category: 'level',
    threshold: 80,
    xpReward: 0,
  },
  {
    id: 'level_90',
    title: 'Transcendent',
    description: 'Nå nivå 90',
    icon: 'sparkles',
    category: 'level',
    threshold: 90,
    xpReward: 0,
  },
  {
    id: 'level_100',
    title: 'Toppen! 🏔️',
    description: 'Nå nivå 100 - Du har fullført reisen!',
    icon: 'trophy',
    category: 'level',
    threshold: 100,
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
  // Trip achievements
  {
    id: 'first_trip',
    title: 'Første tur',
    description: 'Logg din første tur',
    icon: 'footsteps',
    category: 'trips',
    threshold: 1,
    xpReward: 50,
  },
  {
    id: 'three_trips',
    title: 'Turglad',
    description: 'Logg 3 turer',
    icon: 'footsteps',
    category: 'trips',
    threshold: 3,
    xpReward: 100,
  },
  {
    id: 'five_trips',
    title: 'Turentusiast',
    description: 'Logg 5 turer',
    icon: 'footsteps',
    category: 'trips',
    threshold: 5,
    xpReward: 150,
  },
  {
    id: 'ten_trips',
    title: 'Erfaren turgåer',
    description: 'Logg 10 turer',
    icon: 'trail-sign',
    category: 'trips',
    threshold: 10,
    xpReward: 300,
  },
  {
    id: 'twenty_five_trips',
    title: 'Turveteran',
    description: 'Logg 25 turer',
    icon: 'trail-sign',
    category: 'trips',
    threshold: 25,
    xpReward: 750,
  },
  {
    id: 'fifty_trips',
    title: 'Turekspert',
    description: 'Logg 50 turer',
    icon: 'compass',
    category: 'trips',
    threshold: 50,
    xpReward: 1500,
  },
  {
    id: 'hundred_trips',
    title: 'Turlegende',
    description: 'Logg 100 turer',
    icon: 'compass',
    category: 'trips',
    threshold: 100,
    xpReward: 3000,
  },
  // Distance milestones
  {
    id: 'first_10km',
    title: 'Første 10 km',
    description: 'Gå totalt 10 km',
    icon: 'walk',
    category: 'tripDistance',
    threshold: 10,
    xpReward: 50,
  },
  {
    id: 'first_50km',
    title: 'Halvmaraton',
    description: 'Gå totalt 50 km',
    icon: 'walk',
    category: 'tripDistance',
    threshold: 50,
    xpReward: 150,
  },
  {
    id: 'first_100km',
    title: 'Hundrekilometeren',
    description: 'Gå totalt 100 km',
    icon: 'walk',
    category: 'tripDistance',
    threshold: 100,
    xpReward: 300,
  },
  {
    id: 'first_500km',
    title: 'Langdistansevandrer',
    description: 'Gå totalt 500 km',
    icon: 'walk',
    category: 'tripDistance',
    threshold: 500,
    xpReward: 1000,
  },
  {
    id: 'first_1000km',
    title: 'Norgesvandrer',
    description: 'Gå totalt 1000 km',
    icon: 'globe',
    category: 'tripDistance',
    threshold: 1000,
    xpReward: 2500,
  },
  // Elevation milestones
  {
    id: 'first_1000m_elevation',
    title: 'Fjellklatrer',
    description: 'Gå totalt 1000 høydemeter',
    icon: 'trending-up',
    category: 'tripElevation',
    threshold: 1000,
    xpReward: 100,
  },
  {
    id: 'first_5000m_elevation',
    title: 'Fjellentusiast',
    description: 'Gå totalt 5000 høydemeter',
    icon: 'trending-up',
    category: 'tripElevation',
    threshold: 5000,
    xpReward: 300,
  },
  {
    id: 'first_10000m_elevation',
    title: 'Toppvandrer',
    description: 'Gå totalt 10 000 høydemeter',
    icon: 'trending-up',
    category: 'tripElevation',
    threshold: 10000,
    xpReward: 750,
  },
  {
    id: 'everest_elevation',
    title: 'Everest-høyde',
    description: 'Gå totalt 8848 høydemeter (Everest-høyde)',
    icon: 'flag',
    category: 'tripElevation',
    threshold: 8848,
    xpReward: 1000,
  },
  {
    id: 'double_everest',
    title: 'Dobbel Everest',
    description: 'Gå totalt 17 696 høydemeter',
    icon: 'flag',
    category: 'tripElevation',
    threshold: 17696,
    xpReward: 2000,
  },
  {
    id: 'fifty_thousand_elevation',
    title: 'Fjellkonge',
    description: 'Gå totalt 50 000 høydemeter',
    icon: 'mountain',
    category: 'tripElevation',
    threshold: 50000,
    xpReward: 5000,
  },
  
  // Distance mega-milestones
  {
    id: 'pilgrim_distance',
    title: 'Pilegrim',
    description: 'Gå totalt 2500 km (Camino de Santiago lengde)',
    icon: 'globe',
    category: 'tripDistance',
    threshold: 2500,
    xpReward: 5000,
  },
  {
    id: 'norway_distance',
    title: 'Norge på langs',
    description: 'Gå totalt 2518 km (Norge fra sør til nord)',
    icon: 'flag',
    category: 'tripDistance',
    threshold: 2518,
    xpReward: 7500,
  },
  
  // Motivation trips (short but consistent)
  {
    id: 'first_motivation_trip',
    title: 'Motivasjonstur',
    description: 'Logg en motivasjonstur (under 5 km)',
    icon: 'heart',
    category: 'motivationTrips',
    threshold: 1,
    xpReward: 40,
  },
  {
    id: 'five_motivation_trips',
    title: 'Motivert',
    description: 'Logg 5 motivasjonsturer',
    icon: 'heart',
    category: 'motivationTrips',
    threshold: 5,
    xpReward: 100,
  },
  {
    id: 'ten_motivation_trips',
    title: 'Hverdagsvandrer',
    description: 'Logg 10 motivasjonsturer',
    icon: 'heart',
    category: 'motivationTrips',
    threshold: 10,
    xpReward: 200,
  },
  {
    id: 'twenty_five_motivation_trips',
    title: 'Motivasjonsmester',
    description: 'Logg 25 motivasjonsturer',
    icon: 'heart',
    category: 'motivationTrips',
    threshold: 25,
    xpReward: 500,
  },
  {
    id: 'fifty_motivation_trips',
    title: 'Hverdagshelt',
    description: 'Logg 50 motivasjonsturer',
    icon: 'heart',
    category: 'motivationTrips',
    threshold: 50,
    xpReward: 1000,
  },
  
  // Weather braving achievements
  {
    id: 'rain_warrior',
    title: 'Regnkriger',
    description: 'Gå 5 turer i regn',
    icon: 'rainy',
    category: 'weatherRain',
    threshold: 5,
    xpReward: 150,
  },
  {
    id: 'storm_chaser',
    title: 'Stormjeger',
    description: 'Gå 10 turer i regn',
    icon: 'thunderstorm',
    category: 'weatherRain',
    threshold: 10,
    xpReward: 300,
  },
  {
    id: 'snow_wanderer',
    title: 'Snøvandrer',
    description: 'Gå 5 turer i snø',
    icon: 'snow',
    category: 'weatherSnow',
    threshold: 5,
    xpReward: 200,
  },
  {
    id: 'winter_master',
    title: 'Vintermester',
    description: 'Gå 15 turer i snø',
    icon: 'snow',
    category: 'weatherSnow',
    threshold: 15,
    xpReward: 500,
  },
  
  // Difficulty achievements
  {
    id: 'first_hard_trip',
    title: 'Utfordrer',
    description: 'Fullfør din første krevende tur',
    icon: 'fitness',
    category: 'hardTrips',
    threshold: 1,
    xpReward: 75,
  },
  {
    id: 'five_hard_trips',
    title: 'Tøffing',
    description: 'Fullfør 5 krevende turer',
    icon: 'fitness',
    category: 'hardTrips',
    threshold: 5,
    xpReward: 250,
  },
  {
    id: 'ten_hard_trips',
    title: 'Jernmann',
    description: 'Fullfør 10 krevende turer',
    icon: 'barbell',
    category: 'hardTrips',
    threshold: 10,
    xpReward: 500,
  },
  {
    id: 'first_expert_trip',
    title: 'Ekstremvandrer',
    description: 'Fullfør din første ekspert-tur',
    icon: 'skull',
    category: 'expertTrips',
    threshold: 1,
    xpReward: 150,
  },
  {
    id: 'five_expert_trips',
    title: 'Ytterpunkt',
    description: 'Fullfør 5 ekspert-turer',
    icon: 'skull',
    category: 'expertTrips',
    threshold: 5,
    xpReward: 500,
  },
  
  // Variety achievements
  {
    id: 'diverse_activities',
    title: 'Allsidig',
    description: 'Ha minst 1 av hver: refleksjon, moment, tur, ferdighet',
    icon: 'grid',
    category: 'variety',
    threshold: 4,
    xpReward: 100,
  },
  {
    id: 'well_rounded',
    title: 'Balansert',
    description: 'Ha minst 5 av hver: refleksjon, moment, tur',
    icon: 'pie-chart',
    category: 'varietyAdvanced',
    threshold: 15,
    xpReward: 300,
  },
  
  // XP Milestones
  {
    id: 'xp_1000',
    title: 'Første tusen',
    description: 'Oppnå 1 000 XP totalt',
    icon: 'star',
    category: 'totalXP',
    threshold: 1000,
    xpReward: 0,
  },
  {
    id: 'xp_5000',
    title: 'XP-samler',
    description: 'Oppnå 5 000 XP totalt',
    icon: 'star',
    category: 'totalXP',
    threshold: 5000,
    xpReward: 0,
  },
  {
    id: 'xp_10000',
    title: 'XP-jeger',
    description: 'Oppnå 10 000 XP totalt',
    icon: 'star',
    category: 'totalXP',
    threshold: 10000,
    xpReward: 0,
  },
  {
    id: 'xp_25000',
    title: 'XP-mester',
    description: 'Oppnå 25 000 XP totalt',
    icon: 'medal',
    category: 'totalXP',
    threshold: 25000,
    xpReward: 0,
  },
  {
    id: 'xp_50000',
    title: 'XP-legende',
    description: 'Oppnå 50 000 XP totalt',
    icon: 'ribbon',
    category: 'totalXP',
    threshold: 50000,
    xpReward: 0,
  },
  {
    id: 'xp_100000',
    title: 'Sekssifret!',
    description: 'Oppnå 100 000 XP totalt',
    icon: 'trophy',
    category: 'totalXP',
    threshold: 100000,
    xpReward: 0,
  },
  {
    id: 'xp_500000',
    title: 'Halvmillion',
    description: 'Oppnå 500 000 XP totalt',
    icon: 'diamond',
    category: 'totalXP',
    threshold: 500000,
    xpReward: 0,
  },
  {
    id: 'xp_1000000',
    title: 'Millionær!',
    description: 'Oppnå 1 000 000 XP totalt',
    icon: 'sparkles',
    category: 'totalXP',
    threshold: 1000000,
    xpReward: 0,
  },
  
  // Single trip achievements
  {
    id: 'marathon_trip',
    title: 'Maraton',
    description: 'Gå en tur på minst 42 km',
    icon: 'footsteps',
    category: 'singleTripDistance',
    threshold: 42,
    xpReward: 200,
  },
  {
    id: 'ultra_trip',
    title: 'Ultravandrer',
    description: 'Gå en tur på minst 100 km',
    icon: 'flash',
    category: 'singleTripDistance',
    threshold: 100,
    xpReward: 500,
  },
  {
    id: 'thousand_meter_day',
    title: 'Tusenmeteren',
    description: 'Gå en tur med 1000+ høydemeter',
    icon: 'trending-up',
    category: 'singleTripElevation',
    threshold: 1000,
    xpReward: 150,
  },
  {
    id: 'two_thousand_meter_day',
    title: 'Toppbestiger',
    description: 'Gå en tur med 2000+ høydemeter',
    icon: 'flag',
    category: 'singleTripElevation',
    threshold: 2000,
    xpReward: 350,
  },
  
  // Daily consistency
  {
    id: 'seven_day_streak',
    title: 'Ukesrytme',
    description: 'Logg aktivitet 7 dager på rad',
    icon: 'calendar',
    category: 'dailyStreak',
    threshold: 7,
    xpReward: 75,
  },
  {
    id: 'thirty_day_streak',
    title: 'Månedsvane',
    description: 'Logg aktivitet 30 dager på rad',
    icon: 'calendar',
    category: 'dailyStreak',
    threshold: 30,
    xpReward: 300,
  },
  {
    id: 'hundred_day_streak',
    title: 'Hundredagersclub',
    description: 'Logg aktivitet 100 dager på rad',
    icon: 'calendar',
    category: 'dailyStreak',
    threshold: 100,
    xpReward: 1000,
  },
  {
    id: 'year_streak',
    title: 'Årsrytme',
    description: 'Logg aktivitet 365 dager på rad',
    icon: 'infinite',
    category: 'dailyStreak',
    threshold: 365,
    xpReward: 5000,
  },
];

export const useGamification = (stats) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [totalXP, setTotalXP] = useState(null); // Start with null to indicate not loaded yet
  const [loading, setLoading] = useState(true);
  const lastXPUpdateRef = useRef(null);
  const xpUpdateTimeoutRef = useRef(null);

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
        trips: stats.totalTrips || 0,
        tripDistance: stats.totalTripDistance || 0,
        tripElevation: stats.totalTripElevation || 0,
        tripsXP: stats.tripsXP || 0,
        // New achievement stats
        motivationTrips: stats.motivationTrips || 0,
        rainTrips: stats.rainTrips || 0,
        snowTrips: stats.snowTrips || 0,
        hardTrips: stats.hardTrips || 0,
        expertTrips: stats.expertTrips || 0,
        longestTrip: stats.longestTrip || 0,
        highestElevationTrip: stats.highestElevationTrip || 0,
      });
      
      // Only recalculate if stats actually changed
      if (statsHash !== lastXPUpdateRef.current) {
        lastXPUpdateRef.current = statsHash;
        
        // Clear any existing timeout to avoid multiple calculations
        if (xpUpdateTimeoutRef.current) {
          clearTimeout(xpUpdateTimeoutRef.current);
        }
        
        // Use a debounce to avoid rapid recalculations during data loading
        xpUpdateTimeoutRef.current = setTimeout(() => {
          xpUpdateTimeoutRef.current = null; // Clear ref after execution
          // Calculate XP first, then check achievements
          calculateXP().then(() => {
            // Use a small delay to ensure state is updated
            setTimeout(() => {
              checkAchievements();
            }, 50);
          });
        }, 100); // Debounce to wait for all stats to settle
      }
    }
    // No cleanup function here - we manage the timeout manually via the ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, loading]);

  // Separate cleanup effect for unmount only
  useEffect(() => {
    return () => {
      if (xpUpdateTimeoutRef.current) {
        clearTimeout(xpUpdateTimeoutRef.current);
      }
    };
  }, []);

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
    
    // XP from trips - trips calculate their own XP dynamically
    if (stats.tripsXP !== undefined && stats.tripsXP !== null) {
      baseXP += stats.tripsXP;
    }
    
    // XP from pedometer (steps walked)
    if (stats.pedometerXP !== undefined && stats.pedometerXP !== null) {
      baseXP += stats.pedometerXP;
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
        case 'dailyStreak':
          // Daily streak in days
          currentValue = stats.currentStreak || 0;
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
        case 'trips':
          currentValue = stats.totalTrips || 0;
          break;
        case 'tripDistance':
          currentValue = stats.totalTripDistance || 0;
          break;
        case 'tripElevation':
          currentValue = stats.totalTripElevation || 0;
          break;
        case 'motivationTrips':
          currentValue = stats.motivationTrips || 0;
          break;
        case 'weatherRain':
          currentValue = stats.rainTrips || 0;
          break;
        case 'weatherSnow':
          currentValue = stats.snowTrips || 0;
          break;
        case 'hardTrips':
          currentValue = stats.hardTrips || 0;
          break;
        case 'expertTrips':
          currentValue = stats.expertTrips || 0;
          break;
        case 'variety':
          // Check if user has at least 1 of each: reflection, moment, trip, skill
          const hasReflection = (stats.totalReflections || 0) >= 1 ? 1 : 0;
          const hasMoment = (stats.totalMoments || 0) >= 1 ? 1 : 0;
          const hasTrip = (stats.totalTrips || 0) >= 1 ? 1 : 0;
          const hasSkill = (stats.totalSkills || 0) >= 1 ? 1 : 0;
          currentValue = hasReflection + hasMoment + hasTrip + hasSkill;
          break;
        case 'varietyAdvanced':
          // Check if user has at least 5 of each: reflection, moment, trip
          const minReflections = Math.min(stats.totalReflections || 0, 5);
          const minMoments = Math.min(stats.totalMoments || 0, 5);
          const minTrips = Math.min(stats.totalTrips || 0, 5);
          currentValue = minReflections + minMoments + minTrips;
          break;
        case 'totalXP':
          currentValue = currentCalculatedXP;
          break;
        case 'singleTripDistance':
          currentValue = stats.longestTrip || 0;
          break;
        case 'singleTripElevation':
          currentValue = stats.highestElevationTrip || 0;
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
        case 'dailyStreak': currentValue = stats?.currentStreak || 0; break;
        case 'expeditions': currentValue = stats?.totalExpeditions || 0; break;
        case 'environment': currentValue = stats?.totalEnvironmentActions || 0; break;
        case 'skills': currentValue = stats?.totalSkills || 0; break;
        case 'combined': currentValue = (stats?.totalActivities || 0) + (stats?.totalSkills || 0); break;
        case 'level': currentValue = currentCalculatedLevel; break;
        case 'trips': currentValue = stats?.totalTrips || 0; break;
        case 'tripDistance': currentValue = stats?.totalTripDistance || 0; break;
        case 'tripElevation': currentValue = stats?.totalTripElevation || 0; break;
        case 'motivationTrips': currentValue = stats?.motivationTrips || 0; break;
        case 'weatherRain': currentValue = stats?.rainTrips || 0; break;
        case 'weatherSnow': currentValue = stats?.snowTrips || 0; break;
        case 'hardTrips': currentValue = stats?.hardTrips || 0; break;
        case 'expertTrips': currentValue = stats?.expertTrips || 0; break;
        case 'variety':
          const hasRef = (stats?.totalReflections || 0) >= 1 ? 1 : 0;
          const hasMom = (stats?.totalMoments || 0) >= 1 ? 1 : 0;
          const hasTr = (stats?.totalTrips || 0) >= 1 ? 1 : 0;
          const hasSk = (stats?.totalSkills || 0) >= 1 ? 1 : 0;
          currentValue = hasRef + hasMom + hasTr + hasSk;
          break;
        case 'varietyAdvanced':
          currentValue = Math.min(stats?.totalReflections || 0, 5) + 
                         Math.min(stats?.totalMoments || 0, 5) + 
                         Math.min(stats?.totalTrips || 0, 5);
          break;
        case 'totalXP': currentValue = currentCalculatedXP; break;
        case 'singleTripDistance': currentValue = stats?.longestTrip || 0; break;
        case 'singleTripElevation': currentValue = stats?.highestElevationTrip || 0; break;
        case 'trips': currentValue = stats?.totalTrips || 0; break;
        case 'tripDistance': currentValue = stats?.totalTripDistance || 0; break;
        case 'tripElevation': currentValue = stats?.totalTripElevation || 0; break;
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
    lastXPUpdateRef.current = null;
    // Then load from storage (which should be empty after reset)
    await loadGamificationData();
    // Recalculate based on current stats (which should be 0 after reset)
    if (stats) {
      await calculateXP();
      await checkAchievements();
    }
    setLoading(false);
  };

  // Sync progress to backend (debounced)
  const syncTimeoutRef = useRef(null);
  
  const syncToBackend = useCallback(async (xp) => {
    try {
      const token = await AsyncStorage.getItem('@medvandrerne_auth_token');
      if (!token) {
        console.log('No auth token, skipping backend sync');
        return;
      }

      const currentLevel = getLevel(xp);
      const levelName = getLevelName(currentLevel);

      console.log('Syncing progress to backend:', { totalPoints: xp, level: currentLevel });
      
      const response = await fetch(`${API_BASE_URL}/users/sync-progress.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          totalPoints: xp,
          completedActivities: stats?.totalCompletedActivities || 0,
          completedExpeditions: stats?.totalExpeditions || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Progress synced to backend successfully');
          await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
        }
      } else {
        console.log('Backend sync failed:', response.status);
      }
    } catch (error) {
      console.error('Error syncing to backend:', error);
    }
  }, [stats]);

  // Schedule backend sync when XP changes
  useEffect(() => {
    if (totalXP > 0 && !loading) {
      // Clear existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      // Schedule new sync
      syncTimeoutRef.current = setTimeout(() => {
        syncToBackend(totalXP);
      }, SYNC_DEBOUNCE_MS);
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [totalXP, loading, syncToBackend]);

  // Load progress from backend (called after login)
  const loadFromBackend = useCallback(async (userData) => {
    if (!userData) return false;
    
    console.log('Loading progress from backend user data:', {
      totalPoints: userData.totalPoints,
      level: userData.level,
    });
    
    // If backend has progress data, use it if it's higher than local
    const backendXP = userData.totalPoints || 0;
    const localXP = totalXP || 0;
    
    // Use the higher value (in case local has more recent data)
    if (backendXP > localXP) {
      console.log('Backend has more XP, updating local:', backendXP);
      setTotalXP(backendXP);
      await saveGamificationData({ unlockedAchievements, totalXP: backendXP });
      return true;
    } else if (localXP > backendXP) {
      console.log('Local has more XP, syncing to backend:', localXP);
      // Sync local to backend
      await syncToBackend(localXP);
    }
    
    return false;
  }, [totalXP, unlockedAchievements, syncToBackend]);

  // Force immediate sync to backend
  const forceSyncToBackend = useCallback(async () => {
    if (totalXP > 0) {
      await syncToBackend(totalXP);
    }
  }, [totalXP, syncToBackend]);

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
    loadFromBackend,
    forceSyncToBackend,
  };
};


