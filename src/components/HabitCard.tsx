import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Flame, Zap } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  completed: boolean;
  xp: number;
}

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
}

export const HabitCard = ({ habit, onToggle }: HabitCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fitness: "bg-success/20 text-success border-success/50",
      Learning: "bg-primary/20 text-primary border-primary/50",
      Wellness: "bg-warning/20 text-warning border-warning/50",
      Career: "bg-destructive/20 text-destructive border-destructive/50",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <Card
      className={`bg-card border-border p-4 transition-all duration-300 hover:bg-card-hover hover:shadow-card cursor-pointer ${
        habit.completed ? "opacity-90" : ""
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Completion Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full transition-all duration-300 ${
              habit.completed
                ? "bg-success/20 text-success hover:bg-success/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {habit.completed ? (
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
                  habit.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {habit.title}
              </h3>
              <Badge variant="outline" className={getCategoryColor(habit.category)}>
                {habit.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-warning">
                <Flame className="w-4 h-4" />
                {habit.streak} day streak
              </span>
              <span className="flex items-center gap-1 text-success">
                <Zap className="w-4 h-4" />
                +{habit.xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Streak Indicator */}
        {habit.streak >= 7 && (
          <div className="text-right">
            <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/50">
              🔥 Hot Streak!
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};
