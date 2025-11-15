import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, TrendingUp, Crown } from "lucide-react";

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
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "alltime">("weekly");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  const { currentUser } = useAuth();

  useEffect(() => {
    // Dynamically load leaderboard data. Prefer explicit leaderboard collection
    // (leaderboard/{period}/users) if it exists (server-maintained). Fall back
    // to ordering `users` by `totalXP` for all-time/when period collection is empty.
    let unsubscribe: (() => void) | null = null;

    const load = async () => {
      try {
        const {
          collection,
          query,
          orderBy,
          limit,
          onSnapshot,
          getDocs,
          doc,
        } = await import('firebase/firestore');
        const { db } = await import('@/config/firebase');

        // First try server-maintained leaderboard collection for timeframe
        const leaderboardRef = collection(db, 'leaderboard', timeframe, 'users');
        const q = query(leaderboardRef, orderBy('totalXP', 'desc'), limit(50));
        const snap = await getDocs(q);

        if (!snap.empty) {
          // Subscribe to leaderboards collection updates
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
              } as LeaderboardUser;
            });
            setLeaderboard(users);
          });
          return;
        }

        // Fallback: query users collection ordered by totalXP
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
        });
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      }
    };

    load();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [timeframe]);

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Crown className="w-6 h-6 text-warning animate-pulse" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-warning" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-warning";
    if (rank === 2) return "text-muted-foreground";
    if (rank === 3) return "text-warning";
    return "text-foreground";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Trophy className="w-9 h-9 text-warning" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Compete with the best habit builders worldwide
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={timeframe === "daily" ? "default" : "ghost"}
            onClick={() => setTimeframe("daily")}
          >
            Daily
          </Button>
          <Button
            variant={timeframe === "weekly" ? "default" : "ghost"}
            onClick={() => setTimeframe("weekly")}
          >
            Weekly
          </Button>
          <Button
            variant={timeframe === "alltime" ? "default" : "ghost"}
            onClick={() => setTimeframe("alltime")}
          >
            All Time
          </Button>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : (
          (() => {
            const p0 = leaderboard[0] || { name: '—', xp: 0, champion: '', streak: 0 };
            const p1 = leaderboard[1] || { name: '—', xp: 0, champion: '', streak: 0 };
            const p2 = leaderboard[2] || { name: '—', xp: 0, champion: '', streak: 0 };
            return (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <Card className="bg-card border-border p-6 text-center transform translate-y-6">
                  <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-muted-foreground">
                    <AvatarFallback className="text-lg font-bold bg-muted">{p1.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Medal className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-bold text-foreground">{p1.name}</h3>
                  <p className="text-sm text-muted-foreground">{p1.champion}</p>
                  <div className="text-2xl font-bold text-primary mt-2">{p1.xp} XP</div>
                </Card>

                {/* 1st Place */}
                <Card className="bg-gradient-to-br from-warning/20 to-primary/20 border-warning p-6 text-center shadow-primary">
                  <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-warning">
                    <AvatarFallback className="text-xl font-bold bg-warning text-warning-foreground">{p0.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Crown className="w-10 h-10 text-warning mx-auto mb-2 animate-pulse" />
                  <h3 className="font-bold text-foreground text-lg">{p0.name}</h3>
                  <p className="text-sm text-muted-foreground">{p0.champion}</p>
                  <div className="text-3xl font-bold text-warning mt-2">{p0.xp} XP</div>
                  <Badge variant="secondary" className="mt-2">🔥 {p0.streak} day streak</Badge>
                </Card>

                {/* 3rd Place */}
                <Card className="bg-card border-border p-6 text-center transform translate-y-6">
                  <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-warning">
                    <AvatarFallback className="text-lg font-bold bg-muted">{p2.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Medal className="w-8 h-8 text-warning mx-auto mb-2" />
                  <h3 className="font-bold text-foreground">{p2.name}</h3>
                  <p className="text-sm text-muted-foreground">{p2.champion}</p>
                  <div className="text-2xl font-bold text-primary mt-2">{p2.xp} XP</div>
                </Card>
              </div>
            );
          })()
        )}

        {/* Full Rankings */}
        <div className="space-y-2">
          {leaderboard.map((user) => (
            <Card
              key={user.rank}
              className={`bg-card border-border p-4 transition-all duration-300 hover:bg-card-hover ${
                user.isUser ? "border-primary shadow-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-12 text-center">
                    {getRankIcon(user.rank) || (
                      <span className={`text-2xl font-bold ${getRankColor(user.rank)}`}>
                        {user.rank}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <Avatar className="w-12 h-12 border-2 border-border">
                    <AvatarFallback className="bg-muted font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{user.name}</h3>
                      {user.isUser && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.champion}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-muted-foreground">Level</div>
                    <div className="text-lg font-bold text-foreground">{user.level}</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-muted-foreground">Streak</div>
                    <div className="text-lg font-bold text-warning">{user.streak}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">XP</div>
                    <div className="text-xl font-bold text-primary">{user.xp}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Your Progress Card */}
        <Card className="bg-gradient-to-r from-primary/20 to-success/20 border-primary p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-success" />
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Keep Climbing!</h3>
              <p className="text-sm text-muted-foreground">
                You're in the top 15% of all users. Complete more habits to move up!
              </p>
            </div>
            <Button className="bg-success text-success-foreground hover:bg-success/90">
              Complete Habits
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
