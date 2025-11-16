import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useFirebase';
import { addHabit } from '@/lib/api';
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles, Trophy, Target, Zap, Calendar, Clock, MessageSquare, Users, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface HabitFormData {
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: 'daily' | 'weekly' | 'monthly';
  minHabit: number;
  reminderTime: string;
  whyItMatters: string;
  accountability: 'private' | 'friends' | 'public';
  streakGoal: number;
}

const AddHabitForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { data: userData } = useUser(currentUser?.uid || null);
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  
  // Check if coming from AI Sage with suggested habit
  const suggestedHabit = (location.state as any)?.suggestedHabit || '';
  const fromAISage = (location.state as any)?.fromAISage || false;
  
  // Start at step 1 (Schedule - time/frequency) if coming from AI Sage, otherwise step 0
  const [currentStep, setCurrentStep] = useState(fromAISage ? 1 : 0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Update form data when suggested habit is provided
  useEffect(() => {
    if (suggestedHabit && !formData.name) {
      setFormData(prev => ({ ...prev, name: suggestedHabit }));
    }
  }, [suggestedHabit]);

  const categories = [
    { value: 'Health', emoji: '💪', color: 'text-green-500' },
    { value: 'Learning', emoji: '📚', color: 'text-blue-500' },
    { value: 'Wellness', emoji: '🧘', color: 'text-purple-500' },
    { value: 'Social', emoji: '👥', color: 'text-pink-500' },
    { value: 'Productivity', emoji: '⚡', color: 'text-yellow-500' },
    { value: 'Creativity', emoji: '🎨', color: 'text-orange-500' },
    { value: 'Finance', emoji: '💰', color: 'text-emerald-500' },
    { value: 'Other', emoji: '✨', color: 'text-gray-500' },
  ];

  const difficultyLevels = [
    { 
      value: 'easy' as const, 
      label: 'Easy', 
      emoji: '🟢', 
      xp: 5, 
      description: 'Simple, takes < 5 minutes' 
    },
    { 
      value: 'medium' as const, 
      label: 'Medium', 
      emoji: '🟡', 
      xp: 10, 
      description: 'Moderate, 5-20 minutes' 
    },
    { 
      value: 'hard' as const, 
      label: 'Hard', 
      emoji: '🔴', 
      xp: 20, 
      description: 'Challenging, 20+ minutes' 
    },
  ];

  const frequencies = [
    { value: 'daily' as const, label: 'Daily', emoji: '📅', description: 'Every day' },
    { value: 'weekly' as const, label: 'Weekly', emoji: '📆', description: '1-7 times per week' },
    { value: 'monthly' as const, label: 'Monthly', emoji: '🗓️', description: '1-4 times per month' },
  ];

  const accountabilityOptions = [
    { value: 'private' as const, label: 'Private', emoji: '🔒', description: 'Only you can see' },
    { value: 'friends' as const, label: 'Friends', emoji: '👥', description: 'Share with squad' },
    { value: 'public' as const, label: 'Public', emoji: '🌍', description: 'Visible to all' },
  ];

  const steps = [
    { title: 'Basics', icon: Target, description: 'Name your habit' },
    { title: 'Schedule', icon: Calendar, description: 'When & how often' },
    { title: 'Motivation', icon: MessageSquare, description: 'Your why' },
    { title: 'Preview', icon: CheckCircle, description: 'Review & save' },
  ];

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

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/habits');
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setShowConfetti(true);

    try {
      const difficultyXp = difficultyLevels.find(d => d.value === formData.difficulty)?.xp || 10;

      await addHabit(currentUser.uid, {
        name: formData.name,
        category: formData.category,
        frequency: formData.frequency,
        reminderTime: formData.reminderTime,
        difficulty: formData.difficulty,
        xpReward: difficultyXp,
        completions: [],
        createdAt: new Date(),
      });

      toast({
        title: 'Habit created! 🎉',
        description: `${formData.name} added to your journey`,
      });

      setTimeout(() => {
        navigate('/habits');
      }, 2000);
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to create habit. Please try again.',
        variant: 'destructive',
      });
      setSaving(false);
      setShowConfetti(false);
    }
  };

  const getCharacterReaction = () => {
    const reactions = {
      easy: "Great start! Small habits build massive results. 🌱",
      medium: "I like your ambition! This will level you up nicely. ⚡",
      hard: "Wow! A true warrior's challenge. I'll be here to support you! 🔥",
    };
    return reactions[formData.difficulty];
  };

  const getSageComment = () => {
    const comments = [
      "Let's build something amazing together!",
      "Consistency beats intensity. Let's schedule this right!",
      "Your 'why' is your fuel when motivation fades.",
      `Perfect! ${getCharacterReaction()}`,
    ];
    return comments[currentStep] || "You're doing great!";
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Habit Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                What habit do you want to build?
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning workout, Read 30 minutes..."
                className="text-lg h-14"
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={formData.category === cat.value ? 'default' : 'outline'}
                    className={`h-20 flex flex-col items-center justify-center gap-1 ${
                      formData.category === cat.value ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                  >
                    <span className="text-3xl">{cat.emoji}</span>
                    <span className="text-sm">{cat.value}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                Difficulty Level
              </Label>
              <RadioGroup
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
              >
                <div className="space-y-3">
                  {difficultyLevels.map((level) => (
                    <div
                      key={level.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label
                        htmlFor={level.value}
                        className="flex items-center justify-between cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{level.emoji}</span>
                          <div>
                            <p className="font-semibold">{level.label}</p>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-warning" />
                          <span className="font-bold text-primary">{level.xp} XP</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        );

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
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                How often?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {frequencies.map((freq) => (
                  <Button
                    key={freq.value}
                    type="button"
                    variant={formData.frequency === freq.value ? 'default' : 'outline'}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      formData.frequency === freq.value ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, frequency: freq.value })}
                  >
                    <span className="text-4xl">{freq.emoji}</span>
                    <div className="text-center">
                      <p className="font-semibold">{freq.label}</p>
                      <p className="text-xs text-muted-foreground">{freq.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Min Habit Slider */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Minimum Daily Commitment</Label>
              <p className="text-sm text-muted-foreground">
                Start small. You can always do more, but commit to at least this much.
              </p>
              <div className="px-2 py-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">1 min</span>
                  <span className="text-3xl font-bold text-primary">{formData.minHabit} min</span>
                  <span className="text-sm text-muted-foreground">60 min</span>
                </div>
                <Slider
                  value={[formData.minHabit]}
                  onValueChange={(value) => setFormData({ ...formData, minHabit: value[0] })}
                  max={60}
                  min={1}
                  step={1}
                  className="my-6"
                />
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {formData.minHabit < 5 && "Perfect for beginners! 🌱"}
                  {formData.minHabit >= 5 && formData.minHabit < 15 && "Great sustainable commitment! ⚡"}
                  {formData.minHabit >= 15 && formData.minHabit < 30 && "Ambitious! I like it! 🔥"}
                  {formData.minHabit >= 30 && "Warrior mode activated! 💪"}
                </p>
              </div>
            </div>

            {/* Reminder Time */}
            <div className="space-y-3">
              <Label htmlFor="reminderTime" className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Reminder Time
              </Label>
              <Input
                id="reminderTime"
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                className="text-lg h-14"
              />
              <p className="text-sm text-muted-foreground">
                We'll send you a gentle reminder at this time
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Why It Matters */}
            <div className="space-y-3">
              <Label htmlFor="why" className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Why does this habit matter to you?
              </Label>
              <Textarea
                id="why"
                value={formData.whyItMatters}
                onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
                placeholder="When motivation fades, this is what will keep you going..."
                className="min-h-32 text-base"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                💡 Tip: Connect this to your deeper values and long-term goals
              </p>
            </div>

            {/* Accountability */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Accountability Level
              </Label>
              <RadioGroup
                value={formData.accountability}
                onValueChange={(value) => setFormData({ ...formData, accountability: value as any })}
              >
                <div className="space-y-3">
                  {accountabilityOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <div>
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Streak Goal */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Streak Goal
              </Label>
              <Select
                value={formData.streakGoal.toString()}
                onValueChange={(value) => setFormData({ ...formData, streakGoal: parseInt(value) })}
              >
                <SelectTrigger className="text-lg h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days - Quick win 🎯</SelectItem>
                  <SelectItem value="7">7 days - One week strong 💪</SelectItem>
                  <SelectItem value="14">14 days - Building momentum ⚡</SelectItem>
                  <SelectItem value="21">21 days - Habit formation 🌱</SelectItem>
                  <SelectItem value="30">30 days - Champion status 🏆</SelectItem>
                  <SelectItem value="100">100 days - Legend mode 👑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Preview Card */}
            <Card className="bg-gradient-to-br from-primary/20 to-success/20 border-primary p-6">
              <div className="flex items-start gap-4">
                <div className="text-5xl">
                  {categories.find(c => c.value === formData.category)?.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{formData.name}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{formData.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="capitalize">{formData.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.minHabit} min minimum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-warning" />
                      <span>{difficultyLevels.find(d => d.value === formData.difficulty)?.xp} XP per completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Motivation */}
            <Card className="bg-card border-border p-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Your Why
              </h4>
              <p className="text-muted-foreground italic">&quot;{formData.whyItMatters}&quot;</p>
            </Card>

            {/* Details */}
            <Card className="bg-card border-border p-6">
              <h4 className="font-semibold mb-3">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reminder:</span>
                  <span className="font-medium">{formData.reminderTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accountability:</span>
                  <span className="font-medium capitalize">{formData.accountability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Streak Goal:</span>
                  <span className="font-medium">{formData.streakGoal} days</span>
                </div>
              </div>
            </Card>

            {/* Character Reaction */}
            <Card className="bg-primary/10 border-primary/20 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-8 h-8 text-primary mt-1 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-primary mb-1">
                    {userData?.championArchetype || 'Sage'} says:
                  </p>
                  <p className="text-foreground">{getCharacterReaction()}</p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                Create New Habit
              </h1>
              <p className="text-muted-foreground mt-1">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2 mb-4" />
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center gap-1 ${
                      index === currentStep
                        ? 'text-primary'
                        : index < currentStep
                        ? 'text-success'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <StepIcon className="w-6 h-6" />
                    <span className="text-xs hidden md:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

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

        {/* Step Content */}
        <Card className="p-6 md:p-8 mb-8">
          {renderStep()}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
            disabled={saving}
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            className="gap-2 bg-primary hover:bg-primary-dark"
            disabled={saving}
          >
            {saving ? (
              'Creating...'
            ) : currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Create Habit
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddHabitForm;
