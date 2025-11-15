import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HabitCard } from "@/components/HabitCard";
import { QuickAddHabit } from "@/components/QuickAddHabit";
import { Plus, Search, Filter, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/hooks/useFirebase";

const Habits = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { habits, loading } = useHabits(currentUser?.uid || null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const categories = Array.from(new Set(habits.map((h) => h.category)));

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter((h) => 
    h.completions?.some((c) => c.date === today && c.completed)
  ).length;

  const calculateStreak = (habit: any) => {
    if (!habit.completions || habit.completions.length === 0) return 0;
    const sortedCompletions = [...habit.completions]
      .filter((c: any) => c.completed)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    for (const completion of sortedCompletions) {
      const completionDate = new Date(completion.date);
      const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === streak) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const longestStreak = habits.length > 0 
    ? Math.max(...habits.map((h) => calculateStreak(h)), 0) 
    : 0;

  const completionRate = habits.length > 0 
    ? Math.round((completedToday / habits.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">All Habits</h1>
            <p className="text-muted-foreground mt-1">Manage and track your daily habits</p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-warning/10 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
              onClick={() => setShowQuickAdd(true)}
            >
              <Zap className="w-5 h-5 mr-2" />
              Quick Add
            </Button>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark shadow-primary"
              onClick={() => navigate('/habits/new')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Habit
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

        {/* Filters */}
        <Card className="bg-card border-border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{habits.length}</div>
            <div className="text-sm text-muted-foreground">Total Habits</div>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <div className="text-3xl font-bold text-success">
              {completedToday}
            </div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <div className="text-3xl font-bold text-warning">
              {longestStreak}
            </div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {completionRate}%
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </Card>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {filteredHabits.length > 0 ? (
            filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} userId={currentUser?.uid || ''} />
            ))
          ) : (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">
                {habits.length === 0 
                  ? "No habits yet. Create your first habit to get started!" 
                  : "No habits found. Try adjusting your filters."}
              </p>
              {habits.length === 0 && (
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/habits/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Habit
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;
