import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface DateCarouselProps {
  habits: any[];
  onDateSelect?: (date: string) => void;
}

export default function DateCarousel({ habits, onDateSelect }: DateCarouselProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate array of dates (7 days before, today, 7 days after)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const dates = generateDates();

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    onDateSelect?.(dateStr);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Auto-scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayIndex = dates.findIndex(d => d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
      const scrollPosition = todayIndex * 120 - 200;
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, []);

  const getHabitsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habits.filter(habit => 
      habit.completions?.some((c: any) => c.date === dateStr)
    );
  };

  const getCompletedCountForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habits.filter(habit => 
      habit.completions?.some((c: any) => c.date === dateStr && c.completed)
    ).length;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffTime = compareDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const selectedDateObj = dates.find(d => d.toISOString().split('T')[0] === selectedDate);
  const selectedHabits = selectedDateObj ? getHabitsForDate(selectedDateObj) : [];
  const completedCount = selectedDateObj ? getCompletedCountForDate(selectedDateObj) : 0;

  return (
    <Card className="bg-card border-border p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          📅 Daily Overview
        </h2>
        {selectedDateObj && (
          <Badge variant="outline" className="text-base">
            {formatDate(selectedDateObj)}
          </Badge>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
          onClick={scrollLeft}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Date Cards */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-12"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const completed = getCompletedCountForDate(date);
            const total = getHabitsForDate(date).length;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`flex-shrink-0 w-28 p-4 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                    : isToday(date)
                    ? 'border-warning bg-warning/5'
                    : 'border-border bg-background/50 hover:border-primary/50 hover:bg-muted'
                }`}
              >
                {/* Day Name */}
                <div className={`text-sm font-medium mb-1 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {getDayName(date)}
                </div>

                {/* Date */}
                <div className={`text-2xl font-bold mb-2 ${
                  isSelected ? 'text-primary' : 'text-foreground'
                }`}>
                  {date.getDate()}
                </div>

                {/* Today Badge */}
                {isToday(date) && !isSelected && (
                  <Badge className="mb-2 text-xs bg-warning text-warning-foreground">
                    Today
                  </Badge>
                )}

                {/* Completion Indicator */}
                {total > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <span className="font-semibold text-success">{completed}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{total}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          completionRate === 100 ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>

                    {/* Percentage */}
                    {completionRate === 100 && (
                      <div className="text-xs font-bold text-success">✓</div>
                    )}
                  </div>
                )}

                {/* No habits indicator */}
                {total === 0 && isPast(date) && (
                  <div className="text-xs text-muted-foreground">
                    No data
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
          onClick={scrollRight}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Selected Date Summary */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg text-foreground">
            {selectedDateObj && formatDate(selectedDateObj)}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={completedCount === habits.length && habits.length > 0 ? "default" : "secondary"}>
              {completedCount} / {habits.length} completed
            </Badge>
          </div>
        </div>

        {/* Habit Pills */}
        <div className="flex flex-wrap gap-2">
          {selectedHabits.length > 0 ? (
            selectedHabits.map((habit, idx) => {
              const isCompleted = habit.completions?.some(
                (c: any) => c.date === selectedDate && c.completed
              );
              return (
                <Badge
                  key={idx}
                  variant={isCompleted ? "default" : "outline"}
                  className={`${
                    isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-background'
                  }`}
                >
                  {isCompleted ? '✓' : '○'} {habit.name}
                </Badge>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              {isPast(selectedDateObj!) 
                ? 'No habits tracked on this date' 
                : 'No habits scheduled for this date'}
            </p>
          )}
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Card>
  );
}
