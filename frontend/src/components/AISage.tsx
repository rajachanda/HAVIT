import { useState, useEffect } from 'react';
import { Sparkles, X, Lightbulb, RefreshCw, AlertCircle, Plus, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRealtime, useHabits, useChallenges } from '@/hooks/useFirebase';
import { buildUserContext, generateAISageInsights } from '@/services/aiSageService';
import { useNavigate } from 'react-router-dom';
import SparkleEffect from './SparkleEffect';

interface AISageProps {
  className?: string;
}

interface Insight {
  insight: string;
  suggested_habit: string;
}

export const AISage = ({ className }: AISageProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { userData } = useUserRealtime(currentUser?.uid || null);
  const { habits } = useHabits(currentUser?.uid || null);
  const { challenges } = useChallenges(currentUser?.uid || null);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [showHabit, setShowHabit] = useState(false);

  // Fetch insights when expanded
  useEffect(() => {
    if (isExpanded && currentUser && userData && habits && challenges) {
      fetchInsights();
    }
  }, [isExpanded, currentUser?.uid, userData, habits.length, challenges.length]);

  const fetchInsights = async () => {
    if (!currentUser || !userData || !habits || !challenges) return;

    setLoading(true);
    setError(null);

    try {
      const userContext = buildUserContext(userData, habits, challenges);
      const result = await generateAISageInsights(userContext);
      setInsight(result);
      setShowInsight(false);
      setShowHabit(false);
      
      // Animate insights appearing one by one
      setTimeout(() => setShowInsight(true), 300);
      setTimeout(() => setShowHabit(true), 800);
    } catch (err) {
      console.error('Error fetching AI Sage insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = () => {
    if (insight?.suggested_habit) {
      // Navigate with the suggested habit name in state
      navigate('/habits/new', { 
        state: { 
          suggestedHabit: insight.suggested_habit,
          fromAISage: true 
        } 
      });
    } else {
      navigate('/habits/new');
    }
    setIsExpanded(false);
  };

  return (
    <div className={cn("fixed bottom-6 left-[32px] z-50", className)}>
      {!isExpanded ? (
        // Collapsed state - Genie Sage image with glow effect
        <div 
          onClick={() => setIsExpanded(true)}
          className="relative cursor-pointer group transition-all duration-300 hover:scale-110"
        >
          {/* Glowing effect layers */}
          <div className="absolute inset-0 bg-purple-500/40 rounded-full blur-xl animate-pulse" />
          <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Genie Sage Image */}
          {!imageError ? (
            <img
              src="/Genie_sage.png"
              alt="AI Sage"
              className="relative w-24 h-24 object-contain drop-shadow-2xl filter brightness-110 hover:brightness-125 transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.4))',
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="relative w-24 h-24 flex items-center justify-center bg-purple-500/20 rounded-full">
              <Sparkles className="w-12 h-12 text-purple-400" />
            </div>
          )}
          
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center shadow-lg">
            <span className="text-xs font-bold text-white">1</span>
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-foreground text-background px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
              AI Sage
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-foreground"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Expanded state - Genie-style magical interface
        <Card className="relative w-[420px] max-h-[650px] bg-gradient-to-b from-purple-50/50 via-indigo-50/30 to-transparent dark:from-purple-950/50 dark:via-indigo-950/30 dark:to-transparent border-2 border-purple-300/50 dark:border-purple-700/50 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Magical background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-300/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-10 right-10 w-1.5 h-1.5 bg-indigo-300/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <div className="relative z-10">
          {/* Genie Image - Larger and floating */}
          <div className="relative flex justify-center mb-4">
            <SparkleEffect count={5} className="absolute inset-0">
              <div className="relative">
                {!imageError ? (
                  <img
                    src="/Genie_sage.png"
                    alt="AI Sage Genie"
                    className="w-32 h-32 object-contain animate-bounce-slow drop-shadow-2xl"
                    style={{
                      filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 60px rgba(139, 92, 246, 0.6))',
                    }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-purple-500/20 rounded-full animate-bounce-slow">
                    <Sparkles className="w-16 h-16 text-purple-400" />
                  </div>
                )}
                {/* Floating sparkles around genie */}
                <div className="absolute -top-2 -right-2 text-2xl animate-sparkle" style={{ animationDelay: '0s' }}>✨</div>
                <div className="absolute -bottom-2 -left-2 text-xl animate-sparkle" style={{ animationDelay: '1s' }}>⭐</div>
                <div className="absolute top-1/2 -right-4 text-lg animate-sparkle" style={{ animationDelay: '0.5s' }}>💫</div>
              </div>
            </SparkleEffect>
          </div>

          {/* Control buttons - Floating above */}
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
              onClick={fetchInsights}
              disabled={loading}
              title="Ask for new insights"
            >
              <Wand2 className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content area - Speech bubbles/clouds */}
          <div className="flex-1 p-4 overflow-y-auto space-y-6 max-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <Wand2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                </div>
                <p className="text-sm text-foreground font-medium">The genie is reading your habits...</p>
                <p className="text-xs text-muted-foreground mt-1">✨ Magical insights coming soon ✨</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-4">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                  <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
                </div>
                <p className="text-sm text-destructive mb-2 font-medium">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchInsights}
                  className="mt-2"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : insight ? (
              <>
                {/* Insight Speech Bubble/Cloud */}
                {showInsight && (
                  <div className="relative animate-slide-in-down" style={{ animationDelay: '0.2s' }}>
                    {/* Speech bubble tail pointing to genie */}
                    <div className="absolute -bottom-3 left-12 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-white dark:border-t-purple-900/50" />
                    
                    {/* Cloud shape with gradient */}
                    <div className="relative bg-white dark:bg-purple-900/50 rounded-3xl p-5 shadow-2xl border-2 border-purple-200 dark:border-purple-700 backdrop-blur-sm animate-float">
                      {/* Sparkle effects */}
                      <SparkleEffect count={3} className="absolute inset-0 pointer-events-none">
                        <div />
                      </SparkleEffect>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                            💡 Insight
                          </span>
                        </div>
                        <p className="text-sm text-black dark:text-white leading-relaxed font-medium">
                          {insight.insight}
                        </p>
                      </div>
                      
                      {/* Floating particles */}
                      <div className="absolute -top-2 -right-2 text-lg animate-sparkle" style={{ animationDelay: '0s' }}>✨</div>
                      <div className="absolute top-1/2 -left-3 text-base animate-sparkle" style={{ animationDelay: '1.5s' }}>⭐</div>
                    </div>
                  </div>
                )}

                {/* Suggested Habit Speech Bubble/Cloud */}
                {showHabit && (
                  <div className="relative animate-slide-in-down" style={{ animationDelay: '0.6s' }}>
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-3 left-16 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-indigo-100 dark:border-t-indigo-900/50" />
                    
                    {/* Cloud shape with gradient */}
                    <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-3xl p-5 shadow-2xl border-2 border-indigo-200 dark:border-indigo-700 backdrop-blur-sm animate-float" style={{ animationDelay: '0.3s' }}>
                      {/* Sparkle effects */}
                      <SparkleEffect count={4} className="absolute inset-0 pointer-events-none">
                        <div />
                      </SparkleEffect>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                            ✨ Suggestion
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-black dark:text-white mb-4 leading-relaxed">
                          {insight.suggested_habit}
                        </p>
                        <Button
                          onClick={handleAddHabit}
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Grant This Wish ✨
                        </Button>
                      </div>
                      
                      {/* Floating particles */}
                      <div className="absolute -top-2 -left-2 text-lg animate-sparkle" style={{ animationDelay: '0.3s' }}>💫</div>
                      <div className="absolute bottom-2 -right-2 text-base animate-sparkle" style={{ animationDelay: '1.2s' }}>✨</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="relative inline-block mb-4">
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto opacity-50 animate-pulse" />
                  <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl" />
                </div>
                <p className="text-sm text-foreground font-medium mb-1">Ready for wisdom?</p>
                <p className="text-xs text-muted-foreground">Tap the wand to summon insights ✨</p>
              </div>
            )}
          </div>
          </div>
        </Card>
      )}
    </div>
  );
};

