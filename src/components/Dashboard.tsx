import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame, Trophy, Zap, Sparkles, ArrowUp } from "lucide-react";
import { ChampionDisplay } from "./ChampionDisplay";
import { HabitCard } from "./HabitCard";
import { StatsBar } from "./StatsBar";

interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  completed: boolean;
  xp: number;
}

export const Dashboard = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      title: "Morning Workout",
      category: "Fitness",
      streak: 12,
      completed: false,
      xp: 15,
    },
    {
      id: "2",
      title: "Read 30 Minutes",
      category: "Learning",
      streak: 8,
      completed: true,
      xp: 10,
    },
    {
      id: "3",
      title: "Meditate",
      category: "Wellness",
      streak: 5,
      completed: false,
      xp: 10,
    },
    {
      id: "4",
      title: "Code Practice",
      category: "Career",
      streak: 15,
      completed: true,
      xp: 15,
    },
  ]);

  // Level state (1-9 max for testing)
  const [testLevel, setTestLevel] = useState(1);
  const [showThunder, setShowThunder] = useState(false);
  const prevLevelRef = useRef(1);

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

  const [userStats] = useState({
    totalStreak: 42,
    completionRate: 85,
    championType: "Warrior",
  });

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

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };

  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const progressPercent = (completedToday / totalHabits) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              Havit
            </h1>
            <p className="text-muted-foreground mt-1">
              The Only Habit Tracker People Keep Using
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Test Level Counter Button */}
            <Card className="bg-card border-border p-3 flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Test Level:</div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLevelDown}
                  disabled={testLevel <= 1}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <Badge variant="secondary" className="text-lg px-3 py-1 min-w-[3rem] text-center">
                  {testLevel}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLevelUp}
                  disabled={testLevel >= 9}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleLevelUp}
                disabled={testLevel >= 9}
                className="bg-primary hover:bg-primary-dark shadow-primary"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Level Up
              </Button>
            </Card>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark shadow-primary transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Habit
            </Button>
          </div>
        </header>

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
              value={userStats.totalStreak}
              suffix="days"
            />
            <StatsBar
              icon={<Trophy className="w-5 h-5 text-primary" />}
              label="Level"
              value={testLevel}
            />
            <StatsBar
              icon={<Zap className="w-5 h-5 text-success" />}
              label="Completion"
              value={userStats.completionRate}
              suffix="%"
            />
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Champion Display */}
          <div className="lg:col-span-1">
            <ChampionDisplay
              championType={userStats.championType}
              level={testLevel}
              xp={xpData.current}
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
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={() => toggleHabit(habit.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
