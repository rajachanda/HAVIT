import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Sparkles, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface UniversalAnswers {
  struggles: string;
  funPreference: string;
  missResponse: string;
  topMotivators: [string, string];
  successFeeling: string;
}

const UniversalQuestions = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answers, setAnswers] = useState<UniversalAnswers>({
    struggles: '',
    funPreference: '',
    missResponse: '',
    topMotivators: ['', ''],
    successFeeling: '',
  });

  const [motivatorRanking, setMotivatorRanking] = useState<string[]>([]);

  const questions = [
    {
      id: 'struggles',
      question: "What's your biggest struggle with habits?",
      type: 'radio',
      options: [
        { value: 'staying-consistent', label: 'Staying consistent', emoji: '📍' },
        { value: 'getting-started', label: 'Getting started', emoji: '🚀' },
        { value: 'finding-motivation', label: 'Finding motivation', emoji: '💡' },
        { value: 'doing-too-much', label: 'Doing too much', emoji: '⚡' },
        { value: 'losing-interest', label: 'Losing interest', emoji: '😴' },
      ],
    },
    {
      id: 'funPreference',
      question: 'Which sounds most fun for you?',
      type: 'grid',
      options: [
        { value: 'beating-friend', label: "Beating a friend's record", emoji: '🏆' },
        { value: 'leveling-up', label: 'Leveling up a character', emoji: '⚔️' },
        { value: 'leading-squad', label: 'Leading a squad to victory', emoji: '👥' },
        { value: 'personal-bests', label: 'Getting personal bests', emoji: '📊' },
        { value: 'solving-challenges', label: 'Solving tricky challenges', emoji: '🧩' },
        { value: 'helping-others', label: 'Helping someone else win', emoji: '🤝' },
      ],
    },
    {
      id: 'missResponse',
      question: 'If you miss a habit, what do you do?',
      type: 'slider',
      options: [
        { value: 'try-harder', label: 'Try again harder', emoji: '😢' },
        { value: 'ask-help', label: 'Ask for help', emoji: '🙋' },
        { value: 'analyze-why', label: 'Analyze why I failed', emoji: '🔍' },
        { value: 'shrug-off', label: 'Shrug it off', emoji: '🤷' },
        { value: 'need-encouragement', label: 'Need encouragement', emoji: '💪' },
        { value: 'set-easier', label: 'Set easier goal', emoji: '🎯' },
      ],
    },
    {
      id: 'topMotivators',
      question: 'What motivates you more? (Rank your top 2)',
      type: 'ranking',
      options: [
        { value: 'progress-charts', label: 'Progress charts', emoji: '📈' },
        { value: 'team-cheers', label: 'Team cheers', emoji: '👏' },
        { value: 'rival-competition', label: 'Rival competition', emoji: '⚔️' },
        { value: 'personal-streaks', label: 'Personal streaks', emoji: '🔥' },
        { value: 'unlocking-abilities', label: 'Unlocking new abilities', emoji: '🔓' },
        { value: 'recognition', label: 'Recognition from others', emoji: '🌟' },
      ],
    },
    {
      id: 'successFeeling',
      question: 'How do you want to feel at the end of a successful week?',
      type: 'carousel',
      options: [
        { value: 'victorious', label: 'Victorious', emoji: '😎' },
        { value: 'supported', label: 'Supported', emoji: '🤝' },
        { value: 'proud', label: 'Proud', emoji: '💪' },
        { value: 'smart', label: 'Smart', emoji: '🧠' },
        { value: 'community', label: 'Part of a community', emoji: '👥' },
        { value: 'surprised', label: 'Surprised', emoji: '😮' },
      ],
    },
  ];

  const handleNext = async () => {
    const currentQ = questions[currentQuestion];
    const answer = answers[currentQ.id as keyof UniversalAnswers];

    // Validation
    if (!answer || (Array.isArray(answer) && answer.filter(Boolean).length < 2)) {
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
      // Show confetti and save
      setShowConfetti(true);
      setTimeout(async () => {
        await saveAnswers();
      }, 2000);
    }
  };

  const saveAnswers = async () => {
    if (!currentUser) return;

    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          onboardingResponses: {
            universalQuestions: {
              ...answers,
              completedAt: new Date().toISOString(),
            },
          },
        },
        { merge: true }
      );

      toast({
        title: 'Great answers!',
        description: "Now let's dive deeper...",
      });

      navigate('/onboarding/conditional-questions');
    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: 'Error',
        description: 'Failed to save answers. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigate('/onboarding/profile');
    }
  };

  const handleMotivatorSelect = (value: string) => {
    const newRanking = [...motivatorRanking];
    const index = newRanking.indexOf(value);

    if (index > -1) {
      newRanking.splice(index, 1);
    } else if (newRanking.length < 2) {
      newRanking.push(value);
    }

    setMotivatorRanking(newRanking);
    setAnswers({ ...answers, topMotivators: [newRanking[0] || '', newRanking[1] || ''] });
  };

  const renderQuestion = () => {
    const q = questions[currentQuestion];

    switch (q.type) {
      case 'radio':
      case 'grid':
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-6">{q.question}</h2>
            {q.type === 'radio' ? (
              <RadioGroup
                value={answers[q.id as keyof UniversalAnswers] as string}
                onValueChange={(value) => setAnswers({ ...answers, [q.id]: value })}
              >
                <div className="space-y-3">
                  {q.options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <span className="text-3xl">{option.emoji}</span>
                        <span className="text-lg">{option.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={
                      answers[q.id as keyof UniversalAnswers] === option.value
                        ? 'default'
                        : 'outline'
                    }
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setAnswers({ ...answers, [q.id]: option.value })}
                  >
                    <span className="text-4xl">{option.emoji}</span>
                    <span className="text-sm text-center">{option.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-6">{q.question}</h2>
            <div className="space-y-4">
              {q.options.map((option, index) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={
                    answers[q.id as keyof UniversalAnswers] === option.value ? 'default' : 'outline'
                  }
                  className="w-full h-16 flex items-center justify-start gap-4 px-6"
                  onClick={() => setAnswers({ ...answers, [q.id]: option.value })}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-lg">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-6">{q.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((option, index) => {
                const rank = motivatorRanking.indexOf(option.value);
                const isSelected = rank > -1;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    className="h-20 flex flex-col items-center justify-center gap-2 relative"
                    onClick={() => handleMotivatorSelect(option.value)}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {rank + 1}
                      </span>
                    )}
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="text-sm text-center">{option.label}</span>
                  </Button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Selected: {motivatorRanking.length}/2
            </p>
          </div>
        );

      case 'carousel':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-6">{q.question}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {q.options.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={
                    answers[q.id as keyof UniversalAnswers] === option.value
                      ? 'default'
                      : 'outline'
                  }
                  className="h-28 flex flex-col items-center justify-center gap-2"
                  onClick={() => setAnswers({ ...answers, [q.id]: option.value })}
                >
                  <span className="text-5xl">{option.emoji}</span>
                  <span className="text-sm text-center">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  const getSageComment = () => {
    const comments = [
      "Understanding your struggles helps me guide you better!",
      "This tells me what kind of experience you'll love most!",
      "Your response style helps me know how to support you!",
      "These are key to keeping you motivated!",
      "This shapes how I'll celebrate your wins with you!",
    ];
    return comments[currentQuestion] || "Great answer!";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <Card className="w-full max-w-3xl bg-card/60 backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold text-foreground">Universal Questions</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Sage Comment */}
        <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-8 h-8 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">Sage AI</p>
              <p className="text-sm text-muted-foreground">{getSageComment()}</p>
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
            ⏱️ About {Math.max(3 - currentQuestion, 1)} minutes remaining
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UniversalQuestions;
