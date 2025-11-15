// XP and Leveling System
// Centralized XP management for consistency across the app

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number; // Percentage towards next level
  totalXP: number;
}

// XP required for each level (exponential growth)
// Level 1 requires 1000 XP, then exponentially increases
// Formula: baseXP * (multiplier ^ (level - 1))
const BASE_XP = 1000;
const MULTIPLIER = 1.6; // Exponential multiplier for difficulty

export const getXPForLevel = (level: number): number => {
  if (level <= 1) return BASE_XP;
  // Level 1: 1000, Level 2: 1600, Level 3: 2560, Level 4: 4096, etc.
  return Math.floor(BASE_XP * Math.pow(MULTIPLIER, level - 1));
};

// Calculate cumulative XP needed to reach a level
export const getCumulativeXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  let cumulative = 0;
  for (let i = 1; i < level; i++) {
    cumulative += getXPForLevel(i);
  }
  return cumulative;
};

// Calculate level from total XP
export const calculateLevel = (totalXP: number): number => {
  if (totalXP < 0) return 1;
  
  let level = 1;
  let cumulativeXP = 0;
  
  // Max level is 9
  while (level < 9 && cumulativeXP + getXPForLevel(level) <= totalXP) {
    cumulativeXP += getXPForLevel(level);
    level++;
  }
  
  return Math.min(level, 9); // Cap at level 9
};

// Get detailed level information
export const getLevelInfo = (totalXP: number): LevelInfo => {
  const level = calculateLevel(totalXP);
  const xpForCurrentLevel = getCumulativeXPForLevel(level);
  
  // If at max level, show progress within the level
  if (level >= 9) {
    const xpForLevel9 = getXPForLevel(9);
    const currentXP = totalXP - xpForCurrentLevel;
    return {
      level: 9,
      currentXP: Math.min(currentXP, xpForLevel9),
      xpForNextLevel: xpForLevel9,
      xpProgress: 100, // Max level reached
      totalXP
    };
  }
  
  const xpForNextLevel = getXPForLevel(level);
  const currentXP = totalXP - xpForCurrentLevel;
  const xpProgress = Math.min((currentXP / xpForNextLevel) * 100, 100);
  
  return {
    level,
    currentXP,
    xpForNextLevel,
    xpProgress,
    totalXP
  };
};

// XP rewards by difficulty
export const XP_REWARDS = {
  HABIT_COMPLETION: {
    easy: 10,
    medium: 20,
    hard: 30,
  },
  STREAK: {
    3: 50,
    7: 100,
    14: 200,
    30: 500,
    60: 1000,
    90: 2000,
  },
  CHALLENGE: {
    WIN: 200,
    PARTICIPATION: 50,
  },
  ACHIEVEMENT: 100,
  DAILY_LOGIN: 5,
};

// Minimum XP required to stake in challenges
export const getMinStakeForLevel = (level: number): number => {
  return Math.max(50, level * 25);
};

// Maximum XP allowed to stake
export const getMaxStakeForLevel = (level: number, totalXP: number): number => {
  // Can't stake more than 25% of total XP or 500 XP, whichever is lower
  return Math.min(Math.floor(totalXP * 0.25), 500);
};

// Get recommended stake amounts
export const getRecommendedStakes = (level: number, totalXP: number): number[] => {
  const min = getMinStakeForLevel(level);
  const max = getMaxStakeForLevel(level, totalXP);

  // Desired behaviour now: return three progressive options based on the user's
  // total XP: 50%, 75%, and 100% (rounded). These values adapt to the user's
  // respective XP and provide progressive choices (low, mid, high).
  // We compute fractional values from totalXP, clamp them to at least 1,
  // deduplicate and sort. This prioritizes user-relative stakes over strict
  // level-based min/max so users with small balances see meaningful options.
  const fractions = [0.5, 0.75, 1.0];

  const candidates = fractions
    .map((f) => Math.max(1, Math.ceil(totalXP * f)))
    .map((v) => Math.max(1, Math.min(v, Math.max(1, Math.floor(totalXP)))));

  return Array.from(new Set(candidates)).sort((a, b) => a - b);
};

// Check if user can afford stake
export const canAffordStake = (totalXP: number, stake: number): boolean => {
  return totalXP >= stake && stake > 0;
};

// Level titles
export const getLevelTitle = (level: number): string => {
  if (level < 5) return 'Beginner';
  if (level < 10) return 'Novice';
  if (level < 15) return 'Apprentice';
  if (level < 20) return 'Adept';
  if (level < 30) return 'Expert';
  if (level < 40) return 'Master';
  if (level < 50) return 'Grand Master';
  return 'Legend';
};

// Level perks/unlocks
export const getLevelPerks = (level: number): string[] => {
  const perks: string[] = [];
  
  if (level >= 5) perks.push('Unlock Medium Difficulty Habits');
  if (level >= 10) perks.push('Unlock Hard Difficulty Habits');
  if (level >= 10) perks.push('Challenge Friends');
  if (level >= 15) perks.push('Create Custom Challenges');
  if (level >= 20) perks.push('Join Squads');
  if (level >= 25) perks.push('Create Squad Challenges');
  if (level >= 30) perks.push('Unlock Legendary Achievements');
  
  return perks;
};
