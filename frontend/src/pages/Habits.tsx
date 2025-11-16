import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HabitCard } from "@/components/HabitCard";
import { QuickAddHabit } from "@/components/QuickAddHabit";
import DateCarousel from "@/components/DateCarousel";
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">All Habits</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track your daily habits</p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="default"
              variant="outline"
              className="bg-warning/10 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
              onClick={() => setShowQuickAdd(true)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
            <Button 
              size="default"
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/habits/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-card border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <div className="text-2xl font-bold text-foreground">{habits.length}</div>
                <div className="text-xs text-muted-foreground">Total Habits</div>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <div className="text-2xl font-bold text-success">{completedToday}</div>
                <div className="text-xs text-muted-foreground">Completed Today</div>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <div className="text-2xl font-bold text-warning">{longestStreak}</div>
                <div className="text-xs text-muted-foreground">Longest Streak</div>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📈</div>
              <div>
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Date Carousel */}
        <DateCarousel 
          habits={habits}
          onDateSelect={(date) => {
            console.log('Selected date:', date);
          }}
        />

        {/* Filters */}
        <Card className="bg-card border-border p-3 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-background border-border"
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                size="sm"
                className="h-9"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  className="h-9 whitespace-nowrap"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Habits List */}
        <div className="space-y-3">
          {filteredHabits.length > 0 ? (
            filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} userId={currentUser?.uid || ''} />
            ))
          ) : (
            <Card className="bg-card border-border p-8 md:p-12 text-center">
              <div className="text-5xl mb-4">
                {habits.length === 0 ? '📭' : '🔍'}
              </div>
              <p className="text-muted-foreground text-lg font-medium mb-2">
                {habits.length === 0 
                  ? "No habits yet" 
                  : "No habits found"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {habits.length === 0 
                  ? "Create your first habit to get started on your journey!" 
                  : "Try adjusting your search or filters"}
              </p>
              {habits.length === 0 && (
                <Button 
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

      {/* Hide scrollbar for category filters */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Habits;
