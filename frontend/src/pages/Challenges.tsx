import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Swords, Users, Trophy, Calendar, Plus } from "lucide-react";

interface Challenge {
  id: string;
  opponent: string;
  habit: string;
  duration: number;
  daysLeft: number;
  myProgress: number;
  opponentProgress: number;
  status: "active" | "won" | "lost";
}

const Challenges = () => {
  const [challenges] = useState<Challenge[]>([
    {
      id: "1",
      opponent: "Sarah K.",
      habit: "Morning Workout",
      duration: 14,
      daysLeft: 7,
      myProgress: 10,
      opponentProgress: 8,
      status: "active",
    },
    {
      id: "2",
      opponent: "Mike T.",
      habit: "Read 30 Minutes",
      duration: 30,
      daysLeft: 15,
      myProgress: 12,
      opponentProgress: 14,
      status: "active",
    },
    {
      id: "3",
      opponent: "Alex J.",
      habit: "Meditate",
      duration: 7,
      daysLeft: 0,
      myProgress: 7,
      opponentProgress: 5,
      status: "won",
    },
  ]);

  const getStatusColor = (status: string) => {
    if (status === "won") return "bg-success/20 text-success border-success/50";
    if (status === "lost") return "bg-destructive/20 text-destructive border-destructive/50";
    return "bg-warning/20 text-warning border-warning/50";
  };

  const getStatusLabel = (status: string) => {
    if (status === "won") return "Victory!";
    if (status === "lost") return "Defeated";
    return "Active";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Swords className="w-9 h-9 text-warning" />
              Challenges
            </h1>
            <p className="text-muted-foreground mt-1">
              Compete with friends in real-time habit duels
            </p>
          </div>
          <Button size="lg" className="bg-warning text-warning-foreground hover:bg-warning/90">
            <Plus className="w-5 h-5 mr-2" />
            New Challenge
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border p-6 text-center">
            <Swords className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">
              {challenges.filter((c) => c.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Active Challenges</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-success">
              {challenges.filter((c) => c.status === "won").length}
            </div>
            <div className="text-sm text-muted-foreground">Victories</div>
          </Card>
          <Card className="bg-card border-border p-6 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">
              {new Set(challenges.map((c) => c.opponent)).size}
            </div>
            <div className="text-sm text-muted-foreground">Opponents</div>
          </Card>
        </div>

        {/* Active Challenges */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Challenges</h2>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="bg-card border-border p-6 shadow-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{challenge.habit}</h3>
                      <Badge variant="outline" className={getStatusColor(challenge.status)}>
                        {getStatusLabel(challenge.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        vs {challenge.opponent}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {challenge.daysLeft > 0
                          ? `${challenge.daysLeft} days left`
                          : "Completed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Comparison */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">You</span>
                      <span className="text-sm font-bold text-primary">
                        {challenge.myProgress}/{challenge.duration}
                      </span>
                    </div>
                    <Progress
                      value={(challenge.myProgress / challenge.duration) * 100}
                      className="h-3"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {challenge.opponent}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground">
                        {challenge.opponentProgress}/{challenge.duration}
                      </span>
                    </div>
                    <Progress
                      value={(challenge.opponentProgress / challenge.duration) * 100}
                      className="h-3"
                    />
                  </div>
                </div>

                {/* Lead Indicator */}
                {challenge.status === "active" && (
                  <div className="mt-4 text-center">
                    {challenge.myProgress > challenge.opponentProgress ? (
                      <p className="text-sm text-success font-medium">
                        🎯 You're leading by {challenge.myProgress - challenge.opponentProgress}{" "}
                        days!
                      </p>
                    ) : challenge.myProgress < challenge.opponentProgress ? (
                      <p className="text-sm text-warning font-medium">
                        ⚡ {challenge.opponent} is ahead by{" "}
                        {challenge.opponentProgress - challenge.myProgress} days
                      </p>
                    ) : (
                      <p className="text-sm text-primary font-medium">🤝 Tied! Keep pushing!</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Challenge Friends */}
        <Card className="bg-card border-border p-8 text-center">
          <Swords className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Ready for More Competition?</h3>
          <p className="text-muted-foreground mb-4">
            Challenge your friends to build habits together
          </p>
          <Button size="lg" className="bg-warning text-warning-foreground hover:bg-warning/90">
            Challenge a Friend
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Challenges;
