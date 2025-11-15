import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Sparkles, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { generatePersona } from '@/services/personaGenerator';

type PersonaBranch =
  | 'RELENTLESS_COMPETITOR'
  | 'THOUGHTFUL_ANALYST'
  | 'SOCIAL_BUTTERFLY'
  | 'INTERNAL_ACHIEVER'
  | 'OVERWHELMED_BEGINNER'
  | 'COMEBACK_PLAYER';

interface BranchQuestion {
  id: string;
  question: string;
  type: 'toggle' | 'slider' | 'radio' | 'binary';
  options?: { value: string; label: string; emoji?: string }[];
  leftLabel?: string;
  rightLabel?: string;
}

const ConditionalQuestions = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<PersonaBranch | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [universalAnswers, setUniversalAnswers] = useState<any>(null);

  useEffect(() => {
    loadUniversalAnswers();
  }, []);

  const loadUniversalAnswers = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const data = userDoc.data();
      const universal = data?.onboardingResponses?.universalQuestions;

      if (!universal) {
        toast({
          title: 'Error',
          description: 'Please complete universal questions first',
          variant: 'destructive',
        });
        navigate('/onboarding/universal-questions');
        return;
      }

      setUniversalAnswers(universal);
      const determinedBranch = determineBranch(universal);
      setBranch(determinedBranch);
      setLoading(false);
    } catch (error) {
      console.error('Error loading universal answers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your answers',
        variant: 'destructive',
      });
    }
  };

  const determineBranch = (universal: any): PersonaBranch => {
    const { funPreference, topMotivators, struggles, missResponse } = universal;

    // RELENTLESS_COMPETITOR
    if (
      funPreference?.includes('beating') ||
      topMotivators?.includes('rival-competition')
    ) {
      return 'RELENTLESS_COMPETITOR';
    }

    // THOUGHTFUL_ANALYST
    if (
      funPreference?.includes('challenges') &&
      missResponse?.includes('analyze')
    ) {
      return 'THOUGHTFUL_ANALYST';
    }

    // SOCIAL_BUTTERFLY
    if (
      funPreference?.includes('squad') ||
      funPreference?.includes('helping') ||
      topMotivators?.includes('team-cheers') ||
      topMotivators?.includes('recognition')
    ) {
      return 'SOCIAL_BUTTERFLY';
    }

    // INTERNAL_ACHIEVER
    if (
      topMotivators?.includes('personal-streaks') &&
      funPreference?.includes('personal-bests')
    ) {
      return 'INTERNAL_ACHIEVER';
    }

    // OVERWHELMED_BEGINNER
    if (
      struggles?.includes('getting-started') ||
      missResponse?.includes('need-encouragement')
    ) {
      return 'OVERWHELMED_BEGINNER';
    }

    // COMEBACK_PLAYER (default fallback)
    return 'COMEBACK_PLAYER';
  };

  const getBranchQuestions = (): BranchQuestion[] => {
    switch (branch) {
      case 'RELENTLESS_COMPETITOR':
        return [
          {
            id: 'q1',
            question: 'Would you rather win by a little or crush the competition?',
            type: 'binary',
            options: [
              { value: 'win-little', label: 'Win by a little', emoji: '🟢' },
              { value: 'crush-it', label: 'Crush it', emoji: '🔴' },
            ],
          },
          {
            id: 'q2',
            question: 'Seeing your name on a public leaderboard:',
            type: 'slider',
            leftLabel: 'Not needed',
            rightLabel: 'Super motivating',
          },
          {
            id: 'q3',
            question: 'Does beating a friend increase your motivation for the next week?',
            type: 'toggle',
          },
          {
            id: 'q4',
            question: 'Is losing a streak discouraging or fuel for a comeback?',
            type: 'radio',
            options: [
              { value: 'discouraging', label: 'Discouraging', emoji: '😢' },
              { value: 'fuel-comeback', label: 'Fuel for comeback', emoji: '🔥' },
            ],
          },
          {
            id: 'q5',
            question: 'Do you prefer tough wins over easy wins?',
            type: 'slider',
            leftLabel: 'Easy wins',
            rightLabel: 'Tough wins',
          },
          {
            id: 'q6',
            question: 'Would you grind for exclusive badges only a few can earn?',
            type: 'toggle',
          },
          {
            id: 'q7',
            question: 'Is real-time progress updates important during a challenge?',
            type: 'slider',
            leftLabel: 'Not important',
            rightLabel: 'Very important',
          },
          {
            id: 'q8',
            question: "How do you react to 'trash talk' from friends in a duel?",
            type: 'radio',
            options: [
              { value: 'hate-it', label: 'Hate it', emoji: '😡' },
              { value: 'love-it', label: 'Love it', emoji: '💪' },
              { value: 'neutral', label: 'Neutral', emoji: '😐' },
            ],
          },
          {
            id: 'q9',
            question: "If you couldn't track your progress in numbers, would you still use the app?",
            type: 'toggle',
          },
          {
            id: 'q10',
            question: "What's the ultimate prize?",
            type: 'radio',
            options: [
              { value: 'top-leaderboard', label: 'Top of leaderboard', emoji: '🏆' },
              { value: 'personal-best', label: 'Personal best', emoji: '💎' },
              { value: 'beat-friend', label: 'Beat a friend', emoji: '⚔️' },
            ],
          },
        ];

      case 'THOUGHTFUL_ANALYST':
        return [
          {
            id: 'q1',
            question: 'Do you want weekly reports about your habits and trends?',
            type: 'toggle',
          },
          {
            id: 'q2',
            question: 'Would you prefer detailed charts or short summaries?',
            type: 'binary',
            options: [
              { value: 'detailed', label: 'Detailed', emoji: '📊' },
              { value: 'short', label: 'Short', emoji: '📄' },
            ],
          },
          {
            id: 'q3',
            question: "Is understanding 'why' behind failures crucial to improving?",
            type: 'slider',
            leftLabel: 'Not crucial',
            rightLabel: 'Very crucial',
          },
          {
            id: 'q4',
            question: 'Do you enjoy experimenting with different routines to optimize results?',
            type: 'toggle',
          },
          {
            id: 'q5',
            question: 'Would seeing your average completion rates by weekday be helpful?',
            type: 'toggle',
          },
          {
            id: 'q6',
            question: 'If a habit fails 3 days in a row, do you want the app to suggest improvements?',
            type: 'radio',
            options: [
              { value: 'suggest', label: 'Suggest improvements', emoji: '💡' },
              { value: 'wait', label: 'Wait for me', emoji: '⏸️' },
            ],
          },
          {
            id: 'q7',
            question: 'Do you typically set measurable goals or flexible ones?',
            type: 'radio',
            options: [
              { value: 'measurable', label: 'Measurable', emoji: '📏' },
              { value: 'flexible', label: 'Flexible', emoji: '🌊' },
            ],
          },
          {
            id: 'q8',
            question: "Would you use a 'habit lab' feature to test new routines?",
            type: 'toggle',
          },
          {
            id: 'q9',
            question: 'How important are scientific explanations for suggested changes?',
            type: 'slider',
            leftLabel: 'Not important',
            rightLabel: 'Very important',
          },
          {
            id: 'q10',
            question: 'Would you read strategies or just want actions?',
            type: 'radio',
            options: [
              { value: 'read-strategies', label: 'Read strategies', emoji: '📖' },
              { value: 'just-actions', label: 'Just actions', emoji: '🎯' },
            ],
          },
        ];

      case 'SOCIAL_BUTTERFLY':
        return [
          {
            id: 'q1',
            question: 'Would you join weekly squad challenges if friends invited you?',
            type: 'toggle',
          },
          {
            id: 'q2',
            question: "What's better—celebrating a victory alone or with the whole squad?",
            type: 'radio',
            options: [
              { value: 'alone', label: 'Alone', emoji: '🎉' },
              { value: 'with-squad', label: 'With squad', emoji: '🥳' },
            ],
          },
          {
            id: 'q3',
            question: "How often do you chat or react to friends' habit achievements?",
            type: 'slider',
            leftLabel: 'Never',
            rightLabel: 'Always',
          },
          {
            id: 'q4',
            question: 'Do leaderboards motivate you more when friends are involved?',
            type: 'toggle',
          },
          {
            id: 'q5',
            question: 'Would you encourage a struggling squadmate or focus on your progress?',
            type: 'radio',
            options: [
              { value: 'encourage', label: 'Encourage', emoji: '🤝' },
              { value: 'focus-me', label: 'Focus on me', emoji: '💪' },
            ],
          },
          {
            id: 'q6',
            question: 'Do you enjoy sending/receiving in-app cheers?',
            type: 'toggle',
          },
          {
            id: 'q7',
            question: 'Would you vote for new app features in a community poll?',
            type: 'toggle',
          },
          {
            id: 'q8',
            question: "Is a 'squad of the week' prize more motivating than individual awards?",
            type: 'slider',
            leftLabel: 'Individual',
            rightLabel: 'Squad of week',
          },
          {
            id: 'q9',
            question: 'Would you want public recognition for your helpful comments?',
            type: 'toggle',
          },
          {
            id: 'q10',
            question: 'Do memes or positive quotes in the community feed help you stay consistent?',
            type: 'toggle',
          },
        ];

      case 'INTERNAL_ACHIEVER':
        return [
          {
            id: 'q1',
            question: 'Does streak length or personal growth matter more to you?',
            type: 'radio',
            options: [
              { value: 'streak', label: 'Streak length', emoji: '🔥' },
              { value: 'growth', label: 'Personal growth', emoji: '🌱' },
            ],
          },
          {
            id: 'q2',
            question: 'Do you set private milestones nobody else sees?',
            type: 'toggle',
          },
          {
            id: 'q3',
            question: 'Would you journal daily reflections on your habit journey?',
            type: 'toggle',
          },
          {
            id: 'q4',
            question: 'Would hidden achievements (only you see them) keep you motivated?',
            type: 'toggle',
          },
          {
            id: 'q5',
            question: 'Is it important to track how habits make you feel, not just stats?',
            type: 'slider',
            leftLabel: 'Just stats',
            rightLabel: 'How I feel',
          },
          {
            id: 'q6',
            question: 'After a success, do you prefer quiet acknowledgment or a small personal celebration?',
            type: 'radio',
            options: [
              { value: 'quiet', label: 'Quiet', emoji: '🤫' },
              { value: 'celebration', label: 'Celebration', emoji: '🎉' },
            ],
          },
          {
            id: 'q7',
            question: 'Would you revisit old entries to see growth over months?',
            type: 'toggle',
          },
          {
            id: 'q8',
            question: 'Do you want reminders for reflection or just for tasks?',
            type: 'radio',
            options: [
              { value: 'reflection', label: 'Reflection reminders', emoji: '💭' },
              { value: 'tasks', label: 'Task reminders', emoji: '✅' },
            ],
          },
          {
            id: 'q9',
            question: 'Would you rather see gentle feedback or direct advice when struggling?',
            type: 'radio',
            options: [
              { value: 'gentle', label: 'Gentle', emoji: '🤗' },
              { value: 'direct', label: 'Direct', emoji: '🎯' },
            ],
          },
          {
            id: 'q10',
            question: 'How much privacy do you want over your progress?',
            type: 'slider',
            leftLabel: 'Maximum sharing',
            rightLabel: 'Total privacy',
          },
        ];

      case 'OVERWHELMED_BEGINNER':
        return [
          {
            id: 'q1',
            question: "Would you like daily 'one small thing' suggestions?",
            type: 'toggle',
          },
          {
            id: 'q2',
            question: 'Does the idea of missing a day make you anxious?',
            type: 'slider',
            leftLabel: 'Not anxious',
            rightLabel: 'Very anxious',
          },
          {
            id: 'q3',
            question: 'Would you prefer habits broken into the smallest possible actions?',
            type: 'toggle',
          },
          {
            id: 'q4',
            question: "How helpful are encouraging badges (e.g., 'You showed up!')?",
            type: 'slider',
            leftLabel: 'Not helpful',
            rightLabel: 'Very helpful',
          },
          {
            id: 'q5',
            question: 'Do too many notifications stress you?',
            type: 'slider',
            leftLabel: 'Not stressful',
            rightLabel: 'Very stressful',
          },
          {
            id: 'q6',
            question: 'Would you want the app to lower difficulty automatically after setbacks?',
            type: 'toggle',
          },
          {
            id: 'q7',
            question: 'Are custom encouragement messages from Sage valuable to you?',
            type: 'slider',
            leftLabel: 'Not valuable',
            rightLabel: 'Very valuable',
          },
          {
            id: 'q8',
            question: 'Do you feel better when goals are flexible, not rigid?',
            type: 'toggle',
          },
          {
            id: 'q9',
            question: 'Would short 1-minute reminders work during busy days?',
            type: 'toggle',
          },
          {
            id: 'q10',
            question: "How would you like to celebrate your first week's progress?",
            type: 'radio',
            options: [
              { value: 'quiet', label: 'Quiet celebration', emoji: '🤐' },
              { value: 'big', label: 'Big celebration', emoji: '🎊' },
            ],
          },
        ];

      case 'COMEBACK_PLAYER':
        return [
          {
            id: 'q1',
            question: 'Have you broken streaks and come back stronger before?',
            type: 'toggle',
          },
          {
            id: 'q2',
            question: 'Does a visible restart button get you motivated?',
            type: 'toggle',
          },
          {
            id: 'q3',
            question: "Would a 'Comeback Streak' badge keep you engaged?",
            type: 'toggle',
          },
          {
            id: 'q4',
            question: "Would you prefer seeing how many comebacks you've had or not be reminded?",
            type: 'radio',
            options: [
              { value: 'see-comebacks', label: 'See comebacks', emoji: '📊' },
              { value: 'not-reminded', label: 'Not reminded', emoji: '🤐' },
            ],
          },
          {
            id: 'q5',
            question: "What's a bigger motivator—proof of progress or encouragement after failure?",
            type: 'radio',
            options: [
              { value: 'proof', label: 'Proof of progress', emoji: '📈' },
              { value: 'encouragement', label: 'Encouragement', emoji: '💪' },
            ],
          },
          {
            id: 'q6',
            question: 'Do you want the Sage to reach out after missed days, or wait until you return?',
            type: 'radio',
            options: [
              { value: 'reach-out', label: 'Reach out', emoji: '📬' },
              { value: 'wait', label: 'Wait for me', emoji: '⏸️' },
            ],
          },
          {
            id: 'q7',
            question: 'Does competing with others help you return, or is it personal resolve?',
            type: 'radio',
            options: [
              { value: 'competition', label: 'Competition', emoji: '⚔️' },
              { value: 'personal', label: 'Personal resolve', emoji: '💪' },
            ],
          },
          {
            id: 'q8',
            question: 'Do you use habit apps off and on, or always try to be consistent?',
            type: 'radio',
            options: [
              { value: 'off-on', label: 'Off and on', emoji: '📱' },
              { value: 'consistent', label: 'Always consistent', emoji: '🔄' },
            ],
          },
          {
            id: 'q9',
            question: "Would you want a 'Skip Pass' when real life happens?",
            type: 'toggle',
          },
          {
            id: 'q10',
            question: 'How can we best motivate you to restart after a big break?',
            type: 'radio',
            options: [
              { value: 'show-progress', label: 'Show progress', emoji: '📊' },
              { value: 'personal-message', label: 'Personal message', emoji: '💬' },
              { value: 'challenge', label: 'Challenge', emoji: '🏆' },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const questions = getBranchQuestions();

  const handleNext = async () => {
    const currentQ = questions[currentQuestion];
    const answer = answers[currentQ.id];

    if (answer === undefined || answer === null) {
      toast({
        title: 'Please answer the question',
        description: 'Select an option to continue',
        variant: 'destructive',
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show confetti and generate persona
      setShowConfetti(true);
      setTimeout(async () => {
        await generateAndSavePersona();
      }, 2000);
    }
  };

  const generateAndSavePersona = async () => {
    if (!currentUser || !universalAnswers) return;

    try {
      setLoading(true);

      // Generate persona using Gemini API
      const persona = await generatePersona({
        universalAnswers,
        branch: branch!,
        branchResponses: answers,
      });

      // Save to Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          onboardingResponses: {
            conditionalQuestions: {
              personaBranch: branch,
              branchResponses: answers,
              completedAt: new Date().toISOString(),
            },
            persona: persona,
            onboardingCompleted: true,
          },
        },
        { merge: true }
      );

      toast({
        title: 'Persona generated! 🎉',
        description: `You're ${persona.personaName}!`,
      });

      navigate('/character-select');
    } catch (error) {
      console.error('Error generating persona:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate persona. Using default...',
        variant: 'destructive',
      });
      // Fallback to character select anyway
      navigate('/character-select');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigate('/onboarding/universal-questions');
    }
  };

  const renderQuestion = () => {
    const q = questions[currentQuestion];
    if (!q) return null;

    switch (q.type) {
      case 'toggle':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-6">{q.question}</h2>
            <div className="flex items-center justify-center gap-6 p-8">
              <Label htmlFor={q.id} className="text-xl">
                No
              </Label>
              <Switch
                id={q.id}
                checked={answers[q.id] === true}
                onCheckedChange={(checked) => setAnswers({ ...answers, [q.id]: checked })}
                className="scale-150"
              />
              <Label htmlFor={q.id} className="text-xl">
                Yes
              </Label>
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-6">{q.question}</h2>
            <div className="px-4 py-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{q.leftLabel}</span>
                <span className="text-sm text-muted-foreground">{q.rightLabel}</span>
              </div>
              <Slider
                value={[answers[q.id] || 50]}
                onValueChange={(value) => setAnswers({ ...answers, [q.id]: value[0] })}
                max={100}
                step={1}
                className="my-6"
              />
              <p className="text-center text-2xl font-bold text-primary mt-4">
                {answers[q.id] || 50}
              </p>
            </div>
          </div>
        );

      case 'binary':
      case 'radio':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-6">{q.question}</h2>
            <RadioGroup
              value={answers[q.id]}
              onValueChange={(value) => setAnswers({ ...answers, [q.id]: value })}
            >
              <div className="space-y-3">
                {q.options?.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                      <span className="text-lg">{option.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading personalized questions...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
  const branchName = branch?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <Card className="w-full max-w-3xl bg-card/60 backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold text-foreground">Personalized Questions</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">Profile: {branchName}</p>
        </div>

        {/* Sage Comment */}
        <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-8 h-8 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">Sage AI</p>
              <p className="text-sm text-muted-foreground">
                {currentQuestion < 5
                  ? "These questions help me understand your unique style!"
                  : currentQuestion < 8
                  ? "Almost there! Your personalized experience is taking shape!"
                  : "Final questions! I'm excited to build your custom journey!"}
              </p>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="mb-8">{renderQuestion()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary-dark">
            {currentQuestion === questions.length - 1 ? (
              <>
                Complete
                <PartyPopper className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Time estimate */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            ⏱️ About {Math.max(2 - Math.floor(currentQuestion / 5), 1)} minutes remaining
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ConditionalQuestions;
