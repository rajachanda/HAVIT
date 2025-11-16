import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Lightbulb, RefreshCw, Plus } from 'lucide-react';
import { UserData, Habit } from '@/lib/api';
import { getAISageInsights } from '@/services/aiSageService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AISageProps {
  userData: UserData | null;
  habits: Habit[];
}

interface AISageData {
  insight: string;
  suggested_habit: string;
}

export function AISage({ userData, habits }: AISageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sageData, setSageData] = useState<AISageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = useCallback(async (isRefresh = false) => {
    if (!userData) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const insights = await getAISageInsights(userData, habits);
      if (insights) {
        setSageData(insights);
      }
    } catch (error) {
      console.error('Error fetching AI Sage insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI Sage insights. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData, habits, toast]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleAddHabit = () => {
    // Navigate to create habit page with suggested habit pre-filled
    navigate('/habits/new', {
      state: {
        suggestedHabit: sageData?.suggested_habit,
      },
    });
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              AI Sage
              <Badge variant="secondary" className="text-xs">
                Analyzing...
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">Gathering insights about your habits</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
      </Card>
    );
  }

  if (!sageData) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              AI Sage
              <Badge variant="secondary" className="text-xs">
                Your Coach
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">Personalized insights & suggestions</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Insight Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
            <Lightbulb className="w-4 h-4" />
            Insight
          </div>
          <p className="text-sm leading-relaxed text-foreground bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg border border-purple-100 dark:border-purple-900">
            {sageData.insight}
          </p>
        </div>

        {/* Suggested Habit Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-4 h-4" />
            Suggested Habit
          </div>
          <div className="bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900">
            <p className="text-sm leading-relaxed text-foreground mb-3">
              {sageData.suggested_habit}
            </p>
            <Button
              size="sm"
              onClick={handleAddHabit}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add This Habit
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

