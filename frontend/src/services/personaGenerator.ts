interface PersonaInput {
  universalAnswers: any;
  branch: string;
  branchResponses: Record<string, any>;
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
  const { universalAnswers, branch, branchResponses } = input;

  // For now, use a rule-based fallback until Gemini API is configured
  // TODO: Replace with actual Gemini API call when VITE_GEMINI_API_KEY is set

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

async function generateWithGemini(input: PersonaInput, apiKey: string): Promise<Persona> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

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
