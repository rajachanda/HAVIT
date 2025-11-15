import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { addHabit } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Zap, Sparkles } from 'lucide-react';

interface QuickAddHabitProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = [
  { value: 'health', label: '💪 Health', emoji: '💪' },
  { value: 'learning', label: '📚 Learning', emoji: '📚' },
  { value: 'wellness', label: '🧘 Wellness', emoji: '🧘' },
  { value: 'social', label: '👥 Social', emoji: '👥' },
  { value: 'productivity', label: '⚡ Productivity', emoji: '⚡' },
  { value: 'creativity', label: '🎨 Creativity', emoji: '🎨' },
  { value: 'finance', label: '💰 Finance', emoji: '💰' },
  { value: 'other', label: '✨ Other', emoji: '✨' },
];

export function QuickAddHabit({ open, onOpenChange, onSuccess }: QuickAddHabitProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    frequency: 'daily',
    difficulty: 'easy',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.uid) return;

    if (!formData.name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a habit name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: 'Category Required',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Auto-set defaults for lazy people
      const xpReward = formData.difficulty === 'easy' ? 5 : formData.difficulty === 'medium' ? 10 : 20;
      const reminderTime = '09:00'; // Default morning reminder

      const result = await addHabit(currentUser.uid, {
        name: formData.name.trim(),
        category: formData.category,
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly',
        reminderTime,
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
        xpReward,
        completions: [],
        createdAt: new Date(),
      });

      if (result.success) {
        toast({
          title: 'Habit Added! ⚡',
          description: `${formData.name} is ready to rock!`,
        });

        // Reset form
        setFormData({
          name: '',
          category: '',
          frequency: 'daily',
          difficulty: 'easy',
        });

        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(result.error || 'Failed to add habit');
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add habit',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="w-6 h-6 text-warning" />
            Quick Add Habit
          </DialogTitle>
          <DialogDescription>
            Just the essentials! Perfect for when you're feeling lazy 😴
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question 1: What's the habit? */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              1. What's the habit? 🎯
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning workout, Read 20 pages..."
              required
              autoFocus
            />
          </div>

          {/* Question 2: Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-semibold">
              2. What type? 🏷️
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question 3: How often? */}
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-base font-semibold">
              3. How often? 📅
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.frequency === 'daily' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, frequency: 'daily' })}
                className="w-full"
              >
                Daily
              </Button>
              <Button
                type="button"
                variant={formData.frequency === 'weekly' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, frequency: 'weekly' })}
                className="w-full"
              >
                Weekly
              </Button>
              <Button
                type="button"
                variant={formData.frequency === 'monthly' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, frequency: 'monthly' })}
                className="w-full"
              >
                Monthly
              </Button>
            </div>
          </div>

          {/* Question 4: Difficulty (Optional but quick) */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-base font-semibold">
              4. How hard? 💪
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.difficulty === 'easy' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, difficulty: 'easy' })}
                className={formData.difficulty === 'easy' ? 'bg-success' : ''}
              >
                🟢 Easy
                <span className="text-xs ml-1">(5XP)</span>
              </Button>
              <Button
                type="button"
                variant={formData.difficulty === 'medium' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, difficulty: 'medium' })}
                className={formData.difficulty === 'medium' ? 'bg-warning' : ''}
              >
                🟡 Medium
                <span className="text-xs ml-1">(10XP)</span>
              </Button>
              <Button
                type="button"
                variant={formData.difficulty === 'hard' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, difficulty: 'hard' })}
                className={formData.difficulty === 'hard' ? 'bg-destructive' : ''}
              >
                🔴 Hard
                <span className="text-xs ml-1">(20XP)</span>
              </Button>
            </div>
          </div>

          {/* Auto-set info */}
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Auto-set: Morning reminder (9:00 AM) • Smart defaults applied
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Add
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
