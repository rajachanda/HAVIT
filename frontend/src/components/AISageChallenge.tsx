import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, Zap, Crown, Flame, Check, X, Clock, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createAISageChallenge } from '../services/challengesService';
import { getLevelInfo } from '../lib/xpSystem';
import { collection, query, where, getDocs, onSnapshot, doc, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '../hooks/use-toast';

interface Habit {
  id: string;
  name: string;
  category: string;
}

interface UserData {
  totalXP: number;
  username: string;
  avatarUrl?: string;
  persona?: {
    chronotype?: string;
    motivationType?: string;
  };
}

interface AISageChallenge {
  id: string;
  userId: string;
  habitId: string;
  habitName: string;
  habitCategory: string;
  duration: number;
  stakeXP: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'pending' | 'active' | 'rejected';
  message: string;
  createdAt: Timestamp;
}

const difficultyConfig = {
  easy: {
    icon: Zap,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
    title: 'Apprentice',
    description: '60% completion',
  },
  medium: {
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    title: 'Mentor',
    description: '75% completion',
  },
  hard: {
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
    title: 'Master',
    description: '85% completion',
  },
  legendary: {
    icon: Crown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    title: 'Legend',
    description: '95% completion',
  }
};

// Generate AI Sage challenges based on user persona
const generateAISageChallenges = async (userId: string, userData: UserData, habits: Habit[]) => {
  if (habits.length === 0) return;

  const challengesRef = collection(db, 'aiSageChallenges');
  const q = query(challengesRef, where('userId', '==', userId), where('status', '==', 'pending'));
  const existing = await getDocs(q);
  
  if (existing.empty) {
    const levelInfo = getLevelInfo(userData.totalXP);
    const selectedHabits = habits.slice(0, Math.min(3, habits.length));
    
    for (const habit of selectedHabits) {
      let difficulty: 'easy' | 'medium' | 'hard' | 'legendary' = 'medium';
      if (levelInfo.level < 3) difficulty = 'easy';
      else if (levelInfo.level < 6) difficulty = 'medium';
      else if (levelInfo.level < 8) difficulty = 'hard';
      else difficulty = 'legendary';
      
      const baseStake = Math.max(50, levelInfo.level * 25);
      const multipliers = { easy: 1, medium: 1.5, hard: 2, legendary: 3 };
      const stakeXP = Math.floor(baseStake * multipliers[difficulty]);
      
      const motivationType = userData.persona?.motivationType || 'achievement';
      let messagePrefix = '';
      if (motivationType === 'achievement') {
        messagePrefix = `🏆 ${userData.username}, prove your mastery! `;
      } else if (motivationType === 'social') {
        messagePrefix = `🤝 ${userData.username}, join this journey! `;
      } else {
        messagePrefix = `✨ ${userData.username}, let's grow together! `;
      }
      
      const messages = {
        easy: `${messagePrefix}Begin your ${habit.name} practice with a 7-day journey.`,
        medium: `${messagePrefix}Ready for a 14-day ${habit.name} challenge?`,
        hard: `${messagePrefix}Master ${habit.name} for 21 days!`,
        legendary: `${messagePrefix}Conquer the 30-day ${habit.name} challenge!`
      };
      
      const duration = { easy: 7, medium: 14, hard: 21, legendary: 30 }[difficulty];
      
      await addDoc(challengesRef, {
        userId,
        habitId: habit.id,
        habitName: habit.name,
        habitCategory: habit.category,
        duration,
        stakeXP,
        difficulty,
        status: 'pending',
        message: messages[difficulty],
        createdAt: Timestamp.now(),
      });
    }
  }
};

export const AISageChallengeList = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<AISageChallenge[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
    });
    
    const fetchHabits = async () => {
      const habitsRef = collection(db, 'habits');
      const q = query(habitsRef, where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const habitsData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        name: docSnap.data().name,
        category: docSnap.data().category
      }));
      setHabits(habitsData);
    };
    
    fetchHabits();
    return () => unsubUser();
  }, [currentUser?.uid]);
  
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const challengesRef = collection(db, 'aiSageChallenges');
    const q = query(challengesRef, where('userId', '==', currentUser.uid), where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challengesData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as AISageChallenge[];
      
      setChallenges(challengesData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid]);
  
  useEffect(() => {
    if (userData && habits.length > 0 && currentUser?.uid) {
      generateAISageChallenges(currentUser.uid, userData, habits);
    }
  }, [userData, habits, currentUser?.uid]);
  
  const handleAccept = async (challenge: AISageChallenge) => {
    if (!currentUser?.uid || !userData) return;
    
    if (userData.totalXP < challenge.stakeXP) {
      toast({
        title: 'Insufficient XP',
        description: `You need ${challenge.stakeXP} XP to accept this challenge.`,
        variant: 'destructive'
      });
      return;
    }
    
    setAccepting(challenge.id);
    
    try {
      await createAISageChallenge(
        currentUser.uid,
        userData.username,
        userData.avatarUrl || '',
        challenge.habitId,
        challenge.habitName,
        challenge.habitCategory,
        challenge.duration,
        challenge.stakeXP,
        challenge.difficulty
      );
      
      const challengeRef = doc(db, 'aiSageChallenges', challenge.id);
      await updateDoc(challengeRef, { status: 'active' });
      
      toast({
        title: 'Challenge Accepted! ⚔️',
        description: `${challenge.stakeXP} XP staked. Win to earn ${challenge.stakeXP * 2} XP!`,
      });
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept challenge',
        variant: 'destructive'
      });
    } finally {
      setAccepting(null);
    }
  };
  
  const handleReject = async (challengeId: string) => {
    try {
      const challengeRef = doc(db, 'aiSageChallenges', challengeId);
      await updateDoc(challengeRef, { status: 'rejected' });
      
      toast({
        title: 'Challenge Declined',
        description: 'The AI Sage respects your decision.',
      });
    } catch (error) {
      console.error('Error rejecting challenge:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">The AI Sage is preparing challenges...</p>
      </div>
    );
  }
  
  if (habits.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-12 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">Create habits to receive AI Sage challenges!</p>
        </CardContent>
      </Card>
    );
  }
  
  if (challenges.length === 0) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-12 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
          <h3 className="text-xl font-semibold mb-2">No Pending Challenges</h3>
          <p className="text-muted-foreground">
            The AI Sage will send personalized challenges soon!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        <h3 className="text-xl font-semibold">AI Sage Challenges</h3>
        <Badge variant="outline" className="bg-primary/10">{challenges.length} Pending</Badge>
      </div>
      
      {challenges.map((challenge) => {
        const config = difficultyConfig[challenge.difficulty];
        const Icon = config.icon;
        
        return (
          <Card key={challenge.id} className={`border-2 ${config.borderColor} ${config.bgColor} hover:shadow-lg transition-all`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-6 w-6 ${config.color}`} />
                  <div>
                    <CardTitle className="text-lg">{challenge.habitName}</CardTitle>
                    <CardDescription>{challenge.habitCategory}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={`${config.color} ${config.bgColor}`}>
                  {config.title}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/50 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-sm italic">{challenge.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xl font-bold">{challenge.duration}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-xl font-bold">{challenge.stakeXP}</p>
                  <p className="text-xs text-muted-foreground">XP at stake</p>
                </div>
              </div>
              
              <div className="text-center text-xs text-muted-foreground">
                {config.description} • Win 2x stake ({challenge.stakeXP * 2} XP)
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAccept(challenge)}
                  disabled={accepting === challenge.id || (userData && userData.totalXP < challenge.stakeXP)}
                  className="flex-1"
                  size="lg"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {accepting === challenge.id ? 'Accepting...' : 'Accept Challenge'}
                </Button>
                <Button onClick={() => handleReject(challenge.id)} disabled={accepting === challenge.id} variant="outline" size="lg">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {userData && userData.totalXP < challenge.stakeXP && (
                <p className="text-sm text-destructive text-center">
                  Need {challenge.stakeXP - userData.totalXP} more XP
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
