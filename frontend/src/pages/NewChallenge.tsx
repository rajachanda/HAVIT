import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useFirebase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Swords, Search, Users, Trophy, Zap, Target, Clock, Coins } from 'lucide-react';
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

export default function NewChallenge() {
  const navigate = useNavigate();
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

          // If no stake selected yet, pre-select a recommended stake
          try {
            const levelInfo = getLevelInfo(data.totalXP);
            const stakes = getRecommendedStakes(levelInfo.level, data.totalXP);
            if (stakes.length > 0 && selectedStake === 0) {
              setSelectedStake(stakes[0]);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleCreateChallenge = async () => {
    if (!selectedUser || !selectedHabit || !currentUser || !currentUserData || selectedStake === 0) return;

    // Check if user can afford stake
    if (!canAffordStake(currentUserData.totalXP, selectedStake)) {
      toast({
        title: 'Insufficient XP',
        description: `You need at least ${selectedStake} XP to stake.`,
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await createChallenge(
        currentUser.uid,
        currentUserData.username,
        currentUserData.avatar || currentUserData.firstName.charAt(0),
        selectedUser.id,
        selectedUser.username,
        selectedUser.avatar || selectedUser.firstName.charAt(0),
        selectedHabit.id,
        selectedHabit.name,
        selectedHabit.category,
        selectedDuration,
        selectedStake
      );

      toast({
        title: '⚔️ Challenge Sent!',
        description: `${selectedUser.username} has been challenged for ${selectedStake} XP!`,
      });

      navigate('/challenges');
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to create challenge. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/challenges')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Swords className="w-8 h-8 text-warning" />
              New Challenge
            </h1>
            <p className="text-sm text-muted-foreground">Battle it out with friends!</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'user' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Users className="w-4 h-4" />
          </div>
          <div className={`h-1 w-12 ${step !== 'user' ? 'bg-warning' : 'bg-muted'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'habit' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Target className="w-4 h-4" />
          </div>
          <div className={`h-1 w-12 ${step === 'duration' || step === 'stake' ? 'bg-warning' : 'bg-muted'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'duration' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div className={`h-1 w-12 ${step === 'stake' ? 'bg-warning' : 'bg-muted'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'stake' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Coins className="w-4 h-4" />
          </div>
        </div>

        {step === 'user' && (
          <Card className="bg-card border-border p-6 shadow-card">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Choose Your Opponent</h2>
                <p className="text-sm text-muted-foreground">Search for users in the app</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loadingUsers && (
                  <p className="text-center text-muted-foreground py-8">Searching...</p>
                )}
                
                {!loadingUsers && searchQuery && users.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}

                {!loadingUsers && !searchQuery && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">Start typing to search for users</p>
                  </div>
                )}

                {users.map((user) => (
                  <Card
                    key={user.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedUser?.id === user.id
                        ? 'border-warning bg-warning/10'
                        : 'border-border hover:border-warning/50'
                    }`}
                    onClick={async () => {
                      try {
                        const userRef = doc(db, 'users', user.id);
                        const snap = await getDoc(userRef);
                        if (snap.exists()) {
                          const data = snap.data() as any;
                          setSelectedUser({
                            id: user.id,
                            username: data.username || user.username,
                            firstName: data.firstName || user.firstName,
                            lastName: data.lastName || user.lastName,
                            avatar: data.avatar || user.avatar,
                            level: data.level || 1,
                            totalXP: data.totalXP || 0,
                          } as AppUser);
                        } else {
                          setSelectedUser(user);
                        }
                      } catch (err) {
                        console.error('Error fetching user details:', err);
                        setSelectedUser(user);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-border">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.avatar || user.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Lvl {user.level || 1}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setStep('habit')}
                disabled={!selectedUser}
                className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {step === 'habit' && (
          <Card className="bg-card border-border p-6 shadow-card">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Pick Your Battle</h2>
                <p className="text-sm text-muted-foreground">Choose which habit to compete on</p>
              </div>

              {selectedUser && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {selectedUser.avatar || selectedUser.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Challenging</p>
                    <p className="text-xs text-muted-foreground">@{selectedUser.username}</p>
                  </div>
                </div>
              )}

              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground mb-4">No habits yet</p>
                  <Button onClick={() => navigate('/habits/new')} variant="outline">
                    Create a Habit First
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {habits.map((habit) => (
                    <Card
                      key={habit.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedHabit?.id === habit.id
                          ? 'border-warning bg-warning/10'
                          : 'border-border hover:border-warning/50'
                      }`}
                      onClick={() => setSelectedHabit(habit)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{habit.name}</h3>
                          <p className="text-xs text-muted-foreground">{habit.category}</p>
                          <Badge variant="outline" className="text-xs mt-1">{habit.difficulty}</Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setStep('user')} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep('duration')}
                  disabled={!selectedHabit}
                  className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 'duration' && (
          <Card className="bg-card border-border p-6 shadow-card">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Set the Stakes</h2>
                <p className="text-sm text-muted-foreground">How long will this battle last?</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-warning/20 to-primary/20 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-warning" />
                  <p className="font-semibold text-foreground">Challenge Summary</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Opponent</p>
                    <p className="font-medium">@{selectedUser?.username}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Habit</p>
                    <p className="font-medium">{selectedHabit?.name}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[7, 14, 21, 30].map((days) => (
                  <Card
                    key={days}
                    className={`p-6 cursor-pointer transition-all text-center hover:shadow-md ${
                      selectedDuration === days
                        ? 'border-warning bg-warning/10'
                        : 'border-border hover:border-warning/50'
                    }`}
                    onClick={() => setSelectedDuration(days as 7 | 14 | 21 | 30)}
                  >
                    <div className="text-4xl font-bold text-foreground mb-1">{days}</div>
                    <p className="text-sm text-muted-foreground">days</p>
                    {days === 21 && <Badge variant="outline" className="mt-2 text-xs">Popular</Badge>}
                  </Card>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg">
                <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Winner takes all!</p>
                  <p className="text-muted-foreground">
                    Whoever completes the habit more times wins and earns bonus XP! 🏆
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep('habit')} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep('stake')}
                  className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Set Stake */}
        {step === 'stake' && currentUserData && (
          <Card className="bg-card border-border p-6 shadow-card">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Wager Your XP</h2>
                <p className="text-sm text-muted-foreground">Put some XP on the line!</p>
              </div>

              {/* Current XP Display */}
              <div className="p-4 bg-gradient-to-br from-primary/20 to-warning/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Total XP</p>
                    <p className="text-2xl font-bold text-foreground">{currentUserData.totalXP}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Challenge Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-warning" />
                  <p className="font-semibold">Challenge Summary</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Opponent</p>
                    <p className="font-medium">@{selectedUser?.username}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Habit</p>
                    <p className="font-medium">{selectedHabit?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-medium">{selectedDuration} days</p>
                  </div>
                </div>
              </div>

              {/* Stake Options */}
              <div>
                <p className="text-sm font-medium mb-3">Choose your stake</p>
                <div className="grid grid-cols-2 gap-3">
                    {getRecommendedStakes(getLevelInfo(currentUserData.totalXP).level, currentUserData.totalXP).map((stake) => (
                    <Card
                      key={stake}
                      className={`p-4 cursor-pointer transition-all text-center hover:shadow-md ${
                        selectedStake === stake
                          ? 'border-warning bg-warning/10'
                          : 'border-border hover:border-warning/50'
                      } ${!canAffordStake(currentUserData.totalXP, stake) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canAffordStake(currentUserData.totalXP, stake) && setSelectedStake(stake)}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Coins className="w-5 h-5 text-warning" />
                        <div className="text-3xl font-bold text-foreground">{stake}</div>
                      </div>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <Trophy className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">High Stakes!</p>
                  <p className="text-muted-foreground">
                    Both players stake {selectedStake || 0} XP. Winner takes all ({(selectedStake || 0) * 2} XP total)!
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button onClick={() => setStep('duration')} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreateChallenge}
                  disabled={creating || selectedStake === 0}
                  className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
                  size="lg"
                >
                  {creating ? 'Sending...' : (
                    <>
                      <Swords className="w-4 h-4 mr-2" />
                      Send Challenge ({selectedStake} XP)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
