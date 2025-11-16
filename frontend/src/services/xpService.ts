import { db } from "@/config/firebase";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";

// XP reward values for different actions
export const XP_REWARDS = {
  COMPLETE_HABIT: 10,
  CREATE_POST: 15,
  COMMENT_ON_POST: 5,
  LIKE_POST: 2,
  CREATE_CHALLENGE: 25,
  JOIN_CHALLENGE: 10,
  COMPLETE_CHALLENGE: 50,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 20, // Bonus for maintaining streaks
  PROFILE_COMPLETE: 30,
  INVITE_FRIEND: 20,
};

/**
 * Award XP to a user and update their squad contribution
 */
export const awardXP = async (
  userId: string,
  xpAmount: number,
  action: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("User not found");
      return;
    }

    const userData = userDoc.data();
    const squadId = userData.squadId;

    // Update user's total XP
    await updateDoc(userRef, {
      xp: increment(xpAmount),
      lastXpAction: action,
      lastXpTimestamp: new Date(),
    });

    console.log(`Awarded ${xpAmount} XP to user ${userId} for ${action}`);

    // If user is in a squad, update squad contribution
    if (squadId) {
      await updateSquadContribution(squadId, userId, xpAmount);
    }
  } catch (error) {
    console.error("Error awarding XP:", error);
  }
};

/**
 * Update squad member's contribution and squad's total XP
 */
const updateSquadContribution = async (
  squadId: string,
  userId: string,
  xpAmount: number
): Promise<void> => {
  try {
    // Update squad member's contribution
    const squadMemberRef = doc(db, "squadMembers", squadId, "members", userId);
    await updateDoc(squadMemberRef, {
      contribution: increment(xpAmount),
      updatedAt: new Date(),
    });

    // Update squad's total XP and progress
    const squadRef = doc(db, "squads", squadId);
    await updateDoc(squadRef, {
      totalXP: increment(xpAmount),
      progress: increment(xpAmount),
      updatedAt: new Date(),
    });

    console.log(`Updated squad ${squadId} contribution: +${xpAmount} XP`);
  } catch (error) {
    console.error("Error updating squad contribution:", error);
  }
};

/**
 * Calculate level from XP
 */
export const calculateLevel = (xp: number): number => {
  // Level formula: Level = floor(sqrt(XP / 100))
  // Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Calculate XP needed for next level
 */
export const getXPForNextLevel = (currentLevel: number): number => {
  return (currentLevel * currentLevel) * 100;
};

/**
 * Get XP progress to next level
 */
export const getXPProgress = (currentXP: number): {
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
} => {
  const currentLevel = calculateLevel(currentXP);
  const xpForCurrentLevel = ((currentLevel - 1) * (currentLevel - 1)) * 100;
  const xpForNextLevel = (currentLevel * currentLevel) * 100;
  const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return {
    currentLevel,
    xpForCurrentLevel,
    xpForNextLevel,
    progress: Math.min(progress, 100),
  };
};
