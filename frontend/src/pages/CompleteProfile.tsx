import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useFirebase';
import { updateUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User, Sparkles } from 'lucide-react';

const avatars = [
  { id: '1', emoji: '😊', name: 'Happy' },
  { id: '2', emoji: '🚀', name: 'Rocket' },
  { id: '3', emoji: '💪', name: 'Strong' },
  { id: '4', emoji: '🎯', name: 'Target' },
  { id: '5', emoji: '⚡', name: 'Energy' },
  { id: '6', emoji: '🌟', name: 'Star' },
  { id: '7', emoji: '🔥', name: 'Fire' },
  { id: '8', emoji: '🦄', name: 'Unicorn' },
];

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Other'
];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: userData, isLoading } = useUser(currentUser?.uid || null);
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    age: '',
    gender: '',
    location: '',
    language: 'english',
    avatar: '1',
  });

  useEffect(() => {
    // Pre-fill with existing data if available
    if (userData) {
      setProfile({
        firstName: userData.firstName || currentUser?.displayName?.split(' ')[0] || '',
        lastName: userData.lastName || currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
        username: userData.username || '',
        age: userData.age?.toString() || '',
        gender: userData.gender || '',
        location: userData.location || '',
        language: userData.language || 'english',
        avatar: userData.avatar || '1',
      });
    }
  }, [userData, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.uid) return;

    // Validation
    if (!profile.username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username',
        variant: 'destructive',
      });
      return;
    }

    if (!profile.age || parseInt(profile.age) < 13 || parseInt(profile.age) > 120) {
      toast({
        title: 'Valid Age Required',
        description: 'Please enter a valid age (13-120)',
        variant: 'destructive',
      });
      return;
    }

    if (!profile.gender) {
      toast({
        title: 'Gender Required',
        description: 'Please select your gender',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const updates: any = {
        firstName: profile.firstName.trim() || currentUser.displayName?.split(' ')[0] || 'User',
        lastName: profile.lastName.trim() || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        username: profile.username.trim(),
        age: parseInt(profile.age),
        gender: profile.gender,
        location: profile.location.trim(),
        language: profile.language,
        avatar: profile.avatar,
        needsProfileCompletion: false,
      };

      const result = await updateUser(currentUser.uid, updates);

      if (result.success) {
        toast({
          title: 'Profile Complete! 🎉',
          description: 'Welcome to Havit!',
        });
        
        // Check if user completed onboarding
        if (userData?.onboardingCompleted) {
          navigate('/dashboard');
        } else {
          // New user - continue to onboarding questions
          navigate('/onboarding/universal-questions');
        }
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Tell us a bit about yourself to get started with Havit
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Choose Your Avatar
            </Label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setProfile({ ...profile, avatar: avatar.id })}
                  className={`
                    p-3 rounded-lg border-2 transition-all hover:scale-110
                    ${profile.avatar === avatar.id 
                      ? 'border-primary bg-primary/10 scale-110' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="text-3xl">{avatar.emoji}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              placeholder="johndoe123"
              required
              autoComplete="username"
            />
            <p className="text-xs text-muted-foreground">
              This will be your unique identifier on Havit
            </p>
          </div>

          {/* First Name & Last Name (Optional - pre-filled from Google) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name (Optional)</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                placeholder="John"
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name (Optional)</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                placeholder="Doe"
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={profile.gender} 
                onValueChange={(value) => setProfile({ ...profile, gender: value })}
                required
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="New York, USA"
              autoComplete="address-level2"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language *</Label>
            <Select 
              value={profile.language} 
              onValueChange={(value) => setProfile({ ...profile, language: value })}
              required
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang.toLowerCase()}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                Continue to Havit
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
