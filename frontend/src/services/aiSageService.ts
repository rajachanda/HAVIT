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
function analyzeChallenges(challenges: Challenge[]): UserContext['challenges'] {
  // Handle both Challenge types (from lib/api.ts and challengesService.ts)
  const active = challenges.filter(c => c.status === 'active').length;
  const completed = challenges.filter(c => 
    ['victory', 'defeated', 'tied', 'completed'].includes(c.status)
  ).length;
  const victories = challenges.filter(c => c.status === 'victory' || (c.status === 'completed' && (c as any).winner === 'user')).length;
  const defeats = challenges.filter(c => c.status === 'defeated' || (c.status === 'completed' && (c as any).winner && (c as any).winner !== 'user')).length;
  
  const hasPVP = challenges.some(c => c.challengeType === 'pvp' || (c.opponentId && c.opponentId !== 'ai-sage'));
  const hasAISage = challenges.some(c => c.challengeType === 'ai-sage' || c.opponentId === 'ai-sage');
  
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
      hasSquad: !!(userData as any).squadId,
      friendChallenges: challenges.filter(c => c.challengeType === 'pvp').length,
      soloHabits: habits.length - challengeStats.active,
    },
    whyMatters: userData.persona?.traits || [],
    mood: (userData as any).mood || undefined,
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

  // Initialize GoogleGenAI with API key (dynamic import)
  const { GoogleGenAI } = await import('@google/genai');
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

1. Based on all of the above, provide ONE positive, specific insight in 1-2 SHORT sentences (max 30 words).

2. Suggest ONE new habit idea that is SIMPLE and CONCISE - a single action, NOT a paragraph. Keep it under 15 words. Make it specific and actionable.

3. Phrase it as a coach, in a friendly, non-judgmental tone.

EXAMPLES:

Insight: "I noticed you crush physical habits but often miss mindfulness."
Suggested Habit: "3-minute breathing exercise before bed"

Insight: "You've built a great morning routine, but evenings are less consistent."
Suggested Habit: "No phone after 9 PM"

Insight: "Your friend challenges spike your motivation—invite someone to join you!"
Suggested Habit: "Start a reading duo with a friend"

IMPORTANT RULES FOR SUGGESTED HABIT:
- Keep it SHORT (under 15 words)
- Make it a simple action, NOT a long description
- NO extra explanation or context
- Just state the habit clearly

OUTPUT FORMAT:

{
  "insight": "short insight (max 30 words)",
  "suggested_habit": "simple habit description (max 15 words)"
}

ONLY output the above JSON object. No markdown, no code blocks, just valid JSON.`;

  try {
    console.log('[AI Sage] Calling Gemini API with model: gemini-2.5-flash');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Extract text from response (simplified like personaGenerator)
    const text = (response as any).text || response.text || '';

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

