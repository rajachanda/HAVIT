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
import { ArrowRight, ArrowLeft, Sparkles, Zap, Trophy, Star, Heart, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { generatePersona } from '@/services/personaGenerator';

interface OnboardingAnswers {
  motivation: string;
  dreamJourney: string[];
  losesMomentum: string;
  topMotivators: string[];
  weekFeeling: string;
  pushOrProtect: string;
  comparisonResponse: string;
  missResponse: string;
}

const GamifiedOnboarding = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    motivation: '',
    dreamJourney: [],
    losesMomentum: '',
    topMotivators: [],
    weekFeeling: '',
    pushOrProtect: '',
    comparisonResponse: '',
    missResponse: '',
  });

  const [sliderValue, setSliderValue] = useState([2]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Initialize default values for slider and carousel when questions change
  const handleQuestionChange = (newIndex: number) => {
    setCurrentQuestion(newIndex);
    const newQ = questions[newIndex];
    
    // Set default values for slider
    if (newQ.type === 'slider' && !answers[newQ.id as keyof OnboardingAnswers]) {
      const defaultOption = newQ.options?.[2];
      if (defaultOption) {
        setSliderValue([2]);
        handleAnswer(newQ.id, defaultOption.value);
      }
    }
    
    // Set default values for carousel
    if (newQ.type === 'carousel' && !answers[newQ.id as keyof OnboardingAnswers]) {
      const defaultOption = newQ.options?.[0];
      if (defaultOption) {
        setCarouselIndex(0);
        handleAnswer(newQ.id, defaultOption.value);
      }
    }
  };

  const questions = [
    {
      id: 'motivation',
      title: "What makes you show up even when you don't feel like it?",
      type: 'radio',
      icon: Sparkles,
      gradient: 'from-purple-500/20 via-pink-500/20 to-red-500/20',
      options: [
        { value: 'clear-reward', label: 'A clear reward', emoji: '⭐' },
        { value: 'streak', label: "A streak I don't want to break", emoji: '🔥' },
        { value: 'support', label: 'Someone cheering me on', emoji: '🤝' },
        { value: 'challenge', label: 'A challenge to beat', emoji: '⚔️' },
        { value: 'feeling', label: 'The feeling after I finish', emoji: '😌' },
      ],
    },
    {
      id: 'dreamJourney',
      title: 'Which one sounds like your dream habit journey?',
      type: 'grid',
      icon: Trophy,
      gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
      options: [
        { value: 'leveling-up', label: 'Leveling up slowly every day', emoji: '🎮' },
        { value: 'achievements', label: 'Unlocking hidden achievements', emoji: '🔓' },
        { value: 'rival', label: 'Competing with a friendly rival', emoji: '🏆' },
        { value: 'charts', label: 'Seeing beautiful progress charts', emoji: '📈' },
        { value: 'quests', label: 'Completing "daily quests"', emoji: '🎯' },
        { value: 'squad', label: 'Being cheered by a supportive squad', emoji: '👥' },
      ],
    },
    {
      id: 'losesMomentum',
      title: 'When you lose momentum, what does your brain immediately say?',
      type: 'slider',
      icon: Zap,
      gradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
      options: [
        { value: 'tomorrow', label: 'Start again tomorrow.', emoji: '🌙' },
        { value: 'why', label: 'Why did this happen?', emoji: '🔍' },
        { value: 'help', label: 'Someone help me get back.', emoji: '🙋' },
        { value: 'let-go', label: "Let it go, it's fine.", emoji: '😌' },
        { value: 'reset', label: 'Reset everything and go harder.', emoji: '⚡' },
      ],
    },
    {
      id: 'topMotivators',
      title: 'Rank what motivates you the MOST in life. (Pick top 2)',
      type: 'ranking',
      icon: Star,
      gradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
      options: [
        { value: 'progress', label: 'Making visible progress', emoji: '📈' },
        { value: 'competition', label: 'Healthy competition', emoji: '⚔️' },
        { value: 'creativity', label: 'Creativity and expression', emoji: '🎨' },
        { value: 'team', label: 'Being part of a team', emoji: '👥' },
        { value: 'recognition', label: 'Recognition from others', emoji: '🌟' },
        { value: 'consistency', label: 'Consistency and self-trust', emoji: '🔒' },
      ],
    },
    {
      id: 'weekFeeling',
      title: 'How should your perfect week FEEL at the end?',
      type: 'carousel',
      icon: Heart,
      gradient: 'from-pink-500/20 via-rose-500/20 to-red-500/20',
      options: [
        { value: 'calm', label: 'Calm & in control', emoji: '😌' },
        { value: 'powerful', label: 'Powerful & unstoppable', emoji: '💪' },
        { value: 'smarter', label: 'Smarter & sharper', emoji: '🧠' },
        { value: 'supported', label: 'Supported & connected', emoji: '🤝' },
        { value: 'surprised', label: 'Surprised at how much I achieved', emoji: '😮' },
        { value: 'proud', label: 'Proud of myself', emoji: '🌈' },
      ],
    },
    {
      id: 'pushOrProtect',
      title: 'Do you prefer pushing yourself harder or protecting your energy?',
      type: 'binary',
      icon: Shield,
      gradient: 'from-emerald-500/20 via-green-500/20 to-teal-500/20',
      options: [
        { value: 'push', label: 'Push harder', emoji: '⚔️' },
        { value: 'protect', label: 'Protect energy', emoji: '🛡️' },
      ],
    },
    {
      id: 'comparisonResponse',
      title: 'When you see someone doing better than you, what happens?',
      type: 'radio',
      icon: Zap,
      gradient: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
      options: [
        { value: 'motivated', label: 'I get super motivated', emoji: '💥' },
        { value: 'inspired', label: 'I feel inspired to learn', emoji: '✨' },
        { value: 'discouraged', label: 'I feel discouraged', emoji: '😕' },
        { value: 'no-compare', label: "I don't compare at all", emoji: '😌' },
      ],
    },
    {
      id: 'missResponse',
      title: 'What do you want Sage to do when you miss 2 days?',
      type: 'radio',
      icon: Sparkles,
      gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
      options: [
        { value: 'nudge', label: 'Give me a gentle nudge', emoji: '🤗' },
        { value: 'hype', label: 'Send a hype message', emoji: '💪' },
        { value: 'suggest', label: 'Suggest a simpler routine', emoji: '🧩' },
        { value: 'alone', label: 'Leave me alone until I return', emoji: '💤' },
      ],
    },
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const Icon = currentQ.icon;

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const toggleGridOption = (value: string) => {
    const current = answers.dreamJourney || [];
    if (current.includes(value)) {
      handleAnswer('dreamJourney', current.filter((v) => v !== value));
    } else {
      handleAnswer('dreamJourney', [...current, value]);
    }
  };

  const toggleRankingOption = (value: string) => {
    const current = answers.topMotivators || [];
    if (current.includes(value)) {
      handleAnswer('topMotivators', current.filter((v) => v !== value));
    } else if (current.length < 2) {
      handleAnswer('topMotivators', [...current, value]);
    } else {
      // Replace the first selected with the new one
      handleAnswer('topMotivators', [current[1], value]);
    }
  };

  const canProceed = () => {
    const answer = answers[currentQ.id as keyof OnboardingAnswers];
    
    if (currentQ.type === 'grid') {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (currentQ.type === 'ranking') {
      return Array.isArray(answer) && answer.length === 2;
    }
    if (currentQ.type === 'slider' || currentQ.type === 'carousel') {
      return true; // Always has a default value
    }
    return answer && answer !== '';
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast({
        title: 'Please answer the question',
        description: 'Select an option to continue',
        variant: 'destructive',
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      handleQuestionChange(currentQuestion + 1);
    } else {
      await handleFinish();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      handleQuestionChange(currentQuestion - 1);
    }
  };

  const handleFinish = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      // Generate persona based on answers
      const persona = await generatePersona(answers);

      // Save to Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          onboardingCompleted: true,
          onboardingResponses: {
            gamifiedQuestions: answers,
            completedAt: new Date().toISOString(),
          },
          persona: persona,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setShowConfetti(true);
      
      toast({
        title: '🎉 Onboarding Complete!',
        description: `Welcome, ${persona.archetype}! Your journey begins now.`,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = () => {
    switch (currentQ.type) {
      case 'radio':
        return (
          <RadioGroup
            value={answers[currentQ.id as keyof OnboardingAnswers] as string}
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
            className="space-y-3"
          >
            {currentQ.options?.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                onClick={() => handleAnswer(currentQ.id, option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-base font-medium group-hover:text-primary transition-colors"
                >
                  <span className="text-2xl mr-3">{option.emoji}</span>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'grid':
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options?.map((option) => {
              const isSelected = (answers.dreamJourney || []).includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleGridOption(option.value)}
                  className={`p-5 rounded-xl border-2 transition-all text-center ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-sm font-medium leading-tight">{option.label}</div>
                </button>
              );
            })}
          </div>
        );

      case 'slider':
        const sliderOptions = currentQ.options || [];
        const selectedSliderValue = sliderValue[0];
        const selectedOption = sliderOptions[selectedSliderValue];
        
        return (
          <div className="space-y-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-success/10 border border-primary/20">
              <div className="text-5xl mb-3">{selectedOption?.emoji}</div>
              <div className="text-lg font-semibold text-foreground">{selectedOption?.label}</div>
            </div>
            <div className="px-4">
              <Slider
                value={sliderValue}
                onValueChange={(value) => {
                  setSliderValue(value);
                  handleAnswer(currentQ.id, sliderOptions[value[0]]?.value || '');
                }}
                max={sliderOptions.length - 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{sliderOptions[0]?.emoji}</span>
                <span>{sliderOptions[sliderOptions.length - 1]?.emoji}</span>
              </div>
            </div>
          </div>
        );

      case 'ranking':
        const selectedMotivators = answers.topMotivators || [];
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Selected: {selectedMotivators.length}/2
            </p>
            {currentQ.options?.map((option) => {
              const isSelected = selectedMotivators.includes(option.value);
              const rank = selectedMotivators.indexOf(option.value) + 1;
              return (
                <button
                  key={option.value}
                  onClick={() => toggleRankingOption(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {isSelected && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {rank}
                    </div>
                  )}
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="flex-1 text-left font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        );

      case 'carousel':
        const carouselOptions = currentQ.options || [];
        const currentCarouselOption = carouselOptions[carouselIndex];
        
        return (
          <div className="space-y-6">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-primary/20 via-success/10 to-primary/20 border-2 border-primary/30 shadow-xl">
              <div className="text-6xl mb-4 animate-bounce">{currentCarouselOption?.emoji}</div>
              <div className="text-xl font-bold text-foreground">{currentCarouselOption?.label}</div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newIndex = carouselIndex > 0 ? carouselIndex - 1 : carouselOptions.length - 1;
                  setCarouselIndex(newIndex);
                  handleAnswer(currentQ.id, carouselOptions[newIndex]?.value || '');
                }}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex gap-2">
                {carouselOptions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === carouselIndex
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newIndex = carouselIndex < carouselOptions.length - 1 ? carouselIndex + 1 : 0;
                  setCarouselIndex(newIndex);
                  handleAnswer(currentQ.id, carouselOptions[newIndex]?.value || '');
                }}
                className="rounded-full"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        );

      case 'binary':
        return (
          <div className="grid grid-cols-2 gap-4">
            {currentQ.options?.map((option) => {
              const isSelected = answers[currentQ.id as keyof OnboardingAnswers] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                  className={`p-8 rounded-xl border-2 transition-all text-center ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-xl scale-105'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <div className="text-5xl mb-3">{option.emoji}</div>
                  <div className="text-lg font-bold">{option.label}</div>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <Card className="w-full max-w-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${currentQ.gradient}`}>
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentQ.type === 'grid' && 'Select any that resonate'}
                  {currentQ.type === 'ranking' && 'Pick your top 2'}
                  {currentQ.type === 'slider' && 'Slide to choose'}
                  {currentQ.type === 'carousel' && 'Swipe through options'}
                  {currentQ.type === 'binary' && 'Choose one'}
                  {currentQ.type === 'radio' && 'Select one option'}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
          </div>
          
          <Progress value={progress} className="h-2 mb-6" />
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {currentQ.title}
          </h2>
        </div>

        {/* Question Content */}
        <div className="mb-8">
          {renderQuestion()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </>
            ) : currentQuestion === questions.length - 1 ? (
              <>
                Complete Journey
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GamifiedOnboarding;
