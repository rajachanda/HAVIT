import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  fullName: string;
  age: number;
  gender: string;
  location: string;
  language: string;
  username: string;
  avatar: string;
}

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    age: 18,
    gender: '',
    location: '',
    language: 'English',
    username: '',
    avatar: 'warrior',
  });

  const steps = [
    { field: 'fullName', label: 'What should we call you?', type: 'text', placeholder: 'Enter your full name' },
    { field: 'age', label: 'How old are you?', type: 'number', placeholder: 'Enter your age' },
    { field: 'gender', label: 'How do you identify?', type: 'radio' },
    { field: 'location', label: 'Where are you from?', type: 'text', placeholder: 'City, Country', optional: true },
    { field: 'language', label: 'Preferred language?', type: 'select' },
    { field: 'username', label: 'Choose a username', type: 'text', placeholder: '@username' },
    { field: 'avatar', label: 'Pick your character style', type: 'avatar' },
  ];

  const avatarOptions = [
    { id: 'warrior', emoji: '⚔️', name: 'Warrior' },
    { id: 'mage', emoji: '🧙', name: 'Mage' },
    { id: 'rogue', emoji: '🗡️', name: 'Rogue' },
    { id: 'paladin', emoji: '🛡️', name: 'Paladin' },
    { id: 'ranger', emoji: '🏹', name: 'Ranger' },
    { id: 'monk', emoji: '🥋', name: 'Monk' },
  ];

  const languages = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Chinese', 'Japanese'];

  const handleNext = async () => {
    const currentField = steps[currentStep];
    
    // Validation
    if (!currentField.optional) {
      const value = profile[currentField.field as keyof ProfileData];
      if (!value || value === '') {
        toast({
          title: 'Required field',
          description: `Please fill in ${currentField.label}`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save to Firestore and navigate
      await saveProfile();
    }
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          onboardingResponses: {
            profileSetup: profile,
            profileCompletedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      toast({
        title: 'Profile saved!',
        description: "Let's learn more about you...",
      });

      navigate('/onboarding/universal-questions');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (steps[currentStep].optional) {
      handleNext();
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const field = step.field as keyof ProfileData;

    switch (step.type) {
      case 'text':
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <Label htmlFor={field} className="text-2xl font-bold text-foreground">
              {step.label}
            </Label>
            <Input
              id={field}
              type="text"
              value={profile[field]}
              onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              placeholder={step.placeholder}
              className="text-lg h-14"
              autoFocus
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <Label htmlFor={field} className="text-2xl font-bold text-foreground">
              {step.label}
            </Label>
            <Input
              id={field}
              type="number"
              min={18}
              max={100}
              value={profile[field]}
              onChange={(e) => setProfile({ ...profile, [field]: parseInt(e.target.value) })}
              placeholder={step.placeholder}
              className="text-lg h-14"
              autoFocus
            />
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <Label className="text-2xl font-bold text-foreground">{step.label}</Label>
            <RadioGroup
              value={profile.gender}
              onValueChange={(value) => setProfile({ ...profile, gender: value })}
            >
              <div className="space-y-3">
                {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-lg cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <Label className="text-2xl font-bold text-foreground">{step.label}</Label>
            <Select
              value={profile.language}
              onValueChange={(value) => setProfile({ ...profile, language: value })}
            >
              <SelectTrigger className="text-lg h-14">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'avatar':
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <Label className="text-2xl font-bold text-foreground">{step.label}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {avatarOptions.map((avatar) => (
                <Button
                  key={avatar.id}
                  type="button"
                  variant={profile.avatar === avatar.id ? 'default' : 'outline'}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${
                    profile.avatar === avatar.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setProfile({ ...profile, avatar: avatar.id })}
                >
                  <span className="text-4xl">{avatar.emoji}</span>
                  <span className="text-sm">{avatar.name}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/60 backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold text-foreground">Profile Setup</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1}/{steps.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Sage Comment */}
        <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <User className="w-8 h-8 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">Sage AI</p>
              <p className="text-sm text-muted-foreground">
                {currentStep === 0 && "Nice to meet you! Let's build your profile together."}
                {currentStep === 1 && "Age helps me personalize your experience!"}
                {currentStep === 2 && "This helps me understand you better."}
                {currentStep === 3 && "Where you are can help with timezone-based reminders."}
                {currentStep === 4 && "I'll speak your language!"}
                {currentStep === 5 && "Pick something cool - your squad will see this!"}
                {currentStep === 6 && "Choose your champion archetype!"}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {steps[currentStep].optional && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary-dark">
              {currentStep === steps.length - 1 ? 'Continue' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Time estimate */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            ⏱️ About {Math.max(3 - currentStep, 1)} minutes remaining
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSetup;
