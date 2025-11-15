import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  getUser,
  getHabits,
  getPersona,
  getUserChallenges,
  getLeaderboard,
  UserData,
  Habit,
  Challenge,
  LeaderboardEntry,
} from '@/lib/api';

// ============================================================================
// USER HOOK (Real-time)
// ============================================================================

export function useUser(userId: string | null): UseQueryResult<UserData | null, Error> {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const result = await getUser(userId);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch user');
    },
    enabled: !!userId,
    // Refetch on window focus to get latest XP
    refetchOnWindowFocus: true,
    // Refetch every 5 seconds to catch XP updates
    refetchInterval: 5000,
  });
}

// Real-time user data hook for XP updates
export function useUserRealtime(userId: string | null) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setLoading(false);
      return;
    }

    console.log('[useUserRealtime] Setting up listener for user:', userId);
    setLoading(true);
    setError(null);

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('[useUserRealtime] User data updated:', {
            totalXP: data.totalXP,
            level: data.level,
            timestamp: new Date().toISOString()
          });
          setUserData({ ...data, id: docSnap.id } as unknown as UserData);
        } else {
          console.warn('[useUserRealtime] User document does not exist:', userId);
          setUserData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useUserRealtime] Error fetching user data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('[useUserRealtime] Cleaning up listener for user:', userId);
      unsubscribe();
    };
  }, [userId]);

  return { userData, loading, error };
}

// ============================================================================
// HABITS HOOK (Real-time)
// ============================================================================

export function useHabits(userId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = getHabits(userId, (updatedHabits) => {
      setHabits(updatedHabits);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { habits, loading, error };
}

// ============================================================================
// PERSONA HOOK
// ============================================================================

export function usePersona(userId: string | null): UseQueryResult<UserData['persona'] | null, Error> {
  return useQuery({
    queryKey: ['persona', userId],
    queryFn: async () => {
      if (!userId) return null;
      const result = await getPersona(userId);
      if (result.success) {
        return result.data || null;
      }
      throw new Error(result.error || 'Failed to fetch persona');
    },
    enabled: !!userId,
  });
}

// ============================================================================
// CHALLENGES HOOK (Real-time)
// ============================================================================

export function useChallenges(userId: string | null) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = getUserChallenges(userId, (updatedChallenges) => {
      setChallenges(updatedChallenges);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { challenges, loading, error };
}

// ============================================================================
// LEADERBOARD HOOK
// ============================================================================

export function useLeaderboard(
  period: 'daily' | 'weekly' | 'monthly'
): UseQueryResult<LeaderboardEntry[], Error> {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const result = await getLeaderboard(period);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch leaderboard');
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
