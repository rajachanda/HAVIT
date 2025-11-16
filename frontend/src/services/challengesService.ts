import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { awardXP, XP_REWARDS } from './xpService';

// Types
export interface Challenge {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  habitId: string;
  habitName: string;
  habitCategory: string;
  status: 'pending' | 'active' | 'victory' | 'defeated' | 'tied' | 'rejected';
  duration: number; // Total days (7, 14, 30)
  myProgress: number; // Completed days
  opponentProgress: number; // Opponent's completed days
  stakeXP: number; // XP wagered on this challenge
  challengeType: 'pvp' | 'ai-sage'; // Player vs Player or AI Sage
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'legendary'; // For AI challenges
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChallengeStats {
  activeCount: number;
  victoriesCount: number;
  defeatsCount: number;
  uniqueOpponents: number;
  totalChallenges: number;
}

// Calculate days left in challenge
export const calculateDaysLeft = (endDate: Timestamp): number => {
  const now = new Date();
  const end = endDate.toDate();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Calculate lead difference
export const calculateLead = (myProgress: number, opponentProgress: number): number => {
  return myProgress - opponentProgress;
};

// Get all challenges for a user
export const getChallenges = async (userId: string): Promise<Challenge[]> => {
  const challengesRef = collection(db, 'challenges');
  const q = query(
    challengesRef,
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const challenges = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Challenge[];
  
  // Sort by createdAt on client side to avoid needing a composite index
  return challenges.sort((a, b) => 
    b.createdAt.toMillis() - a.createdAt.toMillis()
  );
};

// Subscribe to challenges in real-time
export const subscribeToChallenges = (
  userId: string,
  callback: (challenges: Challenge[]) => void,
  onError?: (error: Error) => void
) => {
  const challengesRef = collection(db, 'challenges');
  const q = query(
    challengesRef,
    where('userId', '==', userId)
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const challenges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      
      // Sort by createdAt on client side to avoid needing a composite index
      const sortedChallenges = challenges.sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      
      callback(sortedChallenges);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  );
};

// Create a new challenge
export const createChallenge = async (
  userId: string,
  userName: string,
  userAvatar: string,
  opponentId: string,
  opponentName: string,
  opponentAvatar: string,
  habitId: string,
  habitName: string,
  habitCategory: string,
  duration: number,
  stakeXP: number
): Promise<string> => {
  const now = Timestamp.now();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + duration);

  const challengeData = {
    userId,
    userName,
    userAvatar,
    opponentId,
    opponentName,
    opponentAvatar,
    habitId,
    habitName,
    habitCategory,
    status: 'pending',
    duration,
    myProgress: 0,
    opponentProgress: 0,
    stakeXP,
    challengeType: 'pvp' as const,
    startDate: now,
    endDate: Timestamp.fromDate(endDate),
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'challenges'), challengeData);
  
  // Create reciprocal challenge for opponent
  const opponentChallengeData = {
    userId: opponentId,
    userName: opponentName,
    userAvatar: opponentAvatar,
    opponentId: userId,
    opponentName: userName,
    opponentAvatar: userAvatar,
    habitId,
    habitName,
    habitCategory,
    status: 'pending',
    duration,
    myProgress: 0,
    opponentProgress: 0,
    stakeXP,
    challengeType: 'pvp' as const,
    startDate: now,
    endDate: Timestamp.fromDate(endDate),
    createdAt: now,
    updatedAt: now,
    linkedChallengeId: docRef.id, // Link to original challenge
  };
  
  await addDoc(collection(db, 'challenges'), opponentChallengeData);
  
  // Award XP for creating a challenge
  await awardXP(userId, XP_REWARDS.CREATE_CHALLENGE, 'create_challenge');
  
  return docRef.id;
};

// Update challenge progress
export const updateChallengeProgress = async (
  challengeId: string,
  field: 'myProgress' | 'opponentProgress',
  increment: number
): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  await updateDoc(challengeRef, {
    [field]: increment,
    updatedAt: Timestamp.now()
  });
};

// Update challenge status
export const updateChallengeStatus = async (
  challengeId: string,
  status: 'active' | 'victory' | 'defeated' | 'tied'
): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  await updateDoc(challengeRef, {
    status,
    updatedAt: Timestamp.now()
  });
};

// Delete a challenge
export const deleteChallenge = async (challengeId: string): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  await deleteDoc(challengeRef);
};

// Accept a challenge
export const acceptChallenge = async (
  challengeId: string,
  userId: string
): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);
  
  if (!challengeSnap.exists()) {
    throw new Error('Challenge not found');
  }
  
  const challengeData = challengeSnap.data();
  
  // Update both user's and opponent's challenge records to active
  await updateDoc(challengeRef, {
    status: 'active',
    startDate: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  // Find and update linked challenge
  if (challengeData.linkedChallengeId) {
    const linkedRef = doc(db, 'challenges', challengeData.linkedChallengeId);
    await updateDoc(linkedRef, {
      status: 'active',
      startDate: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }
  
  // Deduct stake XP from both users
  const userRef = doc(db, 'users', userId);
  const opponentRef = doc(db, 'users', challengeData.opponentId);
  
  await updateDoc(userRef, {
    totalXP: increment(-challengeData.stakeXP)
  });
  
  await updateDoc(opponentRef, {
    totalXP: increment(-challengeData.stakeXP)
  });
  
  // Award XP for accepting/joining a challenge
  await awardXP(userId, XP_REWARDS.JOIN_CHALLENGE, 'accept_challenge');
};

// Create an AI Sage challenge
export const createAISageChallenge = async (
  userId: string,
  userName: string,
  userAvatar: string,
  habitId: string,
  habitName: string,
  habitCategory: string,
  duration: number,
  stakeXP: number,
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary' = 'medium'
): Promise<string> => {
  const now = Timestamp.now();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + duration);

  // AI opponent progress is determined by difficulty
  // Easy: 60% completion, Medium: 75%, Hard: 85%, Legendary: 95%
  const difficultySettings = {
    easy: { completionRate: 0.6, avatar: '🤖', name: 'Sage Apprentice' },
    medium: { completionRate: 0.75, avatar: '🧙‍♂️', name: 'Sage Mentor' },
    hard: { completionRate: 0.85, avatar: '🧙‍♀️', name: 'Sage Master' },
    legendary: { completionRate: 0.95, avatar: '✨', name: 'Sage Legend' }
  };

  const settings = difficultySettings[difficulty];

  const challengeData = {
    userId,
    userName,
    userAvatar,
    opponentId: 'ai-sage',
    opponentName: settings.name,
    opponentAvatar: settings.avatar,
    habitId,
    habitName,
    habitCategory,
    status: 'active', // AI challenges auto-start
    duration,
    myProgress: 0,
    opponentProgress: 0, // Will be simulated based on difficulty
    stakeXP,
    challengeType: 'ai-sage' as const,
    aiDifficulty: difficulty,
    startDate: now,
    endDate: Timestamp.fromDate(endDate),
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'challenges'), challengeData);
  
  // Deduct stake XP from user
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    totalXP: increment(-stakeXP)
  });
  
  return docRef.id;
};

// Update AI opponent progress (called periodically)
export const updateAIProgress = async (challengeId: string): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);
  
  if (!challengeSnap.exists()) return;
  
  const challenge = challengeSnap.data() as Challenge;
  
  if (challenge.challengeType !== 'ai-sage' || !challenge.aiDifficulty) return;
  
  const difficultyRates = {
    easy: 0.6,
    medium: 0.75,
    hard: 0.85,
    legendary: 0.95
  };
  
  const targetCompletionRate = difficultyRates[challenge.aiDifficulty];
  const daysElapsed = Math.floor((Date.now() - challenge.startDate.toMillis()) / (1000 * 60 * 60 * 24));
  const targetProgress = Math.floor(daysElapsed * targetCompletionRate);
  
  // Add some randomness (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2;
  const aiProgress = Math.min(
    Math.floor(targetProgress * randomFactor),
    challenge.duration
  );
  
  await updateDoc(challengeRef, {
    opponentProgress: aiProgress,
    updatedAt: Timestamp.now()
  });
};

// Reject a challenge
export const rejectChallenge = async (challengeId: string): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);
  
  if (!challengeSnap.exists()) {
    throw new Error('Challenge not found');
  }
  
  const challengeData = challengeSnap.data();
  
  // Update status to rejected
  await updateDoc(challengeRef, {
    status: 'rejected',
    updatedAt: Timestamp.now()
  });
  
  // Update linked challenge
  if (challengeData.linkedChallengeId) {
    const linkedRef = doc(db, 'challenges', challengeData.linkedChallengeId);
    await updateDoc(linkedRef, {
      status: 'rejected',
      updatedAt: Timestamp.now()
    });
  }
};

// Complete a challenge and award XP
export const completeChallenge = async (
  challengeId: string,
  winnerId: string,
  loserId: string,
  stakeXP: number
): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  
  // Award winner 2x stake (their stake back + opponent's stake)
  const winnerRef = doc(db, 'users', winnerId);
  await updateDoc(winnerRef, {
    totalXP: increment(stakeXP * 2)
  });
  
  // Loser loses their stake (already deducted when accepting)
  // No need to update loser's XP
  
  await updateDoc(challengeRef, {
    updatedAt: Timestamp.now()
  });
};

// Calculate challenge stats
export const calculateChallengeStats = (challenges: Challenge[]): ChallengeStats => {
  const activeCount = challenges.filter(c => c.status === 'active').length;
  const victoriesCount = challenges.filter(c => c.status === 'victory').length;
  const defeatsCount = challenges.filter(c => c.status === 'defeated').length;
  const uniqueOpponents = new Set(challenges.map(c => c.opponentId)).size;

  return {
    activeCount,
    victoriesCount,
    defeatsCount,
    uniqueOpponents,
    totalChallenges: challenges.length
  };
};
