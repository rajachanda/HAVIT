import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Target, TrendingUp, Plus, Crown } from "lucide-react";

const Squad = () => {
  const squad = {
    name: "Morning Warriors",
    members: [
      { name: "You", level: 12, contribution: 240, role: "Leader" },
      { name: "Sarah K.", level: 15, contribution: 310, role: "Member" },
      { name: "Mike T.", level: 10, contribution: 180, role: "Member" },
      { name: "Alex J.", level: 14, contribution: 270, role: "Member" },
    ],
    goal: 1000,
    progress: 1000,
    rank: 3,
  };

  const otherSquads = [
    { name: "Sunrise Champions", members: 5, totalXP: 1450, rank: 1 },
    { name: "Habit Heroes", members: 4, totalXP: 1280, rank: 2 },
    { name: "Dawn Patrol", members: 4, totalXP: 920, rank: 4 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-9 h-9 text-primary" />
              Squad
            </h1>
            <p className="text-muted-foreground mt-1">
              Team up with friends for collective goals
            </p>
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary-dark shadow-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Squad
          </Button>
        </div>

        {/* Squad Overview */}
        <Card className="bg-gradient-to-br from-primary/20 to-success/20 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {squad.name}
                <Badge variant="secondary" className="bg-warning/20 text-warning">
                  Rank #{squad.rank}
                </Badge>
              </h2>
              <p className="text-muted-foreground mt-1">
                {squad.members.length} active members
              </p>
            </div>
            <Button variant="outline">Invite Members</Button>
          </div>

          {/* Team Goal Progress */}
          <div className="bg-background/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Team Goal: Complete 1000 Combined Habits
              </span>
              <span className="font-bold text-success">
                {squad.progress} / {squad.goal}
              </span>
            </div>
            <Progress value={(squad.progress / squad.goal) * 100} className="h-4 mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              🎉 Goal achieved! Setting new target...
            </p>
          </div>

          {/* Member List */}
          <div className="space-y-3">
            {squad.members.map((member, index) => (
              <div
                key={index}
                className="bg-background/50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 shadow-md">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{member.name}</span>
                      {member.role === "Leader" && (
                        <Crown className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Level {member.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">
                    {member.contribution} XP
                  </div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Squad Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/60 backdrop-blur-xl p-6 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{squad.progress}</div>
            <div className="text-sm text-muted-foreground">Total Completions</div>
          </Card>
          <Card className="bg-card/60 backdrop-blur-xl p-6 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">{squad.members.length}</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </Card>
          <Card className="bg-card/60 backdrop-blur-xl p-6 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <Target className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">#{squad.rank}</div>
            <div className="text-sm text-muted-foreground">Global Rank</div>
          </Card>
        </div>

        {/* Other Squads */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Other Squads</h2>
          <div className="space-y-3">
            {otherSquads.map((otherSquad, index) => (
              <Card
                key={index}
                className="bg-card/60 backdrop-blur-xl p-4 hover:bg-card-hover transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        #{otherSquad.rank}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{otherSquad.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {otherSquad.members} members
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {otherSquad.totalXP} XP
                    </div>
                    <p className="text-xs text-muted-foreground">Total this week</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Join Squad CTA */}
        <Card className="bg-card/60 backdrop-blur-xl p-8 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            Want to Join Another Squad?
          </h3>
          <p className="text-muted-foreground mb-4">
            Find squads looking for new members or create your own
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline">Browse Squads</Button>
            <Button className="bg-primary hover:bg-primary-dark">Create New Squad</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Squad;
