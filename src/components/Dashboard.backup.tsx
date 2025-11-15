import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame, Trophy, Zap, Sparkles } from "lucide-react";
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

  const [userStats] = useState({
    level: 12,
    xp: 740,
    xpToNext: 1200,
    totalStreak: 42,
    completionRate: 85,
    championType: "Warrior",
  });

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
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-dark shadow-primary transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
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
              value={userStats.level}
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
              level={userStats.level}
              xp={userStats.xp}
              xpToNext={userStats.xpToNext}
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

