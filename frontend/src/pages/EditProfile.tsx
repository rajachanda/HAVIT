import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useFirebase';
import { updateUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User } from 'lucide-react';

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

export default function EditProfile() {
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
    language: '',
    avatar: '1',
  });

  useEffect(() => {
    if (userData) {
      setProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        age: userData.age?.toString() || '',
        gender: userData.gender || '',
        location: userData.location || '',
        language: userData.language || '',
        avatar: userData.avatar || '1',
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.uid) return;

    // Validation
    if (!profile.firstName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!profile.username.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

    if (profile.age && (parseInt(profile.age) < 13 || parseInt(profile.age) > 120)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid age',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Build update object, excluding undefined values
      const updates: any = {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        username: profile.username.trim(),
        gender: profile.gender,
        location: profile.location.trim(),
        language: profile.language,
        avatar: profile.avatar,
        needsProfileCompletion: false,
      };

      // Only add age if it has a value
      if (profile.age) {
        updates.age = parseInt(profile.age);
      }

      const result = await updateUser(currentUser.uid, updates);

      if (result.success) {
        toast({
          title: 'Success! 🎉',
          description: 'Your profile has been updated',
        });
        setTimeout(() => navigate('/profile'), 1000);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted-foreground">Update your personal information</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-card border-border p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Choose Avatar
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

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  placeholder="John"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
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
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
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

            {/* Location */}
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
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={profile.language} onValueChange={(value) => setProfile({ ...profile, language: value })}>
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
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/profile')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
