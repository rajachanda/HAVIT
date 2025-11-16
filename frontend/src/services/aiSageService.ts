import { UserData, Habit } from '@/lib/api';

interface AISageResponse {
  insight: string;
  suggested_habit: string;
}

interface UserContext {
  persona: string;
  habits: Array<{
    name: string;
    category: string;
    frequency: string;
    successRate: number;
    streak: number;
  }>;
  streaks: {
    currentStreak: number;
    longestStreak: number;
    consistency: number;
  };
  timePatterns: {
    peakEnergyTime: string;
    chronotype: string;
    dailyTimeAvailable: number;
  };
  missedDays: {
    weakPoints: string[];
    completionRate: number;
  };
  challenges: {
    joined: number;
    completed: number;
  };
  social: {
    type: 'solo' | 'friend' | 'squad';
  };
  whyMatters?: string[];
  mood?: string;
}

/**
 * Analyzes user data and generates personalized insights and habit suggestions using Gemini AI
 */
export async function getAISageInsights(
  userData: UserData,
  habits: Habit[]
): Promise<AISageResponse | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Gemini API key not found, using fallback insights');
    return getFallbackInsights(userData, habits);
  }

  try {
    // Calculate habit statistics
    const today = new Date().toISOString().split('T')[0];
    const habitStats = habits.map((habit) => {
      const completions = habit.completions || [];
      const totalCompletions = completions.filter((c) => c.completed).length;
      const totalDays = completions.length || 1;
      const successRate = Math.round((totalCompletions / totalDays) * 100);

      // Calculate current streak
      let streak = 0;
      const sortedCompletions = [...completions]
        .filter((c) => c.completed)
        .sort((a, b) => b.date.localeCompare(a.date));

      if (sortedCompletions.length > 0) {
        let currentDate = new Date(today);
        for (const completion of sortedCompletions) {
          const completionDate = new Date(completion.date);
          const daysDiff = Math.floor(
            (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff === streak) {
            streak++;
            currentDate = completionDate;
          } else {
            break;
          }
        }
      }

      return {
        name: habit.name,
        category: habit.category,
        frequency: habit.frequency,
        successRate,
        streak,
      };
    });

    // Calculate overall consistency
    const allCompletions = habits.flatMap((h) => h.completions || []);
    const uniqueDates = new Set(allCompletions.map((c) => c.date));
    const completedDates = new Set(
      allCompletions.filter((c) => c.completed).map((c) => c.date)
    );
    const consistency = uniqueDates.size > 0 
      ? Math.round((completedDates.size / uniqueDates.size) * 100) 
      : 0;

    // Determine weak points (days of week with most misses)
    const dayOfWeekMisses: Record<string, number> = {};
    allCompletions.forEach((c) => {
      if (!c.completed) {
        const date = new Date(c.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayOfWeekMisses[dayName] = (dayOfWeekMisses[dayName] || 0) + 1;
      }
    });
    const weakPoints = Object.entries(dayOfWeekMisses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => day);

    // Build user context
    const userContext: UserContext = {
      persona: userData.persona?.personaName || userData.championArchetype || 'Guardian',
      habits: habitStats,
      streaks: {
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
        consistency,
      },
      timePatterns: {
        peakEnergyTime: userData.peakEnergyTime || 'morning',
        chronotype: userData.chronotype || 'balanced',
        dailyTimeAvailable: userData.dailyTimeAvailable || 60,
      },
      missedDays: {
        weakPoints,
        completionRate: consistency,
      },
      challenges: {
        joined: 0, // TODO: Get from challenges collection
        completed: 0,
      },
      social: {
        type: 'solo', // TODO: Determine from user data
      },
    };

    // Call Gemini API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert habit-building coach called "AI Sage" in a habit tracking app.

You analyze real user habit data and give short, actionable, motivating insights.

You suggest one NEW habit tailored to their personality, current routines, and gaps.

USER CONTEXT:

- Persona: ${userContext.persona}

- Completed habits & streak data: 
    - Habits: ${JSON.stringify(userContext.habits)}
    - Streaks: ${JSON.stringify(userContext.streaks)}
    - Time of day patterns: ${JSON.stringify(userContext.timePatterns)}
    - Missed days / weak points: ${JSON.stringify(userContext.missedDays)}
    - Challenges joined/completed: ${JSON.stringify(userContext.challenges)}
    - Social interaction: ${JSON.stringify(userContext.social)}

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const aiResponse: AISageResponse = JSON.parse(jsonMatch[0]);
    return aiResponse;
  } catch (error) {
    console.error('Error calling Gemini API for AI Sage:', error);
    return getFallbackInsights(userData, habits);
  }
}

/**
 * Fallback insights when Gemini API is not available
 */
function getFallbackInsights(
  userData: UserData,
  habits: Habit[]
): AISageResponse {
  const persona = userData.persona?.personaName || userData.championArchetype || 'Guardian';
  const currentStreak = userData.currentStreak || 0;
  const habitCount = habits.length;

  // Simple fallback logic
  if (habitCount === 0) {
    return {
      insight: "You're just getting started! Building your first habit is the hardest step, but you've got this. Every champion starts with a single action.",
      suggested_habit: "Start with a simple 2-minute morning routine—maybe drinking a glass of water or doing 5 deep breaths. Small wins build momentum!",
    };
  }

  if (currentStreak >= 7) {
    return {
      insight: `Wow, you're on a ${currentStreak}-day streak! Your consistency is impressive and shows real commitment. Keep that momentum going!`,
      suggested_habit: "Since you're crushing it, how about adding a complementary habit? If you do morning workouts, try a 5-minute evening stretch to balance your routine.",
    };
  }

  if (currentStreak < 3) {
    return {
      insight: "Building habits takes time, and you're in the early stages. Don't worry about perfection—focus on showing up consistently, even if it's just for 2 minutes.",
      suggested_habit: "Start with a micro-habit you can't fail: something so small it takes less than 2 minutes. Like 'read one page' or 'do 2 push-ups'—build the routine first!",
    };
  }

  return {
    insight: `You're making progress with ${habitCount} active habit${habitCount > 1 ? 's' : ''}! Consistency is key, and you're building that muscle. Keep going!`,
    suggested_habit: "Consider adding a habit that complements your existing ones. If you have physical habits, try a mental one like journaling or meditation.",
  };
}

