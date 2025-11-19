interface PersonaInput {
  universalAnswers?: any;
  branch?: string;
  branchResponses?: Record<string, any>;
  // New gamified format
  motivation?: string;
  dreamJourney?: string[];
  losesMomentum?: string;
  topMotivators?: string[];
  weekFeeling?: string;
  pushOrProtect?: string;
  comparisonResponse?: string;
  missResponse?: string;
}

interface Persona {
  personaName: string;
  archetype: string;
  strengths: string[];
  challenges: string[];
  recommendedHabits: string[];
  sageBehavior: {
    tone: string;
    frequency: number;
    topics: string[];
    motivationLever: string;
  };
  retentionStrategy: string;
  churnRisks: string[];
  interventionStrategy: string;
}

export async function generatePersona(input: PersonaInput): Promise<Persona> {
  // Check if it's the new gamified format
  if (input.motivation || input.dreamJourney) {
    return generateGamifiedPersona(input);
  }
  
  // Legacy format
  const { universalAnswers, branch, branchResponses } = input;

  // Use Gemini API for persona generation or fallback to rule-based
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      return await generateWithGemini(input, apiKey);
    } catch (error) {
      console.error('Gemini API error, using fallback:', error);
      return generateFallbackPersona(input);
    }
  }

  return generateFallbackPersona(input);
}

function generateGamifiedPersona(input: PersonaInput): Persona {
  const {
    motivation,
    dreamJourney = [],
    losesMomentum,
    topMotivators = [],
    weekFeeling,
    pushOrProtect,
    comparisonResponse,
    missResponse,
  } = input;

  // Determine archetype based on answers
  let archetype = 'Guardian';
  let personaName = 'The Steady Guardian';
  let tone = 'supportive';
  let motivationLever = 'consistency';

  // Competitive/Warrior persona
  if (
    motivation === 'challenge' ||
    dreamJourney.includes('rival') ||
    comparisonResponse === 'motivated' ||
    topMotivators.includes('competition') ||
    pushOrProtect === 'push'
  ) {
    archetype = 'Warrior';
    personaName = 'The Relentless Warrior';
    tone = 'aggressive';
    motivationLever = 'winning';
  }
  // Analytical/Mage persona
  else if (
    dreamJourney.includes('charts') ||
    losesMomentum === 'why' ||
    topMotivators.includes('progress') ||
    weekFeeling === 'smarter'
  ) {
    archetype = 'Mage';
    personaName = 'The Wise Mage';
    tone = 'evidence-based';
    motivationLever = 'understanding';
  }
  // Social/Bard persona
  else if (
    motivation === 'support' ||
    dreamJourney.includes('squad') ||
    topMotivators.includes('team') ||
    weekFeeling === 'supported'
  ) {
    archetype = 'Bard';
    personaName = 'The Social Bard';
    tone = 'warm';
    motivationLever = 'community';
  }
  // Adventurous/Rogue persona
  else if (
    dreamJourney.includes('achievements') ||
    dreamJourney.includes('quests') ||
    weekFeeling === 'surprised' ||
    topMotivators.includes('creativity')
  ) {
    archetype = 'Rogue';
    personaName = 'The Adventurous Rogue';
    tone = 'playful';
    motivationLever = 'discovery';
  }
  // Gentle/Healer persona
  else if (
    pushOrProtect === 'protect' ||
    missResponse === 'nudge' ||
    weekFeeling === 'calm' ||
    losesMomentum === 'let-go'
  ) {
    archetype = 'Healer';
    personaName = 'The Gentle Healer';
    tone = 'gentle';
    motivationLever = 'self-care';
  }

  const strengthsMap: Record<string, string[]> = {
    Warrior: ['Highly competitive', 'Goal-oriented', 'Resilient under pressure'],
    Mage: ['Strategic thinker', 'Data-driven', 'Problem solver'],
    Bard: ['Team player', 'Supportive', 'Community-focused'],
    Rogue: ['Adaptable', 'Creative', 'Enjoys variety'],
    Healer: ['Self-aware', 'Balanced', 'Mindful'],
    Guardian: ['Consistent', 'Reliable', 'Steady'],
  };

  const challengesMap: Record<string, string[]> = {
    Warrior: ['Can burn out from overexertion', 'May struggle with rest days'],
    Mage: ['Analysis paralysis', 'Can overthink simple tasks'],
    Bard: ['Relies too heavily on external validation', 'Struggles alone'],
    Rogue: ['May lose focus without novelty', 'Can be inconsistent'],
    Healer: ['May avoid pushing boundaries', 'Risk of complacency'],
    Guardian: ['May resist change', 'Can be too rigid'],
  };

  const habitsMap: Record<string, string[]> = {
    Warrior: ['Set daily challenges', 'Track personal records', 'Compete in leaderboards'],
    Mage: ['Analyze habit patterns', 'Set data-driven goals', 'Track multiple metrics'],
    Bard: ['Join squad challenges', 'Share progress', 'Support others'],
    Rogue: ['Try habit variations', 'Unlock achievements', 'Complete daily quests'],
    Healer: ['Practice mindfulness', 'Set gentle reminders', 'Focus on well-being'],
    Guardian: ['Build streaks', 'Follow routines', 'Track consistency'],
  };

  const churnRisksMap: Record<string, string[]> = {
    Warrior: ['No competitive challenges', 'Lack of progress feedback'],
    Mage: ['Insufficient data/insights', 'Too simplistic'],
    Bard: ['Feeling isolated', 'No community engagement'],
    Rogue: ['Repetitive tasks', 'No new features'],
    Healer: ['Too aggressive notifications', 'Overwhelming goals'],
    Guardian: ['Breaking streaks', 'Unclear structure'],
  };

  return {
    personaName,
    archetype,
    strengths: strengthsMap[archetype] || strengthsMap.Guardian,
    challenges: challengesMap[archetype] || challengesMap.Guardian,
    recommendedHabits: habitsMap[archetype] || habitsMap.Guardian,
    sageBehavior: {
      tone,
      frequency: missResponse === 'alone' ? 3 : 6,
      topics: topMotivators.length > 0 ? topMotivators : ['progress', 'consistency'],
      motivationLever,
    },
    retentionStrategy: `Focus on ${motivationLever} and ${archetype.toLowerCase()}-specific features`,
    churnRisks: churnRisksMap[archetype] || churnRisksMap.Guardian,
    interventionStrategy:
      missResponse === 'hype'
        ? 'Send motivational boost messages'
        : missResponse === 'nudge'
        ? 'Send gentle reminder with encouragement'
        : missResponse === 'suggest'
        ? 'Offer simplified routine options'
        : 'Wait for user to return, send one check-in after 7 days',
  };
}

async function generateWithGemini(input: PersonaInput, apiKey: string): Promise<Persona> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Analyze these user responses and create a detailed persona for HAVIT habit tracker:

Phase 2 Universal Responses:
- Struggles: ${input.universalAnswers.struggles}
- Fun preference: ${input.universalAnswers.funPreference}
- Miss response: ${input.universalAnswers.missResponse}
- Top motivators: ${JSON.stringify(input.universalAnswers.topMotivators)}
- Success feeling: ${input.universalAnswers.successFeeling}

Branch: ${input.branch}

Branch responses:
${JSON.stringify(input.branchResponses, null, 2)}

Generate JSON response with EXACTLY this structure (valid JSON only, no markdown):
{
  "personaName": "Creative name based on profile (e.g., 'The Relentless Competitor')",
  "archetype": "${input.branch.toLowerCase().replace(/_/g, '-')}",
  "strengths": ["strength1", "strength2", "strength3"],
  "challenges": ["challenge1", "challenge2"],
  "recommendedHabits": ["habit1", "habit2", "habit3"],
  "sageBehavior": {
    "tone": "aggressive|evidence-based|warm|subtle|encouraging|supportive",
    "frequency": 6,
    "topics": ["topic1", "topic2"],
    "motivationLever": "winning|understanding|community|growth|encouragement|proof"
  },
  "retentionStrategy": "What specific feature will keep them engaged?",
  "churnRisks": ["risk1", "risk2"],
  "interventionStrategy": "How to re-engage if they go inactive"
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text || (response as any).text || '';

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Gemini response');
  }

  const persona: Persona = JSON.parse(jsonMatch[0]);
  return persona;
}

function generateFallbackPersona(input: PersonaInput): Persona {
  const { branch, universalAnswers } = input;

  const personaMap: Record<string, Partial<Persona>> = {
    RELENTLESS_COMPETITOR: {
      personaName: 'The Relentless Competitor',
      archetype: 'competitor',
      strengths: ['Highly motivated by competition', 'Thrives under pressure', 'Goal-oriented mindset'],
      challenges: ['May burnout from constant competition', 'Can be discouraged by losses'],
      recommendedHabits: ['Daily workout challenges', 'Compete with friends', 'Track personal records'],
      sageBehavior: {
        tone: 'aggressive',
        frequency: 7,
        topics: ['competition stats', 'leaderboard position', 'challenge updates'],
        motivationLever: 'winning',
      },
      retentionStrategy: 'Real-time leaderboards and daily challenges with friends',
      churnRisks: ['Losing too many challenges', 'No worthy opponents'],
      interventionStrategy: 'Send competitive challenge invites from similar-level users',
    },
    THOUGHTFUL_ANALYST: {
      personaName: 'The Thoughtful Analyst',
      archetype: 'analyst',
      strengths: ['Data-driven decision making', 'Learns from failures', 'Strategic planning'],
      challenges: ['May overthink instead of acting', 'Analysis paralysis'],
      recommendedHabits: ['Weekly habit review', 'Experiment with routines', 'Track mood & habits'],
      sageBehavior: {
        tone: 'evidence-based',
        frequency: 5,
        topics: ['habit analytics', 'pattern insights', 'optimization tips'],
        motivationLever: 'understanding',
      },
      retentionStrategy: 'Detailed analytics dashboards and A/B testing features',
      churnRisks: ['Not enough data insights', 'Too basic tracking'],
      interventionStrategy: 'Send personalized weekly reports with deep insights',
    },
    SOCIAL_BUTTERFLY: {
      personaName: 'The Social Butterfly',
      archetype: 'social',
      strengths: ['Motivated by community', 'Helps others succeed', 'Builds strong connections'],
      challenges: ['May depend too much on others', 'Discouraged if squad is inactive'],
      recommendedHabits: ['Join squad challenges', 'Support friends daily', 'Share progress'],
      sageBehavior: {
        tone: 'warm',
        frequency: 8,
        topics: ['friend achievements', 'squad updates', 'community highlights'],
        motivationLever: 'community',
      },
      retentionStrategy: 'Active community features and squad-based challenges',
      churnRisks: ['Friends stop using app', 'Feeling isolated'],
      interventionStrategy: 'Connect them with active squads and send friend activity highlights',
    },
    INTERNAL_ACHIEVER: {
      personaName: 'The Internal Achiever',
      archetype: 'achiever',
      strengths: ['Self-motivated', 'Values personal growth', 'Reflective mindset'],
      challenges: ['May lack external motivation', 'Can be too private'],
      recommendedHabits: ['Daily journaling', 'Personal milestones', 'Reflection time'],
      sageBehavior: {
        tone: 'subtle',
        frequency: 4,
        topics: ['personal growth', 'reflection prompts', 'private achievements'],
        motivationLever: 'growth',
      },
      retentionStrategy: 'Private journaling and personal milestone tracking',
      churnRisks: ['Feeling unmotivated alone', 'No visible progress'],
      interventionStrategy: 'Send gentle reflection prompts and growth visualizations',
    },
    OVERWHELMED_BEGINNER: {
      personaName: 'The Overwhelmed Beginner',
      archetype: 'beginner',
      strengths: ['Willing to learn', 'Open to guidance', 'Values simplicity'],
      challenges: ['Easily overwhelmed', 'May quit early', 'Low confidence'],
      recommendedHabits: ['One tiny habit daily', 'Morning stretch', 'Drink water reminder'],
      sageBehavior: {
        tone: 'encouraging',
        frequency: 9,
        topics: ['daily encouragement', 'small wins', 'simplification tips'],
        motivationLever: 'encouragement',
      },
      retentionStrategy: 'Extremely simple onboarding and daily micro-wins',
      churnRisks: ['Too many options', 'Early failure', 'Complexity'],
      interventionStrategy: 'Send daily encouragement and suggest easier versions of failed habits',
    },
    COMEBACK_PLAYER: {
      personaName: 'The Comeback Player',
      archetype: 'comeback',
      strengths: ['Resilient mindset', 'Has comeback experience', 'Learns from setbacks'],
      challenges: ['Inconsistent engagement', 'May take long breaks'],
      recommendedHabits: ['Restart ritual', 'Flexible goals', 'Progress tracking'],
      sageBehavior: {
        tone: 'supportive',
        frequency: 6,
        topics: ['comeback motivation', 'progress reminders', 'flexible goals'],
        motivationLever: 'proof',
      },
      retentionStrategy: 'Comeback badges and visible progress history',
      churnRisks: ['Long inactivity periods', 'Feeling behind'],
      interventionStrategy: 'Send "welcome back" messages with easy restart options',
    },
  };

  const basePersona = personaMap[branch] || personaMap.COMEBACK_PLAYER;

  return {
    personaName: basePersona.personaName!,
    archetype: basePersona.archetype!,
    strengths: basePersona.strengths!,
    challenges: basePersona.challenges!,
    recommendedHabits: basePersona.recommendedHabits!,
    sageBehavior: basePersona.sageBehavior!,
    retentionStrategy: basePersona.retentionStrategy!,
    churnRisks: basePersona.churnRisks!,
    interventionStrategy: basePersona.interventionStrategy!,
  };
}
