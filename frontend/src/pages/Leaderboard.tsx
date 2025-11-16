import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Calendar, BarChart3, Award } from "lucide-react";
import LeaderboardPodium from "@/components/LeaderboardPodium";
import LeaderboardCard from "@/components/LeaderboardCard";
import ConfettiEffect from "@/components/ConfettiEffect";
import { useNavigate } from "react-router-dom";

interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  champion: string;
  isUser?: boolean;
}

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const {
          collection,
          query,
          orderBy,
          limit,
          onSnapshot,
          getDocs,
        } = await import('firebase/firestore');
        const { db } = await import('@/config/firebase');

        const leaderboardRef = collection(db, 'leaderboard', timeframe, 'users');
        const q = query(leaderboardRef, orderBy('totalXP', 'desc'), limit(50));
        const snap = await getDocs(q);

        if (!snap.empty) {
          unsubscribe = onSnapshot(q, (snapshot) => {
            const users: LeaderboardUser[] = snapshot.docs.map((d, i) => {
              const data: any = d.data();
              return {
                rank: i + 1,
                name: data.username || data.firstName || data.displayName || 'Unknown',
                level: data.level || 1,
                xp: data.totalXP || 0,
                streak: data.currentStreak || 0,
                champion: data.championArchetype || data.champion || '',
                isUser: currentUser ? d.id === currentUser.uid : false,
              } as LeaderboardUser;
            });
            setLeaderboard(users);
            setLoading(false);
            
            const userInTop3 = users.slice(0, 3).some(u => u.isUser);
            if (userInTop3) {
              setShowConfetti(true);
            }
          });
          return;
        }

        const usersRef = collection(db, 'users');
        const usersQ = query(usersRef, orderBy('totalXP', 'desc'), limit(50));
        unsubscribe = onSnapshot(usersQ, (snapshot) => {
          const users: LeaderboardUser[] = snapshot.docs.map((d, i) => {
            const data: any = d.data();
            return {
              rank: i + 1,
              name: data.username || data.firstName || data.displayName || 'Unknown',
              level: data.level || 1,
              xp: data.totalXP || 0,
              streak: data.currentStreak || 0,
              champion: data.championArchetype || data.champion || '',
              isUser: currentUser ? d.id === currentUser.uid : false,
            } as LeaderboardUser;
          });
          setLeaderboard(users);
          setLoading(false);
          
          const userInTop3 = users.slice(0, 3).some(u => u.isUser);
          if (userInTop3) {
            setShowConfetti(true);
          }
        });
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setLoading(false);
      }
    };

    load();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [timeframe, currentUser]);

  const getUserRank = () => {
    const userEntry = leaderboard.find(u => u.isUser);
    return userEntry?.rank || null;
  };

  const getTopPercentage = () => {
    const rank = getUserRank();
    if (!rank) return null;
    return Math.round((rank / leaderboard.length) * 100);
  };

  const getNextMilestone = () => {
    const rank = getUserRank();
    if (!rank) return null;
    
    if (rank > 10) return { target: 10, xpNeeded: 0 };
    if (rank > 3) return { target: 3, xpNeeded: 0 };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      {showConfetti && <ConfettiEffect active={showConfetti} duration={4000} pieceCount={60} />}
      
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Leaderboard
          </h1>
        </div>

        <div className="flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Button
            variant={timeframe === "daily" ? "default" : "ghost"}
            onClick={() => setTimeframe("daily")}
            className={`rounded-full px-8 py-5 text-base font-semibold transition-all duration-300 ${
              timeframe === "daily" 
                ? 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg scale-105' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Daily
          </Button>
          <div className="w-px h-6 bg-border"></div>
          <Button
            variant={timeframe === "weekly" ? "default" : "ghost"}
            onClick={() => setTimeframe("weekly")}
            className={`rounded-full px-8 py-5 text-base font-semibold transition-all duration-300 ${
              timeframe === "weekly" 
                ? 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg scale-105' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Weekly
          </Button>
          <div className="w-px h-6 bg-border"></div>
          <Button
            variant={timeframe === "monthly" ? "default" : "ghost"}
            onClick={() => setTimeframe("monthly")}
            className={`rounded-full px-8 py-5 text-base font-semibold transition-all duration-300 ${
              timeframe === "monthly" 
                ? 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg scale-105' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Monthly
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 space-y-4 animate-fade-in">
            <div className="text-6xl animate-bounce-slow">🏋️</div>
            <p className="text-xl text-muted-foreground">Loading champions...</p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 space-y-4 animate-fade-in">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-foreground">No Champions Yet!</h3>
            <p className="text-muted-foreground">Be the first to complete habits and claim the throne! 👑</p>
          </div>
        ) : (
          <>
            <LeaderboardPodium
              first={leaderboard[0]}
              second={leaderboard[1]}
              third={leaderboard[2]}
            />

            <div className="space-y-2 max-w-4xl mx-auto">
              {leaderboard.slice(3).map((user) => (
                <LeaderboardCard
                  key={user.rank}
                  rank={user.rank}
                  name={user.name}
                  level={user.level}
                  xp={user.xp}
                  streak={user.streak}
                  champion={user.champion}
                  isUser={user.isUser}
                />
              ))}
            </div>

            {getUserRank() && (
              <Card className="bg-gradient-to-r from-primary/20 via-success/10 to-primary/20 border-primary/50 border-2 p-6 shadow-xl shadow-primary/20 animate-fade-in-up hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success/30 to-primary/30 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                      💪 Keep Climbing!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getTopPercentage() !== null ? (
                        <>
                          You're in the <span className="font-bold text-success">top {getTopPercentage()}%</span> of all champions! 
                          {getNextMilestone() && ` Reach top ${getNextMilestone()!.target} to unlock special rewards!`}
                        </>
                      ) : (
                        'Complete more habits to climb the leaderboard! 🚀'
                      )}
                    </p>
                    
                    {getUserRank()! > 3 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Your Rank: #{getUserRank()}</span>
                          <span>Next Goal: Top {getNextMilestone()?.target || 10}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500 animate-pulse-slow"
                            style={{ width: `${Math.min(((50 - getUserRank()!) / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/habits')}
                    className="bg-gradient-to-r from-success to-success/80 text-white hover:from-success/90 hover:to-success/70 shadow-lg hover:shadow-success/50 transition-all duration-300 hover:scale-105 flex-shrink-0"
                  >
                    ✨ Complete Habits
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
