import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HabitCard } from "@/components/HabitCard";
import { Plus, Search, Filter } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  completed: boolean;
  xp: number;
}

const Habits = () => {
  const navigate = useNavigate();
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
    {
      id: "5",
      title: "Drink Water (8 glasses)",
      category: "Wellness",
      streak: 20,
      completed: false,
      xp: 5,
    },
    {
      id: "6",
      title: "Journal",
      category: "Wellness",
      streak: 3,
      completed: false,
      xp: 10,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleHabit = (id: string) => {
    setHabits(habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)));
  };

  const categories = Array.from(new Set(habits.map((h) => h.category)));

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">All Habits</h1>
            <p className="text-muted-foreground mt-1">Manage and track your daily habits</p>
          </div>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-dark shadow-primary"
            onClick={() => navigate('/habits/new')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Habit
          </Button>
        </div>

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
              {habits.filter((h) => h.completed).length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <div className="text-3xl font-bold text-warning">
              {Math.max(...habits.map((h) => h.streak))}
            </div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {Math.round(
                (habits.filter((h) => h.completed).length / habits.length) * 100
              )}
              %
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </Card>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {filteredHabits.length > 0 ? (
            filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onToggle={() => toggleHabit(habit.id)} />
            ))
          ) : (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">No habits found. Try adjusting your filters.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;
