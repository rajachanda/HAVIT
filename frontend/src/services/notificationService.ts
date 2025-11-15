import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Challenge } from './challengesService';

export type NotificationType = 
  | 'challenge_request'
  | 'ai_sage_challenge'
  | 'challenge_accepted'
  | 'challenge_completed'
  | 'streak_milestone'
  | 'level_up'
  | 'achievement';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  link?: string;
  timestamp: Timestamp;
  read: boolean;
  data?: any; // Additional data specific to notification type
}

// Subscribe to all notifications for a user
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
  onError?: (error: Error) => void
) => {
  const notifications: Notification[] = [];
  
  // Subscribe to pending challenges (requests from friends)
  const challengesRef = collection(db, 'challenges');
  const pendingChallengesQuery = query(
    challengesRef,
    where('userId', '==', userId),
    where('status', '==', 'pending'),
    where('challengeType', '==', 'pvp')
  );
  
  const unsubChallenge = onSnapshot(
    pendingChallengesQuery,
    (snapshot) => {
      const challengeNotifs = snapshot.docs.map(doc => {
        const challenge = { id: doc.id, ...doc.data() } as Challenge;
        return {
          id: `challenge-${doc.id}`,
          type: 'challenge_request' as const,
          title: 'New Challenge Request!',
          message: `${challenge.opponentName} challenged you to ${challenge.habitName}`,
          icon: '⚔️',
          link: '/challenges',
          timestamp: challenge.createdAt,
          read: false,
          data: challenge
        };
      });
      
      updateNotifications([...challengeNotifs]);
    },
    (error) => {
      console.error('Challenge notifications error:', error);
      if (onError) onError(error as Error);
    }
  );
  
  // Subscribe to AI Sage challenges
  const aiSageChallengesQuery = query(
    challengesRef,
    where('userId', '==', userId),
    where('challengeType', '==', 'ai-sage'),
    where('status', '==', 'active')
  );
  
  const unsubAISage = onSnapshot(
    aiSageChallengesQuery,
    (snapshot) => {
      const aiNotifs = snapshot.docs
        .map(doc => {
          const challenge = { id: doc.id, ...doc.data() } as Challenge;
          const daysLeft = Math.ceil((challenge.endDate.toMillis() - Date.now()) / (1000 * 60 * 60 * 24));
          
          // Only notify if challenge is ending soon (3 days or less) or if behind
          if (daysLeft <= 3 || challenge.myProgress < challenge.opponentProgress) {
            return {
              id: `ai-sage-${doc.id}`,
              type: 'ai_sage_challenge' as const,
              title: 'AI Sage Challenge Update',
              message: challenge.myProgress < challenge.opponentProgress
                ? `You're behind the ${challenge.opponentName}! Catch up!`
                : `${daysLeft} days left in your challenge!`,
              icon: challenge.opponentAvatar,
              link: '/challenges',
              timestamp: challenge.updatedAt,
              read: false,
              data: challenge
            };
          }
          return null;
        })
        .filter(Boolean) as Notification[];
      
      updateNotifications([...aiNotifs]);
    },
    (error) => {
      console.error('AI Sage notifications error:', error);
      if (onError) onError(error as Error);
    }
  );
  
  function updateNotifications(newNotifs: Notification[]) {
    // Sort by timestamp (newest first)
    const sorted = newNotifs.sort((a, b) => 
      b.timestamp.toMillis() - a.timestamp.toMillis()
    );
    callback(sorted);
  }
  
  // Return unsubscribe function
  return () => {
    unsubChallenge();
    unsubAISage();
  };
};

// Get unread notification count
export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length;
};

// Mark notification as read
export const markAsRead = (notificationId: string): void => {
  // In a real app, you'd update this in Firestore
  // For now, we'll handle this in the component state
  console.log('Marking notification as read:', notificationId);
};

// Get notification icon component based on type
export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    challenge_request: '⚔️',
    ai_sage_challenge: '🧙‍♂️',
    challenge_accepted: '✅',
    challenge_completed: '🏆',
    streak_milestone: '🔥',
    level_up: '⬆️',
    achievement: '🎖️'
  };
  
  return iconMap[type] || '🔔';
};
