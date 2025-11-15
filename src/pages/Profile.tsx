import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Shield, Trophy, Flame, Zap, Award, Calendar } from "lucide-react";

const Profile = () => {
  const user = {
    name: "User Alex",
    email: "alex@rehabit.app",
    level: 12,
    xp: 740,
    xpToNext: 1200,
    champion: "Warrior",
    joinDate: "January 2025",
    stats: {
      totalHabits: 24,
      completionRate: 85,
      longestStreak: 42,
      currentStreak: 15,
      totalXP: 8520,
      challengesWon: 8,
    },
  };

  const achievements = [
    { name: "First Steps", description: "Complete your first habit", icon: "🎯", unlocked: true },
    { name: "Week Warrior", description: "7-day streak", icon: "⚔️", unlocked: true },
    { name: "Challenge Master", description: "Win 5 challenges", icon: "🏆", unlocked: true },
    { name: "Social Butterfly", description: "Join a squad", icon: "🦋", unlocked: true },
    { name: "Month Legend", description: "30-day streak", icon: "👑", unlocked: false },
    { name: "Century Club", description: "100 habits completed", icon: "💯", unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-card border-border p-8 shadow-card">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">{user.name}</h1>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {user.champion}
                </Badge>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Level {user.level}
                </Badge>
                <Badge variant="secondary" className="text-muted-foreground">
                  Joined {user.joinDate}
                </Badge>
              </div>
            </div>
            <Button size="lg" variant="outline">
              Edit Profile
            </Button>
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Level Progress</span>
              <span className="text-sm font-bold text-success">
                {user.xp} / {user.xpToNext} XP
              </span>
            </div>
            <Progress value={(user.xp / user.xpToNext) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              {user.xpToNext - user.xp} XP until Level {user.level + 1}
            </p>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border p-6 text-center">
            <Flame className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{user.stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{user.stats.longestStreak}</div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Zap className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{user.stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{user.stats.totalHabits}</div>
            <div className="text-sm text-muted-foreground">Total Habits</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Award className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{user.stats.challengesWon}</div>
            <div className="text-sm text-muted-foreground">Challenges Won</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Zap className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{user.stats.totalXP}</div>
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
                Your {user.champion} Champion
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
