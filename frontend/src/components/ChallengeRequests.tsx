import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Swords, Clock, Coins, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Challenge, acceptChallenge, rejectChallenge } from '@/services/challengesService';

export default function ChallengeRequests() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef,
      where('userId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challenges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      
      setPendingChallenges(challenges.sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      ));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAccept = async (challenge: Challenge) => {
    try {
      await acceptChallenge(challenge.id, currentUser!.uid);
      toast({
        title: '⚔️ Challenge Accepted!',
        description: `You're now battling ${challenge.opponentName} for ${challenge.stakeXP} XP!`,
      });
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept challenge. You may not have enough XP.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (challengeId: string, opponentName: string) => {
    try {
      await rejectChallenge(challengeId);
      toast({
        title: 'Challenge Declined',
        description: `You declined ${opponentName}'s challenge.`,
      });
    } catch (error) {
      console.error('Error rejecting challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject challenge.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  if (pendingChallenges.length === 0) {
    return (
      <Card className="bg-card border-border p-12 text-center shadow-card">
        <Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No pending challenges</h3>
        <p className="text-muted-foreground">
          When friends challenge you, they'll appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Challenge Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingChallenges.map((challenge) => (
          <Card key={challenge.id} className="bg-card border-border p-6 shadow-card hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-warning">
                  <AvatarFallback className="bg-warning text-warning-foreground">
                    {challenge.opponentAvatar || challenge.opponentName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground">{challenge.opponentName}</h3>
                  <p className="text-sm text-muted-foreground">challenged you!</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-warning/20 text-warning border-warning/50">
                Pending
              </Badge>
            </div>

            {/* Challenge Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Habit</p>
                  <p className="font-semibold text-foreground">{challenge.habitName}</p>
                  <p className="text-xs text-muted-foreground">{challenge.habitCategory}</p>
                </div>
                <Badge variant="outline">{challenge.duration} days</Badge>
              </div>

              {/* Stake */}
              <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-warning/20 to-primary/20 rounded-lg">
                <Coins className="w-6 h-6 text-warning" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{challenge.stakeXP}</p>
                  <p className="text-xs text-muted-foreground">XP at stake</p>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Winner takes {challenge.stakeXP * 2} XP total!
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-destructive/50 hover:bg-destructive/10"
                onClick={() => handleReject(challenge.id, challenge.opponentName)}
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handleAccept(challenge)}
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
