import { useState, useEffect } from 'react';
import { 
  Challenge, 
  ChallengeStats,
  subscribeToChallenges,
  calculateChallengeStats,
  calculateDaysLeft,
  calculateLead
} from '../services/challengesService';

// Hook for fetching all challenges with real-time updates
export const useChallenges = (userId: string | null) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setChallenges([]);
      return;
    }

    setLoading(true);
    
    try {
      const unsubscribe = subscribeToChallenges(
        userId, 
        (updatedChallenges) => {
          setChallenges(updatedChallenges);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching challenges:', err);
          setError(err.message || 'Failed to load challenges');
          setLoading(false);
          setChallenges([]);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error subscribing to challenges:', err);
      setError(err.message || 'Failed to load challenges');
      setLoading(false);
    }
  }, [userId]);

  return { challenges, loading, error };
};

// Hook for challenge statistics
export const useChallengeStats = (challenges: Challenge[]): ChallengeStats => {
  const [stats, setStats] = useState<ChallengeStats>({
    activeCount: 0,
    victoriesCount: 0,
    defeatsCount: 0,
    uniqueOpponents: 0,
    totalChallenges: 0
  });

  useEffect(() => {
    const newStats = calculateChallengeStats(challenges);
    setStats(newStats);
  }, [challenges]);

  return stats;
};

// Hook for individual challenge with computed values
export const useChallenge = (challenge: Challenge) => {
  const daysLeft = calculateDaysLeft(challenge.endDate);
  const lead = calculateLead(challenge.myProgress, challenge.opponentProgress);
  const myPercentage = Math.round((challenge.myProgress / challenge.duration) * 100);
  const opponentPercentage = Math.round((challenge.opponentProgress / challenge.duration) * 100);
  
  const competitionStatus = 
    lead > 0 
      ? { text: `🎯 You're leading by ${lead} day${lead > 1 ? 's' : ''}!`, color: 'text-success' }
      : lead < 0 
      ? { text: `⚡ ${challenge.opponentName} is ahead by ${Math.abs(lead)} day${Math.abs(lead) > 1 ? 's' : ''}`, color: 'text-warning' }
      : { text: '🤝 Tied! Keep pushing!', color: 'text-primary' };

  return {
    daysLeft,
    lead,
    myPercentage,
    opponentPercentage,
    competitionStatus,
    isComplete: daysLeft === 0
  };
};
