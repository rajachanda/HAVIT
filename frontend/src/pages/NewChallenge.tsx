import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useFirebase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Swords, Calendar } from 'lucide-react';

export default function NewChallenge() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { habits } = useHabits(currentUser?.uid || null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    friendEmail: '',
    habitId: '',
    duration: '7',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.friendEmail || !formData.habitId || !formData.duration) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement challenge creation with Firebase
    toast({
      title: 'Coming Soon! 🚧',
      description: 'Challenge feature is under development',
    });
    
    setTimeout(() => navigate('/challenges'), 1500);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/challenges')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Swords className="w-8 h-8 text-warning" />
              New Challenge
            </h1>
            <p className="text-muted-foreground">Challenge a friend to a habit duel</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-card border-border p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Friend Email */}
            <div className="space-y-2">
              <Label htmlFor="friendEmail">Friend's Email</Label>
              <Input
                id="friendEmail"
                type="email"
                value={formData.friendEmail}
                onChange={(e) => setFormData({ ...formData, friendEmail: e.target.value })}
                placeholder="friend@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                They'll receive a challenge invitation
              </p>
            </div>

            {/* Habit Selection */}
            <div className="space-y-2">
              <Label htmlFor="habit">Select Habit</Label>
              <Select 
                value={formData.habitId} 
                onValueChange={(value) => setFormData({ ...formData, habitId: value })}
              >
                <SelectTrigger id="habit">
                  <SelectValue placeholder="Choose a habit" />
                </SelectTrigger>
                <SelectContent>
                  {habits.length > 0 ? (
                    habits.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id || ''}>
                        {habit.name} - {habit.category}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No habits found. Create one first!
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Challenge Duration
              </Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="21">21 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Both of you will compete to complete the habit more times
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>How it works:</strong> Both you and your friend will track the same habit. 
                The one who completes it more times within the duration wins! 🏆
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/challenges')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
                disabled={habits.length === 0}
              >
                <Swords className="w-4 h-4 mr-2" />
                Send Challenge
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
