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
export const getXPForLevel = (level: number): number => {
  // Formula: baseXP * (level ^ 1.5)
  const baseXP = 100;
  return Math.floor(baseXP * Math.pow(level, 1.5));
};

// Calculate level from total XP
export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded += getXPForLevel(level);
  }
  
  return Math.max(1, level - 1);
};

// Get detailed level information
export const getLevelInfo = (totalXP: number): LevelInfo => {
  const level = calculateLevel(totalXP);
  const xpForCurrentLevel = level === 1 ? 0 : Array.from({ length: level }, (_, i) => getXPForLevel(i + 1)).reduce((a, b) => a + b, 0);
  const xpForNextLevel = getXPForLevel(level + 1);
  const currentXP = totalXP - xpForCurrentLevel;
  const xpProgress = (currentXP / xpForNextLevel) * 100;
  
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
  
  if (max < min) return [];
  
  const stakes = [];
  const increment = Math.floor((max - min) / 3);
  
  stakes.push(min);
  if (increment > 0) {
    stakes.push(min + increment);
    stakes.push(min + increment * 2);
    stakes.push(max);
  }
  
  return stakes.filter((stake, index, self) => self.indexOf(stake) === index).sort((a, b) => a - b);
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
