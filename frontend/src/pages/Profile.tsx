import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Shield, Trophy, Flame, Zap, Award, Calendar, User, Mail, Cake, Users2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useHabits } from "@/hooks/useFirebase";

const Profile = () => {
  const { currentUser } = useAuth();
  const { data: userData, isLoading: userLoading } = useUser(currentUser?.uid || null);
  const { habits, loading: habitsLoading } = useHabits(currentUser?.uid || null);

  // Calculate stats from real data
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const completedHabits = habits.filter(h => 
      h.completions?.some(c => c.completed)
    );
    
    const totalCompletions = completedHabits.reduce((sum, h) => 
      sum + (h.completions?.filter(c => c.completed).length || 0), 0
    );
    
    const completionRate = habits.length > 0 
      ? Math.round((completedHabits.length / habits.length) * 100) 
      : 0;

    return {
      totalHabits: habits.length,
      completionRate,
      totalCompletions,
    };
  };

  const stats = calculateStats();
  const xpToNextLevel = (userData?.level || 1) * 100;

  const achievements = [
    { name: "First Steps", description: "Complete your first habit", icon: "🎯", unlocked: habits.length > 0 },
    { name: "Week Warrior", description: "7-day streak", icon: "⚔️", unlocked: (userData?.currentStreak || 0) >= 7 },
    { name: "Challenge Master", description: "Complete onboarding", icon: "🏆", unlocked: userData?.onboardingCompleted || false },
    { name: "Social Butterfly", description: "Choose your champion", icon: "🦋", unlocked: !!userData?.championArchetype },
    { name: "Month Legend", description: "30-day streak", icon: "👑", unlocked: (userData?.currentStreak || 0) >= 30 },
    { name: "Century Club", description: "Reach level 10", icon: "💯", unlocked: (userData?.level || 0) >= 10 },
  ];

  if (userLoading || habitsLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-card border-border p-8 shadow-card">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                {userData?.firstName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {userData?.firstName} {userData?.lastName || ''}
              </h1>
              <p className="text-muted-foreground mb-1">@{userData?.username || 'user'}</p>
              <p className="text-muted-foreground mb-3">{userData?.email || currentUser?.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {userData?.championArchetype && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {userData.championArchetype}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Level {userData?.level || 1}
                </Badge>
                {userData?.age && (
                  <Badge variant="secondary" className="text-muted-foreground">
                    {userData.age} years old
                  </Badge>
                )}
                {userData?.gender && (
                  <Badge variant="secondary" className="text-muted-foreground">
                    {userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
            <Button size="lg" variant="outline">
              Edit Profile
            </Button>
          </div>

          {/* User Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium">{userData?.firstName} {userData?.lastName || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{userData?.email}</p>
              </div>
            </div>
            {userData?.age && (
              <div className="flex items-center gap-3">
                <Cake className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{userData.age} years</p>
                </div>
              </div>
            )}
            {userData?.username && (
              <div className="flex items-center gap-3">
                <Users2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="font-medium">@{userData.username}</p>
                </div>
              </div>
            )}
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Level Progress</span>
              <span className="text-sm font-bold text-success">
                {userData?.totalXP || 0} / {xpToNextLevel} XP
              </span>
            </div>
            <Progress value={((userData?.totalXP || 0) / xpToNextLevel) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              {xpToNextLevel - (userData?.totalXP || 0)} XP until Level {(userData?.level || 1) + 1}
            </p>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border p-6 text-center">
            <Flame className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{userData?.currentStreak || 0}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{userData?.longestStreak || 0}</div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Zap className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{stats.totalHabits}</div>
            <div className="text-sm text-muted-foreground">Total Habits</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Award className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Challenges Won</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Zap className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{userData?.totalXP || 0}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-warning" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  achievement.unlocked
                    ? "bg-success/10 border-success/30 hover:bg-success/20"
                    : "bg-muted/30 border-border opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="mt-2 bg-success/20 text-success">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Champion Info */}
        <Card className="bg-gradient-to-br from-primary/20 to-success/20 border-primary p-6">
          <div className="flex items-center gap-4">
            <Shield className="w-12 h-12 text-primary" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Your {userData?.championArchetype || 'Champion'} Champion
              </h3>
              <p className="text-muted-foreground">
                Grows stronger with every habit you complete. Keep building to unlock new abilities!
              </p>
            </div>
            <Button variant="outline">View Champion</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
