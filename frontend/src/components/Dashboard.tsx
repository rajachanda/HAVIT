import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRealtime, useHabits } from "@/hooks/useFirebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame, Trophy, Zap, Sparkles, ArrowUp } from "lucide-react";
import { ChampionDisplay } from "./ChampionDisplay";
import { HabitCard } from "./HabitCard";
import { StatsBar } from "./StatsBar";
import { QuickAddHabit } from "./QuickAddHabit";
import { RealtimeBadge } from "./RealtimeBadge";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { userData, loading: userLoading } = useUserRealtime(currentUser?.uid || null);
  const { habits, loading: habitsLoading } = useHabits(currentUser?.uid || null);

  // Level state for testing animations
  const [testLevel, setTestLevel] = useState(1);
  const [showThunder, setShowThunder] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const prevLevelRef = useRef(1);
  const [previousXP, setPreviousXP] = useState<number | null>(null);
  const [showXPChange, setShowXPChange] = useState(false);

  // Track XP changes
  useEffect(() => {
    if (userData?.totalXP !== undefined) {
      if (previousXP !== null && userData.totalXP !== previousXP) {
        console.log('[Dashboard] XP Changed!', { from: previousXP, to: userData.totalXP, diff: userData.totalXP - previousXP });
        setShowXPChange(true);
        setTimeout(() => setShowXPChange(false), 3000);
      }
      setPreviousXP(userData.totalXP);
    }
  }, [userData?.totalXP]);

  // Update test level when user data loads
  useEffect(() => {
    if (userData?.level) {
      setTestLevel(userData.level);
      prevLevelRef.current = userData.level;
    }
  }, [userData?.level]);

  // Calculate XP based on level (for testing)
  const calculateXPForLevel = (level: number) => {
    // XP progression: each level needs more XP
    // Level 1: 0-100, Level 2: 100-250, Level 3: 250-450, etc.
    const xpRanges: Record<number, { current: number; next: number }> = {
      1: { current: 50, next: 100 },
      2: { current: 150, next: 250 },
      3: { current: 300, next: 450 },
      4: { current: 500, next: 700 },
      5: { current: 750, next: 1000 },
      6: { current: 1100, next: 1400 },
      7: { current: 1500, next: 1900 },
      8: { current: 2000, next: 2500 },
      9: { current: 2800, next: 3000 }, // Max level
    };
    return xpRanges[level] || { current: 0, next: 100 };
  };

  const xpData = calculateXPForLevel(testLevel);

  // Handle level up with animation
  const handleLevelUp = () => {
    if (testLevel < 9) {
      prevLevelRef.current = testLevel;
      setTestLevel((prev) => prev + 1);
      setShowThunder(true);
    }
  };

  // Handle level down (for testing)
  const handleLevelDown = () => {
    if (testLevel > 1) {
      prevLevelRef.current = testLevel;
      setTestLevel((prev) => prev - 1);
      // No animation for level down
    }
  };

  // Reset animation
  const handleThunderComplete = () => {
    setShowThunder(false);
  };

  // Calculate today's habit completions
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter((h) => 
    h.completions?.some((c) => c.date === today && c.completed)
  ).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Calculate real completion rate (all time)
  const completedHabitsCount = habits.filter((h) => 
    h.completions?.some((c) => c.completed)
  ).length;
  const completionRate = totalHabits > 0 ? Math.round((completedHabitsCount / totalHabits) * 100) : 0;

  // Calculate daily XP earned
  const dailyXP = habits
    .filter((h) => h.completions?.some((c) => c.date === today && c.completed))
    .reduce((sum, h) => sum + h.xpReward, 0);

  if (userLoading || habitsLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      {/* XP Change Notification */}
      {showXPChange && previousXP !== null && userData?.totalXP !== undefined && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5">
          <Card className="bg-success/20 border-success p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-success animate-pulse" />
              <div>
                <p className="font-bold text-success">XP Earned!</p>
                <p className="text-sm text-foreground">
                  +{userData.totalXP - previousXP} XP • Total: {userData.totalXP}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              Welcome back, {userData?.firstName || userData?.username || 'Champion'}! 👋
              <RealtimeBadge />
            </h1>
            <p className="text-muted-foreground mt-1">
              Level {userData?.level || 1} • {userData?.totalXP || 0} XP • {userData?.currentStreak || 0} day streak 🔥
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-warning/10 border-warning text-warning hover:bg-warning hover:text-warning-foreground hidden sm:flex"
              onClick={() => setShowQuickAdd(true)}
            >
              <Zap className="w-5 h-5 mr-2" />
              Quick Add
            </Button>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => navigate('/habits/new')}
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">New Habit</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Quick Add Modal */}
        <QuickAddHabit 
          open={showQuickAdd} 
          onOpenChange={setShowQuickAdd}
          onSuccess={() => {
            // Habits will auto-refresh from Firebase
          }}
        />

        {/* Stats Overview */}
        <Card className="bg-card border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Today's Progress</h2>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {completedToday}/{totalHabits} Complete
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <StatsBar
              icon={<Flame className="w-5 h-5 text-warning" />}
              label="Streak"
              value={userData?.currentStreak || 0}
              suffix="days"
            />
            <StatsBar
              icon={<Trophy className="w-5 h-5 text-primary" />}
              label="Level"
              value={userData?.level || 1}
            />
            <StatsBar
              icon={<Zap className="w-5 h-5 text-success" />}
              label="Completion"
              value={completionRate}
              suffix="%"
            />
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Champion Display */}
          <div className="lg:col-span-1">
            <ChampionDisplay
              championType={userData?.championArchetype || "Guardian"}
              level={userData?.level || 1}
              xp={userData?.totalXP || 0}
              xpToNext={xpData.next}
              showThunder={showThunder}
              onThunderComplete={handleThunderComplete}
            />
          </div>

          {/* Habits List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Habits</h2>
              <Badge variant="outline" className="text-sm">
                {habits.length} Active
              </Badge>
            </div>
            {habits.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No habits yet. Create your first habit to get started!</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Habit
                </Button>
              </Card>
            ) : (
              habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  userId={currentUser?.uid || ''}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
