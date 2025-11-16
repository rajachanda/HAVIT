import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

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
      scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Auto-scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayIndex = dates.findIndex(d => d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
      const scrollPosition = todayIndex * 64 - 160;
      scrollRef.current.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
    }
  }, []);

  const getCompletedCountForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habits.filter(habit => 
      habit.completions?.some((c: any) => c.date === dateStr && c.completed)
    ).length;
  };

  const getTotalHabitsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    // For today and future dates, show all habits
    // For past dates, show habits that had entries
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

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  return (
    <div className="p-3">
      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm hover:bg-muted shadow-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Date Cards */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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
                className={`flex-shrink-0 w-14 h-18 p-2 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md scale-105'
                    : isToday(date)
                    ? 'border-warning/50 bg-warning/5'
                    : 'border-border bg-background/50 hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                {/* Day Name */}
                <div className={`text-[10px] font-medium mb-0.5 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {getDayName(date)}
                </div>

                {/* Date */}
                <div className={`text-xl font-bold mb-1 ${
                  isSelected ? 'text-primary' : 'text-foreground'
                }`}>
                  {date.getDate()}
                </div>

                {/* Status Indicator */}
                <div className="text-sm">
                  {total > 0 ? (
                    isComplete ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-muted-foreground">○</span>
                    )
                  ) : (
                    <span className="text-muted-foreground/30">·</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm hover:bg-muted shadow-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
