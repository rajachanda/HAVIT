import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Flame, Zap, Pencil, Trash2 } from "lucide-react";
import { completeHabit, deleteHabit } from "@/lib/api";
import type { Habit } from "@/lib/api";

interface HabitCardProps {
  habit: Habit;
  userId: string;
}

export const HabitCard = ({ habit, userId }: HabitCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showXP, setShowXP] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fitness: "bg-success/20 text-success border-success/50",
      Learning: "bg-primary/20 text-primary border-primary/50",
      Wellness: "bg-warning/20 text-warning border-warning/50",
      Career: "bg-destructive/20 text-destructive border-destructive/50",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completions?.some(
    (c) => c.date === today && c.completed
  ) || false;

  // Calculate streak (consecutive days)
  const calculateStreak = () => {
    if (!habit.completions || habit.completions.length === 0) return 0;
    
    const sortedCompletions = [...habit.completions]
      .filter((c) => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const completion of sortedCompletions) {
      const completionDate = new Date(completion.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === streak) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || !habit.id) return;

    if (!isCompletedToday) {
      setLoading(true);
      const result = await completeHabit(habit.id, today);
      setLoading(false);

      if (result.success) {
        // Show XP animation
        setShowXP(true);
        setTimeout(() => setShowXP(false), 2000);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!habit.id || !confirm('Are you sure you want to delete this habit?')) return;

    await deleteHabit(habit.id);
  };

  return (
    <Card
      className={`bg-card border-border p-4 transition-all duration-300 hover:bg-card-hover hover:shadow-card relative ${
        isCompletedToday ? "opacity-90" : ""
      }`}
    >
      {/* XP Animation */}
      {showXP && (
        <div className="absolute top-2 right-2 animate-bounce text-success font-bold">
          +{habit.xpReward} XP
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Completion Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full transition-all duration-300 ${
              isCompletedToday
                ? "bg-success/20 text-success hover:bg-success/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={handleToggle}
            disabled={loading || isCompletedToday}
          >
            {isCompletedToday ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </Button>

          {/* Habit Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`text-lg font-semibold ${
                  isCompletedToday ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {habit.name}
              </h3>
              <Badge variant="outline" className={getCategoryColor(habit.category)}>
                {habit.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-warning">
                <Flame className="w-4 h-4" />
                {streak} day streak
              </span>
              <span className="flex items-center gap-1 text-success">
                <Zap className="w-4 h-4" />
                +{habit.xpReward} XP
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons and streak indicator */}
        <div className="flex items-center gap-2">
          {streak >= 7 && (
            <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/50">
              🔥 Hot Streak!
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open edit modal
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/20"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
