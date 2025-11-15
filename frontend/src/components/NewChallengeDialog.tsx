import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useFirebase';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Target, Clock, Coins, ChevronRight, ChevronLeft } from 'lucide-react';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { createChallenge } from '@/services/challengesService';
import { getRecommendedStakes, canAffordStake, getLevelInfo } from '@/lib/xpSystem';

interface AppUser {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  level: number;
  totalXP: number;
}

interface UserData {
  totalXP: number;
  level: number;
  username: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
}

interface NewChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewChallengeDialog({ open, onOpenChange }: NewChallengeDialogProps) {
  const { currentUser } = useAuth();
  const { habits } = useHabits(currentUser?.uid || null);
  const { toast } = useToast();
  
  const [step, setStep] = useState<'user' | 'habit' | 'duration' | 'stake'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [selectedDuration, setSelectedDuration] = useState<7 | 14 | 21 | 30>(7);
  const [selectedStake, setSelectedStake] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('user');
      setSearchQuery('');
      setUsers([]);
      setSelectedUser(null);
      setSelectedHabit(null);
      setSelectedDuration(7);
      setSelectedStake(0);
    }
  }, [open]);

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '>=', searchQuery.toLowerCase()),
          where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const foundUsers = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as AppUser))
          .filter(user => user.id !== currentUser?.uid);
        
        setUsers(foundUsers);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentUser]);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setCurrentUserData(data);
          
          // Set initial stake to first recommended stake
          if (data.totalXP) {
            const levelInfo = getLevelInfo(data.totalXP);
            const stakes = getRecommendedStakes(levelInfo.level, data.totalXP);
            if (stakes.length > 0) {
              setSelectedStake(stakes[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (open) {
      fetchUserData();
    }
  }, [currentUser, open]);

  const handleCreateChallenge = async () => {
    if (!selectedUser || !selectedHabit || !currentUser || !currentUserData) return;

    setCreating(true);
    try {
      await createChallenge(
        currentUser.uid,
        currentUserData.username,
        currentUserData.avatar || '',
        selectedUser.id,
        selectedUser.username,
        selectedUser.avatar || '',
        selectedHabit.id,
        selectedHabit.name,
        selectedHabit.category,
        selectedDuration,
        selectedStake
      );

      toast({
        title: 'Challenge Sent! ⚔️',
        description: `Challenge sent to ${selectedUser.username} for ${selectedDuration} days. ${selectedStake} XP will be staked when accepted.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create challenge',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const recommendedStakes = currentUserData 
    ? getRecommendedStakes(getLevelInfo(currentUserData.totalXP).level, currentUserData.totalXP)
    : [];

  const canAfford = currentUserData 
    ? canAffordStake(currentUserData.totalXP, selectedStake)
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Create New Challenge
          </DialogTitle>
          <DialogDescription>
            Step {step === 'user' ? '1' : step === 'habit' ? '2' : step === 'duration' ? '3' : '4'} of 4: 
            {step === 'user' && ' Select opponent'}
            {step === 'habit' && ' Choose habit'}
            {step === 'duration' && ' Set duration'}
            {step === 'stake' && ' Set XP stake'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-4">
            {['user', 'habit', 'duration', 'stake'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s ? 'bg-primary text-primary-foreground' : 
                  ['user', 'habit', 'duration', 'stake'].indexOf(step) > idx ? 'bg-success text-success-foreground' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <div className={`w-12 h-0.5 mx-1 ${
                    ['user', 'habit', 'duration', 'stake'].indexOf(step) > idx ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select User */}
          {step === 'user' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search users by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loadingUsers && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              )}

              {!loadingUsers && searchQuery && users.length === 0 && (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No users found</p>
                </Card>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <Card
                    key={user.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition ${
                      selectedUser?.id === user.id ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                      setStep('habit');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.firstName} {user.lastName || ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Level {user.level || 1}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Habit */}
          {step === 'habit' && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('user')}
                className="mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Challenging:</p>
                <p className="font-semibold">{selectedUser?.username}</p>
              </div>

              {habits.length === 0 ? (
                <Card className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No habits found. Create a habit first!</p>
                </Card>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {habits.map((habit) => (
                    <Card
                      key={habit.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition ${
                        selectedHabit?.id === habit.id ? 'border-primary border-2' : ''
                      }`}
                      onClick={() => {
                        setSelectedHabit(habit);
                        setStep('duration');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{habit.name}</p>
                          <p className="text-sm text-muted-foreground">{habit.category}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Duration */}
          {step === 'duration' && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('habit')}
                className="mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Opponent: {selectedUser?.username}</p>
                <p className="text-sm text-muted-foreground">Habit: {selectedHabit?.name}</p>
              </div>

              <div>
                <p className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Select Duration
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[7, 14, 21, 30].map((days) => (
                    <Card
                      key={days}
                      className={`p-6 cursor-pointer hover:bg-muted/50 transition text-center ${
                        selectedDuration === days ? 'border-primary border-2 bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setSelectedDuration(days as 7 | 14 | 21 | 30);
                        setStep('stake');
                      }}
                    >
                      <p className="text-3xl font-bold mb-1">{days}</p>
                      <p className="text-sm text-muted-foreground">days</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Select Stake */}
          {step === 'stake' && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('duration')}
                className="mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Opponent: {selectedUser?.username}</p>
                <p className="text-sm text-muted-foreground">Habit: {selectedHabit?.name}</p>
                <p className="text-sm text-muted-foreground">Duration: {selectedDuration} days</p>
              </div>

              <div>
                <p className="font-semibold mb-3 flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Set XP Stake
                </p>

                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Your XP</span>
                    <span className="font-bold">{currentUserData?.totalXP || 0} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Selected Stake</span>
                    <span className="font-bold text-primary">{selectedStake} XP</span>
                  </div>
                  <Progress 
                    value={currentUserData ? (selectedStake / currentUserData.totalXP) * 100 : 0} 
                    className="mt-2"
                  />
                </div>

                {recommendedStakes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {recommendedStakes.map((stake) => (
                      <Card
                        key={stake}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition text-center ${
                          selectedStake === stake ? 'border-primary border-2 bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedStake(stake)}
                      >
                        <p className="text-2xl font-bold mb-1">{stake}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Coins className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Not enough XP to create challenges</p>
                  </Card>
                )}

                {!canAfford && selectedStake > 0 && (
                  <p className="text-sm text-destructive mt-2">Insufficient XP for this stake</p>
                )}
              </div>

              <Button
                onClick={handleCreateChallenge}
                disabled={creating || !canAfford || selectedStake === 0}
                className="w-full"
                size="lg"
              >
                {creating ? 'Creating...' : `Create Challenge (${selectedStake} XP)`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
