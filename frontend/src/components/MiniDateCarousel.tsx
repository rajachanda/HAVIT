import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface MiniDateCarouselProps {
  habits: any[];
  onDateSelect?: (date: string) => void;
}

export default function MiniDateCarousel({ habits, onDateSelect }: MiniDateCarouselProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Generate 3 dates: Yesterday, Today, Tomorrow
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -1; i <= 1; i++) {
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

  const getCompletedCountForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habits.filter(habit => 
      habit.completions?.some((c: any) => c.date === dateStr && c.completed)
    ).length;
  };

  const getTotalHabitsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate >= today) {
      return habits.length;
    }
    
    return habits.filter(habit => 
      habit.completions?.some((c: any) => c.date === dateStr)
    ).length;
  };

  const getDayLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffTime = compareDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  return (
    <div className="flex items-center gap-1.5 justify-center">
      {dates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const isSelected = dateStr === selectedDate;
        const completed = getCompletedCountForDate(date);
        const total = getTotalHabitsForDate(date);
        const isComplete = total > 0 && completed === total;

        return (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            className={`flex-shrink-0 w-14 p-1.5 rounded-lg border transition-all duration-200 ${
              isSelected
                ? 'border-primary bg-primary/10 shadow-md scale-105'
                : isToday(date)
                ? 'border-warning/50 bg-warning/5'
                : 'border-border bg-background/50 hover:border-primary/30 hover:bg-muted/50'
            }`}
          >
            {/* Day Label */}
            <div className={`text-[8px] font-medium mb-0.5 ${
              isSelected ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {getDayLabel(date)}
            </div>

            {/* Date */}
            <div className={`text-sm font-bold mb-0.5 ${
              isSelected ? 'text-primary' : 'text-foreground'
            }`}>
              {date.getDate()}
            </div>

            {/* Status Indicator */}
            <div className="text-[10px]">
              {total > 0 ? (
                isComplete ? (
                  <span className="text-success text-xs">✓</span>
                ) : (
                  <span className="text-muted-foreground text-[9px]">
                    {completed}/{total}
                  </span>
                )
              ) : (
                <span className="text-muted-foreground/30">·</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
