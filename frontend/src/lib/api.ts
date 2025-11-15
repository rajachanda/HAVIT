import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// ============================================================================
// TYPES
// ============================================================================

export interface UserData {
  email: string;
  firstName: string;
  lastName?: string;
  username?: string;
  age?: number;
  gender?: string;
  location?: string;
  language?: string;
  avatar?: string;
  chronotype: string;
  motivationType: string;
  dailyTimeAvailable: number;
  peakEnergyTime: string;
  churnRisks: string[];
  persona: {
    personaName: string;
    archetype: string;
    traits: string[];
    coachingStyle: string;
  } | null;
  championArchetype: string;
  championCustomization: Record<string, unknown>;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  onboardingCompleted: boolean;
  needsProfileCompletion?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Habit {
  id?: string;
  userId: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reminderTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  completions: Array<{ date: string; completed: boolean }>;
  createdAt: Date;
}

export interface Message {
  role: 'user' | 'sage';
  text: string;
  timestamp: Date;
}

export interface Conversation {
  userId: string;
  messages: Message[];
  completedAt: Date;
}

export interface Challenge {
  id?: string;
  initiatorId: string;
  opponentId: string;
  habitId: string;
  duration: number;
  status: 'pending' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  initiatorProgress: Record<string, unknown>;
  opponentProgress: Record<string, unknown>;
  winner: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  rank: number;
}

export interface Friendship {
  id?: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export async function createUser(
  userId: string,
  data: UserData
): Promise<ApiResponse> {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...data,
      createdAt: Timestamp.fromDate(data.createdAt),
      updatedAt: Timestamp.fromDate(data.updatedAt),
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    return { success: false, error: errorMessage };
  }
}

export async function getUser(userId: string): Promise<ApiResponse<UserData>> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        data: {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as UserData,
      };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
    return { success: false, error: errorMessage };
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<UserData>
): Promise<ApiResponse> {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// HABIT FUNCTIONS
// ============================================================================

export async function addHabit(
  userId: string,
  habit: Omit<Habit, 'id' | 'userId'>
): Promise<ApiResponse<string>> {
  try {
    const habitRef = doc(collection(db, 'habits'));
    await setDoc(habitRef, {
      ...habit,
      userId,
      createdAt: Timestamp.fromDate(habit.createdAt),
    });
    return { success: true, data: habitRef.id };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add habit';
    return { success: false, error: errorMessage };
  }
}

export function getHabits(
  userId: string,
  callback: (habits: Habit[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'habits'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const habits: Habit[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      habits.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as Habit);
    });
    callback(habits);
  });
}

export async function updateHabit(
  habitId: string,
  updates: Partial<Habit>
): Promise<ApiResponse> {
  try {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, updates);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update habit';
    return { success: false, error: errorMessage };
  }
}

export async function deleteHabit(habitId: string): Promise<ApiResponse> {
  try {
    await deleteDoc(doc(db, 'habits', habitId));
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete habit';
    return { success: false, error: errorMessage };
  }
}

export async function completeHabit(
  habitId: string,
  date: string
): Promise<ApiResponse> {
  try {
    console.log('[completeHabit] Starting habit completion:', { habitId, date });
    
    // Get the habit to find userId and xpReward
    const habitRef = doc(db, 'habits', habitId);
    const habitSnap = await getDoc(habitRef);
    
    if (!habitSnap.exists()) {
      console.error('[completeHabit] Habit not found:', habitId);
      return { success: false, error: 'Habit not found' };
    }
    
    const habitData = habitSnap.data() as Habit;
    console.log('[completeHabit] Habit data:', {
      userId: habitData.userId,
      xpReward: habitData.xpReward,
      name: habitData.name
    });
    
    // Update habit completion
    await updateDoc(habitRef, {
      completions: arrayUnion({ date, completed: true }),
    });
    console.log('[completeHabit] Habit completion updated');
    
    // Award XP to user using Firestore increment for atomic update
    const userRef = doc(db, 'users', habitData.userId);
    const xpToAdd = habitData.xpReward || 50;
    
    await updateDoc(userRef, {
      totalXP: increment(xpToAdd),
    });
    console.log('[completeHabit] User XP updated, added:', xpToAdd);
    
    return { success: true, data: { xpGained: xpToAdd } };
  } catch (error: unknown) {
    console.error('[completeHabit] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete habit';
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// PERSONA FUNCTIONS
// ============================================================================

export async function savePersona(
  userId: string,
  persona: UserData['persona']
): Promise<ApiResponse> {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      persona,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save persona';
    return { success: false, error: errorMessage };
  }
}

export async function getPersona(
  userId: string
): Promise<ApiResponse<UserData['persona']>> {
  try {
    const result = await getUser(userId);
    if (result.success && result.data) {
      return { success: true, data: result.data.persona };
    }
    return { success: false, error: 'Failed to get persona' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get persona';
    return { success: false, error: errorMessage };
  }
}

export async function updatePersona(
  userId: string,
  updates: Partial<NonNullable<UserData['persona']>>
): Promise<ApiResponse> {
  try {
    const userResult = await getUser(userId);
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' };
    }

    const currentPersona = userResult.data.persona || {
      personaName: '',
      archetype: '',
      traits: [],
      coachingStyle: '',
    };

    await updateUser(userId, {
      persona: { ...currentPersona, ...updates },
    });

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update persona';
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// CONVERSATION FUNCTIONS
// ============================================================================

export async function saveConversation(
  userId: string,
  messages: Message[]
): Promise<ApiResponse> {
  try {
    const conversationRef = doc(collection(db, 'conversationHistory'));
    await setDoc(conversationRef, {
      userId,
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      })),
      completedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save conversation';
    return { success: false, error: errorMessage };
  }
}

export async function getConversation(
  userId: string
): Promise<ApiResponse<Conversation>> {
  try {
    const q = query(
      collection(db, 'conversationHistory'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: false, error: 'No conversation found' };
    }

    const data = querySnapshot.docs[0].data();
    return {
      success: true,
      data: {
        userId: data.userId,
        messages: data.messages.map((msg: { role: string; text: string; timestamp: { toDate: () => Date } }) => ({
          ...msg,
          timestamp: msg.timestamp.toDate(),
        })),
        completedAt: data.completedAt.toDate(),
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get conversation';
    return { success: false, error: errorMessage };
  }
}

export async function addMessage(
  userId: string,
  message: Message
): Promise<ApiResponse> {
  try {
    const conversationResult = await getConversation(userId);
    
    if (conversationResult.success && conversationResult.data) {
      // Update existing conversation
      const q = query(
        collection(db, 'conversationHistory'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const currentMessages = conversationResult.data.messages;
        
        await updateDoc(docRef, {
          messages: [
            ...currentMessages.map((msg) => ({
              ...msg,
              timestamp: Timestamp.fromDate(msg.timestamp),
            })),
            {
              ...message,
              timestamp: Timestamp.fromDate(message.timestamp),
            },
          ],
        });
      }
    } else {
      // Create new conversation
      await saveConversation(userId, [message]);
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add message';
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// CHALLENGE FUNCTIONS
// ============================================================================

export async function createChallenge(
  challenge: Omit<Challenge, 'id'>
): Promise<ApiResponse<string>> {
  try {
    const challengeRef = doc(collection(db, 'challenges'));
    await setDoc(challengeRef, {
      ...challenge,
      startDate: Timestamp.fromDate(challenge.startDate),
      endDate: Timestamp.fromDate(challenge.endDate),
    });
    return { success: true, data: challengeRef.id };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create challenge';
    return { success: false, error: errorMessage };
  }
}

export function getChallenge(
  challengeId: string,
  callback: (challenge: Challenge | null) => void
): Unsubscribe {
  const docRef = doc(db, 'challenges', challengeId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
      } as Challenge);
    } else {
      callback(null);
    }
  });
}

export async function updateChallenge(
  challengeId: string,
  updates: Partial<Challenge>
): Promise<ApiResponse> {
  try {
    const docRef = doc(db, 'challenges', challengeId);
    const updateData: Record<string, unknown> = { ...updates };
    
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }
    
    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update challenge';
    return { success: false, error: errorMessage };
  }
}

export function getUserChallenges(
  userId: string,
  callback: (challenges: Challenge[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'challenges'),
    where('initiatorId', '==', userId)
  );

  return onSnapshot(q, (querySnapshot) => {
    const challenges: Challenge[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      challenges.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
      } as Challenge);
    });
    callback(challenges);
  });
}

// ============================================================================
// LEADERBOARD FUNCTIONS
// ============================================================================

export async function getLeaderboard(
  period: 'daily' | 'weekly' | 'monthly'
): Promise<ApiResponse<LeaderboardEntry[]>> {
  try {
    const q = query(
      collection(db, 'leaderboard', period, 'users'),
      orderBy('totalXP', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const leaderboard: LeaderboardEntry[] = [];
    
    let index = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        userId: doc.id,
        username: data.username,
        level: data.level,
        totalXP: data.totalXP,
        currentStreak: data.currentStreak,
        rank: index + 1,
      });
      index++;
    });

    return { success: true, data: leaderboard };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get leaderboard';
    return { success: false, error: errorMessage };
  }
}

export async function updateLeaderboard(
  userId: string,
  xp: number,
  level: number
): Promise<ApiResponse> {
  try {
    const periods: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];
    
    for (const period of periods) {
      const docRef = doc(db, 'leaderboard', period, 'users', userId);
      await setDoc(
        docRef,
        {
          totalXP: xp,
          level,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update leaderboard';
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// FRIENDS FUNCTIONS
// ============================================================================

export async function addFriend(
  userId: string,
  friendId: string
): Promise<ApiResponse<string>> {
  try {
    const friendshipRef = doc(collection(db, 'friends'));
    await setDoc(friendshipRef, {
      user1Id: userId,
      user2Id: friendId,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return { success: true, data: friendshipRef.id };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add friend';
    return { success: false, error: errorMessage };
  }
}

export async function getFriends(
  userId: string
): Promise<ApiResponse<Friendship[]>> {
  try {
    const q1 = query(
      collection(db, 'friends'),
      where('user1Id', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const q2 = query(
      collection(db, 'friends'),
      where('user2Id', '==', userId),
      where('status', '==', 'accepted')
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const friends: Friendship[] = [];
    
    snapshot1.forEach((doc) => {
      const data = doc.data();
      friends.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as Friendship);
    });
    
    snapshot2.forEach((doc) => {
      const data = doc.data();
      friends.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as Friendship);
    });

    return { success: true, data: friends };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get friends';
    return { success: false, error: errorMessage };
  }
}

export async function acceptFriend(friendshipId: string): Promise<ApiResponse> {
  try {
    const docRef = doc(db, 'friends', friendshipId);
    await updateDoc(docRef, {
      status: 'accepted',
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to accept friend';
    return { success: false, error: errorMessage };
  }
}
