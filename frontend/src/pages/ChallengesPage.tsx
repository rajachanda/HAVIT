import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, Users, Trophy, Calendar, Plus, Timer, Inbox, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges, useChallengeStats, useChallenge } from "@/hooks/useChallenges";
import { Challenge as ChallengeType } from "@/services/challengesService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChallengeRequests from "@/components/ChallengeRequests";
import { AISageChallengeList } from "@/components/AISageChallenge";
import { NewChallengeDialog } from "@/components/NewChallengeDialog";
import { RealtimeBadge } from "@/components/RealtimeBadge";

// Individual Challenge Card Component
const ChallengeCard = ({ challenge }: { challenge: ChallengeType }) => {
  const { daysLeft, myPercentage, opponentPercentage, competitionStatus, isComplete } = useChallenge(challenge);

  const getStatusColor = (status: string) => {
    if (status === "victory") return "bg-success/20 text-success border-success/50";
    if (status === "defeated") return "bg-destructive/20 text-destructive border-destructive/50";
    if (status === "tied") return "bg-primary/20 text-primary border-primary/50";
    return "bg-warning/20 text-warning border-warning/50";
  };

  const getStatusLabel = (status: string) => {
    if (status === "victory") return "Victory! 🏆";
    if (status === "defeated") return "Defeated";
    if (status === "tied") return "Tied";
    return "Active";
  };

  return (
    <Card className="bg-card border-border p-6 shadow-card hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-foreground">{challenge.habitName}</h3>
            <Badge variant="outline" className={getStatusColor(challenge.status)}>
              {getStatusLabel(challenge.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              vs {challenge.opponentName}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {isComplete ? "Completed" : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
        </div>

        {/* Opponent Avatar */}
        <Avatar className="w-12 h-12 border-2 border-border">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {challenge.opponentAvatar || challenge.opponentName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Progress Comparison */}
      <div className="space-y-4">
        {/* Your Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">You</span>
            <span className="text-sm font-bold text-primary">
              {challenge.myProgress}/{challenge.duration}
            </span>
          </div>
          <Progress
            value={myPercentage}
            className="h-3 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{myPercentage}%</p>
        </div>

        {/* Opponent's Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {challenge.opponentName}
            </span>
            <span className="text-sm font-bold text-muted-foreground">
              {challenge.opponentProgress}/{challenge.duration}
            </span>
          </div>
          <Progress
            value={opponentPercentage}
            className="h-3 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{opponentPercentage}%</p>
        </div>
      </div>

      {/* Competition Status */}
      {challenge.status === "active" && (
        <div className="mt-4 text-center">
          <p className={`text-sm font-medium ${competitionStatus.color}`}>
            {competitionStatus.text}
          </p>
        </div>
      )}
    </Card>
  );
};

const Challenges = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { challenges, loading: challengesLoading, error } = useChallenges(currentUser?.uid || null);
  const stats = useChallengeStats(challenges);
  const [newChallengeOpen, setNewChallengeOpen] = useState(false);

  if (authLoading || challengesLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect or show message
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="bg-card border-border p-12 text-center shadow-card max-w-md">
          <Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Please sign in</h3>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your challenges.
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  // Show error if there's an issue loading challenges
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="bg-card border-border p-12 text-center shadow-card max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Error loading challenges</h3>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Swords className="w-9 h-9 text-primary" />
              Challenges
              <RealtimeBadge />
            </h1>
            <p className="text-muted-foreground mt-1">
              Compete with friends in real-time habit duels
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary"
            onClick={() => setNewChallengeOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Challenge
          </Button>
        </div>

        {/* New Challenge Dialog */}
        <NewChallengeDialog 
          open={newChallengeOpen} 
          onOpenChange={setNewChallengeOpen}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Challenges */}
          <Card className="bg-card border-border p-6 text-center shadow-card hover:shadow-lg transition-shadow">
            <Swords className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">
              {stats.activeCount}
            </div>
            <div className="text-sm text-muted-foreground">Active Challenges</div>
          </Card>

          {/* Victories */}
          <Card className="bg-card border-border p-6 text-center shadow-card hover:shadow-lg transition-shadow">
            <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-success">
              {stats.victoriesCount}
            </div>
            <div className="text-sm text-muted-foreground">Victories</div>
          </Card>

          {/* Opponents */}
          <Card className="bg-card border-border p-6 text-center shadow-card hover:shadow-lg transition-shadow">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">
              {stats.uniqueOpponents}
            </div>
            <div className="text-sm text-muted-foreground">Opponents</div>
          </Card>
        </div>

        {/* Tabs for different challenge types */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Swords className="w-4 h-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="ai-sage" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Sage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {/* Active Challenges Grid */}
            {challenges.filter(c => c.status === 'active' && c.challengeType === 'pvp').length === 0 ? (
              <Card className="bg-card border-border p-12 text-center shadow-card">
                <Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No active challenges</h3>
                <p className="text-muted-foreground mb-6">
                  Challenge your friends to build habits together and compete in real-time!
                </p>
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setNewChallengeOpen(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Challenge
                </Button>
              </Card>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challenges.filter(c => c.status === 'active' && c.challengeType === 'pvp').map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <ChallengeRequests />
          </TabsContent>

          <TabsContent value="ai-sage" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {/* AI Sage Challenge List - Auto-generated challenges */}
              <AISageChallengeList />
              
              {/* Active AI Sage Challenges */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Active AI Sage Challenges</h3>
                {challenges.filter(c => c.challengeType === 'ai-sage' && c.status === 'active').length === 0 ? (
                  <Card className="bg-card border-border p-12 text-center shadow-card">
                    <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No active AI Sage challenges</h3>
                    <p className="text-muted-foreground">
                      Accept a challenge above to begin!
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {challenges.filter(c => c.challengeType === 'ai-sage' && c.status === 'active').map((challenge) => (
                      <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section - Challenge Friends */}
        {challenges.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/20 to-warning/20 border-primary p-8 text-center shadow-card">
            <Swords className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Ready for More Competition?</h3>
            <p className="text-muted-foreground mb-4">
              Challenge your friends to build habits together
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              onClick={() => setNewChallengeOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Challenge a Friend
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Challenges;
