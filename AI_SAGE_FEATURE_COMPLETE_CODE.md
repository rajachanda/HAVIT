# AI Sage Feature - Complete Code Package

This document contains all the code needed to implement the AI Sage feature in another branch. Follow the instructions carefully.

## 📋 Prerequisites

1. **Install Dependencies**
   ```bash
   npm install @google/genai
   ```

2. **Environment Variables**
   Add to `frontend/.env.local`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Image Asset**
   - Place `Genie_sage.png` in `frontend/public/` directory
   - If you don't have the image, the component will show a fallback icon

---

## 📁 Files to Create/Modify

### 1. **frontend/src/components/AISage.tsx** (NEW FILE)

```typescript
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
```

---

### 2. **frontend/src/services/aiSageService.ts** (NEW FILE)

```typescript
import { GoogleGenAI } from '@google/genai';
import { UserData, Habit } from '@/lib/api';
import { Challenge } from './challengesService';

interface AISageInsight {
  insight: string;
  suggested_habit: string;
}

interface UserContext {
  persona: {
    personaName?: string;
    archetype?: string;
    traits?: string[];
    coachingStyle?: string;
  } | null;
  habits: Array<{
    name: string;
    category: string;
    frequency: string;
    successRate: number;
    streak: number;
    reminderTime?: string;
    completions: Array<{ date: string; completed: boolean }>;
  }>;
  streaks: {
    currentStreak: number;
    longestStreak: number;
  };
  timePatterns: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  missedDays: string[];
  challenges: {
    active: number;
    completed: number;
    victories: number;
    defeats: number;
    type: 'pvp' | 'ai-sage' | 'solo';
  };
  social: {
    hasSquad: boolean;
    friendChallenges: number;
    soloHabits: number;
  };
  whyMatters?: string[];
  mood?: string;
}

/**
 * Analyze habits to calculate success rates and patterns
 */
function analyzeHabits(habits: Habit[]): {
  habitsWithStats: UserContext['habits'];
  timePatterns: UserContext['timePatterns'];
  missedDays: string[];
} {
  const habitsWithStats = habits.map(habit => {
    const completions = habit.completions || [];
    const completed = completions.filter(c => c.completed).length;
    const total = completions.length;
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    
    // Calculate current streak
    let streak = 0;
    const sortedCompletions = [...completions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const comp of sortedCompletions) {
      if (comp.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return {
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      successRate: Math.round(successRate),
      streak,
      reminderTime: habit.reminderTime,
      completions: habit.completions || [],
    };
  });

  // Analyze time patterns
  const timePatterns = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  habits.forEach(habit => {
    if (habit.reminderTime) {
      const hour = parseInt(habit.reminderTime.split(':')[0]);
      if (hour >= 5 && hour < 12) timePatterns.morning++;
      else if (hour >= 12 && hour < 17) timePatterns.afternoon++;
      else if (hour >= 17 && hour < 21) timePatterns.evening++;
      else timePatterns.night++;
    }
  });

  // Analyze missed days (days of week where habits are most missed)
  const missedDaysMap: Record<string, number> = {};
  habits.forEach(habit => {
    habit.completions?.forEach(comp => {
      if (!comp.completed) {
        const date = new Date(comp.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        missedDaysMap[dayName] = (missedDaysMap[dayName] || 0) + 1;
      }
    });
  });

  const missedDays = Object.entries(missedDaysMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => day);

  return { habitsWithStats, timePatterns, missedDays };
}

/**
 * Analyze challenges to get statistics
 */
function analyzeChallenges(challenges: any[]): UserContext['challenges'] {
  // Handle both Challenge types (from lib/api.ts and challengesService.ts)
  const active = challenges.filter(c => c.status === 'active').length;
  const completed = challenges.filter(c => 
    ['victory', 'defeated', 'tied', 'completed'].includes(c.status)
  ).length;
  const victories = challenges.filter(c => c.status === 'victory' || (c.status === 'completed' && c.winner === 'user')).length;
  const defeats = challenges.filter(c => c.status === 'defeated' || (c.status === 'completed' && c.winner && c.winner !== 'user')).length;
  
  const hasPVP = challenges.some(c => (c as any).challengeType === 'pvp' || (c.initiatorId && c.opponentId && c.opponentId !== 'ai-sage'));
  const hasAISage = challenges.some(c => (c as any).challengeType === 'ai-sage' || c.opponentId === 'ai-sage');
  
  let type: 'pvp' | 'ai-sage' | 'solo' = 'solo';
  if (hasPVP) type = 'pvp';
  else if (hasAISage) type = 'ai-sage';

  return {
    active,
    completed,
    victories,
    defeats,
    type,
  };
}

/**
 * Build user context from Firestore data
 */
export function buildUserContext(
  userData: UserData,
  habits: Habit[],
  challenges: Challenge[]
): UserContext {
  const { habitsWithStats, timePatterns, missedDays } = analyzeHabits(habits);
  const challengeStats = analyzeChallenges(challenges);

  return {
    persona: userData.persona || null,
    habits: habitsWithStats,
    streaks: {
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0,
    },
    timePatterns,
    missedDays,
    challenges: challengeStats,
    social: {
      hasSquad: false, // TODO: Add squad detection
      friendChallenges: challenges.filter(c => c.challengeType === 'pvp').length,
      soloHabits: habits.length - challengeStats.active,
    },
    whyMatters: userData.persona?.recommendedHabits || [],
    mood: undefined, // TODO: Add mood tracking if available
  };
}

/**
 * Generate AI Sage insights using Gemini API
 */
export async function generateAISageInsights(
  userContext: UserContext
): Promise<AISageInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Initialize GoogleGenAI with API key
  const ai = new GoogleGenAI({ apiKey });
  
  console.log('[AI Sage] Generating insights with context:', {
    persona: userContext.persona?.personaName,
    habitsCount: userContext.habits.length,
    challengesCount: userContext.challenges.active + userContext.challenges.completed,
  });

  // Build the prompt
  const personaName = userContext.persona?.personaName || userContext.persona?.archetype || 'User';
  const personaType = userContext.persona?.archetype || 'General User';
  
  const habitsList = userContext.habits.map(h => 
    `- ${h.name} (${h.category}): ${h.successRate}% success, ${h.streak} day streak, ${h.frequency}`
  ).join('\n    ');

  const timePatternsStr = Object.entries(userContext.timePatterns)
    .filter(([_, count]) => count > 0)
    .map(([time, count]) => `${time}: ${count} habits`)
    .join(', ');

  const prompt = `You are an expert habit-building coach called "AI Sage" in a habit tracking app.

You analyze real user habit data and give short, actionable, motivating insights.

You suggest one NEW habit tailored to their personality, current routines, and gaps.

USER CONTEXT:

- Persona: ${personaName} (${personaType})
${userContext.persona?.traits ? `- Traits: ${userContext.persona.traits.join(', ')}` : ''}
${userContext.persona?.coachingStyle ? `- Coaching Style: ${userContext.persona.coachingStyle}` : ''}

- Completed habits & streak data:
    - Habits: ${habitsList || 'No habits yet'}
    - Current Streak: ${userContext.streaks.currentStreak} days
    - Longest Streak: ${userContext.streaks.longestStreak} days
    - Time of day patterns: ${timePatternsStr || 'No clear pattern'}
    - Missed days / weak points: ${userContext.missedDays.length > 0 ? userContext.missedDays.join(', ') : 'None identified'}

- Challenges joined/completed:
    - Active: ${userContext.challenges.active}
    - Completed: ${userContext.challenges.completed}
    - Victories: ${userContext.challenges.victories}
    - Defeats: ${userContext.challenges.defeats}
    - Type: ${userContext.challenges.type}

- Social interaction:
    - Friend challenges: ${userContext.social.friendChallenges}
    - Solo habits: ${userContext.social.soloHabits}
    ${userContext.social.hasSquad ? '- Has squad/team' : '- Solo user'}

${userContext.whyMatters && userContext.whyMatters.length > 0 ? `- "Why it matters" answers: ${userContext.whyMatters.join(', ')}` : ''}
${userContext.mood ? `- Recent emotional state: ${userContext.mood}` : ''}

YOUR TASK:

1. Based on all of the above, provide ONE positive, specific insight in 2 sentences.

2. Suggest ONE new habit idea that fits their personality, goals, and gaps—not generic, but based on the data.

3. Phrase it as a coach, in a friendly, non-judgmental tone.

EXAMPLES:

- "I noticed you crush physical habits but often miss mindfulness. How about adding a 3-min breath exercise? That will round out your streak!"

- "You've built a great morning routine, but evenings are less consistent. Want to try a quick 'no-phone after 9PM' challenge next week?"

- "Your friend challenges spike your motivation—what if you invite a friend for a reading duo habit this month?"

OUTPUT FORMAT:

{
  "insight": "...",
  "suggested_habit": "..."
}

ONLY output the above JSON object. No markdown, no code blocks, just valid JSON.`;

  try {
    console.log('[AI Sage] Calling Gemini API with model: gemini-2.5-flash');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.log('[AI Sage] Response type:', typeof response);
    console.log('[AI Sage] Response keys:', response ? Object.keys(response) : 'null');
    console.log('[AI Sage] Full response:', JSON.stringify(response, null, 2));
    
    // Extract text from response
    let text = '';
    
    // Method 1: Direct text property
    if (response && (response as any).text) {
      text = (response as any).text;
      console.log('[AI Sage] Found text via response.text');
    }
    // Method 2: String response
    else if (typeof response === 'string') {
      text = response;
      console.log('[AI Sage] Response is a string');
    }
    // Method 3: Candidates array (standard Gemini API format)
    else if (response && (response as any).candidates && Array.isArray((response as any).candidates)) {
      const candidate = (response as any).candidates[0];
      if (candidate?.content?.parts) {
        text = candidate.content.parts
          .map((part: any) => part.text || '')
          .join('');
        console.log('[AI Sage] Found text via candidates[0].content.parts');
      } else if (candidate?.text) {
        text = candidate.text;
        console.log('[AI Sage] Found text via candidates[0].text');
      }
    }
    // Method 4: Nested response object
    else if (response && (response as any).response) {
      const innerResponse = (response as any).response;
      if (typeof innerResponse.text === 'function') {
        text = innerResponse.text();
        console.log('[AI Sage] Found text via response.response.text()');
      } else if (typeof innerResponse.text === 'string') {
        text = innerResponse.text;
        console.log('[AI Sage] Found text via response.response.text');
      }
    }

    console.log('[AI Sage] Extracted text length:', text.length);
    console.log('[AI Sage] Extracted text preview:', text.substring(0, 200));

    if (!text) {
      console.error('[AI Sage] No text found in response. Full response:', JSON.stringify(response, null, 2));
      throw new Error('No text content found in Gemini response');
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI Sage] No JSON found in text:', text);
      throw new Error('No JSON found in Gemini response. Response: ' + text.substring(0, 200));
    }

    const insight: AISageInsight = JSON.parse(jsonMatch[0]);
    console.log('[AI Sage] Parsed insight:', insight);
    return insight;
  } catch (error) {
    console.error('[AI Sage] Error generating insights:', error);
    if (error instanceof Error) {
      console.error('[AI Sage] Error message:', error.message);
      console.error('[AI Sage] Error stack:', error.stack);
    }
    throw error;
  }
}
```

---

### 3. **frontend/src/components/SparkleEffect.tsx** (NEW FILE - if not exists)

```typescript
import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  top: number;
  left: number;
  delay: number;
  size: number;
}

interface SparkleEffectProps {
  children: React.ReactNode;
  count?: number;
  className?: string;
}

const SparkleEffect = ({ children, count = 3, className = '' }: SparkleEffectProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        size: 12 + Math.random() * 8,
      }));
    };

    setSparkles(generateSparkles());

    // Regenerate sparkles periodically
    const interval = setInterval(() => {
      setSparkles(generateSparkles());
    }, 3000);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className={`relative ${className}`}>
      {children}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none text-yellow-400 animate-sparkle"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
            fontSize: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

export default SparkleEffect;
```

---

### 4. **frontend/src/components/Dashboard.tsx** (MODIFY - Add import and component)

**Add this import at the top:**
```typescript
import { AISage } from "./AISage";
```

**Add this component at the end of the return statement (before closing div):**
```typescript
      {/* AI Sage - Bottom Left Floating Assistant */}
      <AISage />
```

**Full context - Add before the closing `</div>` of the main return:**
```typescript
      </div>

      {/* AI Sage - Bottom Left Floating Assistant */}
      <AISage />
    </div>
  );
};
```

---

### 5. **frontend/src/pages/AddHabitForm.tsx** (MODIFY - Add AI Sage integration)

**Add this import:**
```typescript
import { useLocation } from 'react-router-dom';
```

**Add these state variables after the `useNavigate` hook:**
```typescript
const location = useLocation();

// Check if coming from AI Sage with suggested habit
const suggestedHabit = (location.state as any)?.suggestedHabit || '';
const fromAISage = (location.state as any)?.fromAISage || false;

// Start at step 1 (Schedule - time/frequency) if coming from AI Sage, otherwise step 0
const [currentStep, setCurrentStep] = useState(fromAISage ? 1 : 0);
```

**Update the formData initialization:**
```typescript
const [formData, setFormData] = useState<HabitFormData>({
  name: suggestedHabit || '',
  category: 'Health',
  difficulty: 'medium',
  frequency: 'daily',
  minHabit: 5,
  reminderTime: '09:00',
  whyItMatters: '',
  accountability: 'private',
  streakGoal: 7,
});
```

**Add this useEffect after formData:**
```typescript
// Update form data when suggested habit is provided
useEffect(() => {
  if (suggestedHabit && !formData.name) {
    setFormData(prev => ({ ...prev, name: suggestedHabit }));
  }
}, [suggestedHabit]);
```

**Modify the `handleNext` function to skip motivation step when from AI Sage:**
```typescript
const handleNext = () => {
  // Validation
  if (currentStep === 0) {
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please give your habit a name',
        variant: 'destructive',
      });
      return;
    }
  }
  
  // Skip validation for step 1 if coming from AI Sage (name already filled)
  if (currentStep === 1 && fromAISage) {
    // Just proceed to next step
  }

  if (currentStep === 2) {
    if (!formData.whyItMatters.trim()) {
      toast({
        title: 'Motivation required',
        description: 'Tell us why this habit matters to you',
        variant: 'destructive',
      });
      return;
    }
  }

  // If coming from AI Sage and on step 1 (Schedule), skip to save (skip motivation step)
  if (fromAISage && currentStep === 1) {
    handleSave();
    return;
  }
  
  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1);
  } else {
    handleSave();
  }
};
```

**In the `renderStep` function, add this in case 1 (Schedule step):**
```typescript
case 1:
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* Show habit name if coming from AI Sage - Genie-style card with darker theme */}
      {fromAISage && formData.name && (
        <div className="relative bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-purple-800/90 dark:from-purple-950/95 dark:via-indigo-950/90 dark:to-purple-900/95 border-2 border-purple-500/50 dark:border-purple-400/40 rounded-2xl p-5 mb-6 shadow-2xl backdrop-blur-sm">
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-1 text-lg animate-sparkle" style={{ animationDelay: '0s' }}>✨</div>
          <div className="absolute -bottom-1 -left-1 text-base animate-sparkle" style={{ animationDelay: '1s' }}>⭐</div>
          
          {/* Glowing effect */}
          <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-300 dark:text-purple-200 animate-pulse" />
              <Label className="text-sm font-semibold text-purple-200 dark:text-purple-100 uppercase tracking-wide">
                ✨ AI Sage Suggested Habit
              </Label>
            </div>
            <p className="text-base font-semibold text-white dark:text-purple-50 mb-3 leading-relaxed">
              {formData.name}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-purple-200 dark:text-purple-100 hover:text-white dark:hover:text-purple-50 hover:bg-purple-800/50 dark:hover:bg-purple-800/50"
              onClick={() => {
                setFormData({ ...formData, name: '' });
                setCurrentStep(0);
              }}
            >
              Change name
            </Button>
          </div>
        </div>
      )}
      {/* Frequency */}
      <div className="space-y-3">
        {/* ... rest of the frequency form ... */}
```

**Hide the Sage Comment card when coming from AI Sage (find the Sage Comment section and wrap it):**
```typescript
{/* Sage Comment - Hide when coming from AI Sage (we show the suggestion card instead) */}
{!fromAISage && (
  <Card className="mb-8 p-4 bg-primary/10 border-primary/20">
    <div className="flex items-start gap-3">
      <Sparkles className="w-6 h-6 text-primary mt-1" />
      <div>
        <p className="text-sm font-medium text-primary mb-1">Sage AI</p>
        <p className="text-sm text-muted-foreground">{getSageComment()}</p>
      </div>
    </div>
  </Card>
)}
```

---

### 6. **frontend/src/index.css** (MODIFY - Add animations)

**Add these CSS animations at the end of the file:**

```css
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
```

**Make sure these animations already exist (if not, add them):**
```css
.animate-sparkle {
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

.animate-bounce-slow {
  animation: bounceSlow 4s ease-in-out infinite;
}

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-slide-in-down {
  animation: slideInDown 0.8s ease-out backwards;
}

@keyframes slideInDown {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 7. **frontend/package.json** (MODIFY - Add dependency)

**Add to dependencies:**
```json
"@google/genai": "^1.29.1"
```

**Then run:**
```bash
npm install
```

---

## ✅ Checklist

- [ ] Install `@google/genai` package
- [ ] Add `VITE_GEMINI_API_KEY` to `.env.local`
- [ ] Create `AISage.tsx` component
- [ ] Create `aiSageService.ts` service
- [ ] Create/verify `SparkleEffect.tsx` component
- [ ] Add `AISage` to `Dashboard.tsx`
- [ ] Modify `AddHabitForm.tsx` for AI Sage integration
- [ ] Add CSS animations to `index.css`
- [ ] Place `Genie_sage.png` in `public/` folder
- [ ] Test the feature

---

## 🐛 Common Issues & Fixes

1. **"Gemini API key not configured"**
   - Check `.env.local` has `VITE_GEMINI_API_KEY`
   - Restart dev server after adding env var

2. **"Cannot find module '@google/genai'"**
   - Run `npm install @google/genai`

3. **"Cannot find module './SparkleEffect'"**
   - Create `SparkleEffect.tsx` component

4. **"useChallenges hook not found"**
   - Make sure you have `useChallenges` hook in `@/hooks/useFirebase`
   - If not, create it or modify `AISage.tsx` to use your challenge hook

5. **Image not showing**
   - Verify `Genie_sage.png` is in `frontend/public/`
   - Check browser console for 404 errors

6. **Type errors with Challenge**
   - Make sure `Challenge` type is imported from `./challengesService`
   - Adjust import if your Challenge type is in a different location

---

## 📝 Notes

- The AI Sage component appears in the bottom-left corner of the Dashboard
- It uses Gemini 2.5 Flash model for fast responses
- The component automatically fetches insights when expanded
- Clicking "Grant This Wish" navigates to the habit form with pre-filled name
- The form skips the motivation step when coming from AI Sage

---

## 🎨 Customization

- **Position**: Change `left-[32px]` in `AISage.tsx` to adjust horizontal position
- **Size**: Modify `w-[420px]` for card width, `w-24 h-24` for genie image
- **Colors**: Update purple/indigo gradient classes to match your theme
- **Model**: Change `gemini-2.5-flash` to another model if needed

---

**Good luck! 🚀**

