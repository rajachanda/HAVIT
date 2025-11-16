import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Target, TrendingUp, Plus, Crown, UserPlus, LogOut, Swords } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSquad } from "@/hooks/useSquad";
import { useSquadMembers } from "@/hooks/useSquadMembers";
import { useSquadLeaderboard } from "@/hooks/useSquadLeaderboard";
import { useState } from "react";
import { squadService } from "@/services/squadService";
import { awardXP, XP_REWARDS } from "@/services/xpService";


// Static data for demonstration
const STATIC_SQUAD_DATA = {
  id: "squad-1",
  name: "Thunder Squad",
  description: "Elite habit crushers",
  createdBy: "user-1",
  members: ["user-1", "user-2", "user-3", "user-4"],
  totalXP: 12450,
  goal: 15000,
  progress: 12450,
  rank: 3,
  createdAt: new Date("2024-11-01"),
  updatedAt: new Date(),
};

const STATIC_MEMBERS = [
  {
    userId: "user-1",
    username: "alex_warrior",
    firstName: "Alex",
    level: 24,
    role: "leader" as const,
    contribution: 4200,
    completedHabits: 28,
    joinedAt: new Date("2024-11-01"),
  },
  {
    userId: "user-2",
    username: "sarah_champion",
    firstName: "Sarah",
    level: 22,
    role: "member" as const,
    contribution: 3850,
    completedHabits: 25,
    joinedAt: new Date("2024-11-02"),
  },
  {
    userId: "user-3",
    username: "mike_legend",
    firstName: "Mike",
    level: 20,
    role: "member" as const,
    contribution: 2900,
    completedHabits: 19,
    joinedAt: new Date("2024-11-03"),
  },
  {
    userId: "user-4",
    username: "emma_titan",
    firstName: "Emma",
    level: 18,
    role: "member" as const,
    contribution: 1500,
    completedHabits: 10,
    joinedAt: new Date("2024-11-05"),
  },
];

const STATIC_OTHER_SQUADS = [
  {
    id: "squad-2",
    name: "Habit Heroes",
    members: ["u1", "u2", "u3", "u4", "u5"],
    totalXP: 18900,
    rank: 1,
  },
  {
    id: "squad-3",
    name: "The Grinders",
    members: ["u6", "u7", "u8", "u9"],
    totalXP: 15200,
    rank: 2,
  },
  {
    id: "squad-4",
    name: "Consistency Crew",
    members: ["u10", "u11", "u12"],
    totalXP: 10500,
    rank: 4,
  },
  {
    id: "squad-5",
    name: "Daily Dominators",
    members: ["u13", "u14", "u15", "u16", "u17"],
    totalXP: 9800,
    rank: 5,
  },
  {
    id: "squad-6",
    name: "Streak Masters",
    members: ["u18", "u19"],
    totalXP: 8200,
    rank: 6,
  },
];

// Squads available to join (not user's current squad)
const AVAILABLE_SQUADS = [
  {
    id: "squad-7",
    name: "Morning Warriors",
    description: "Early risers crushing habits before sunrise",
    members: ["u20", "u21", "u22"],
    totalXP: 7500,
    membersCount: 3,
    isPublic: true,
  },
  {
    id: "squad-8",
    name: "Fitness Fanatics",
    description: "Dedicated to health and fitness goals",
    members: ["u23", "u24", "u25", "u26"],
    totalXP: 9200,
    membersCount: 4,
    isPublic: true,
  },
  {
    id: "squad-9",
    name: "Study Squad",
    description: "Students building productive study habits",
    members: ["u27", "u28"],
    totalXP: 5800,
    membersCount: 2,
    isPublic: true,
  },
];


const Squad = () => {
  const { currentUser } = useAuth();
  const { squad: firebaseSquad, loading } = useSquad(currentUser?.uid || null);
  const { members: firebaseMembers } = useSquadMembers(firebaseSquad?.id || null);
  const { squads: firebaseOtherSquads } = useSquadLeaderboard(firebaseSquad?.id);
  const { toast } = useToast();

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [squadName, setSquadName] = useState("");
  const [squadDescription, setSquadDescription] = useState("");
  const [squadGoal, setSquadGoal] = useState("1000");
  const [inviteUsername, setInviteUsername] = useState("");

  // Use Firebase data if available, otherwise use static data
  const squad = firebaseSquad || STATIC_SQUAD_DATA;
  const members = firebaseMembers.length > 0 ? firebaseMembers : STATIC_MEMBERS;
  const otherSquads = firebaseOtherSquads.length > 0 ? firebaseOtherSquads : STATIC_OTHER_SQUADS;

  // Action handlers
  const handleCreateSquad = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a squad",
        variant: "destructive",
      });
      return;
    }

    if (!squadName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a squad name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await squadService.createSquad(
        currentUser.uid,
        squadName.trim(),
        squadDescription.trim(),
        parseInt(squadGoal) || 1000
      );

      // Award XP for creating a squad
      await awardXP(currentUser.uid, XP_REWARDS.CREATE_CHALLENGE, "create_squad");

      toast({
        title: "Success! 🎉",
        description: `Squad "${squadName}" created successfully! +${XP_REWARDS.CREATE_CHALLENGE} XP`,
      });

      setCreateDialogOpen(false);
      setSquadName("");
      setSquadDescription("");
      setSquadGoal("1000");
    } catch (error) {
      console.error("Error creating squad:", error);
      toast({
        title: "Error",
        description: "Failed to create squad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSquad = async (squadId: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to join a squad",
        variant: "destructive",
      });
      return;
    }

    try {
      await squadService.joinSquad(currentUser.uid, squadId);
      
      // Award XP for joining a squad
      await awardXP(currentUser.uid, XP_REWARDS.JOIN_CHALLENGE, "join_squad");

      toast({
        title: "Success! 🎉",
        description: `Joined squad successfully! +${XP_REWARDS.JOIN_CHALLENGE} XP`,
      });
    } catch (error) {
      console.error("Error joining squad:", error);
      toast({
        title: "Error",
        description: "Failed to join squad. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveSquad = async () => {
    if (!currentUser || !squad?.id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await squadService.leaveSquad(currentUser.uid, squad.id);

      toast({
        title: "Left Squad",
        description: "You have left the squad",
      });

      setLeaveDialogOpen(false);
    } catch (error) {
      console.error("Error leaving squad:", error);
      toast({
        title: "Error",
        description: "Failed to leave squad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteMembers = () => {
    setInviteDialogOpen(true);
  };

  const handleSendInvite = async () => {
    if (!currentUser || !squad?.id) {
      return;
    }

    if (!inviteUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Find user by username
      const user = await squadService.findUserByUsername(inviteUsername.trim()) as any;
      
      if (!user) {
        toast({
          title: "User Not Found",
          description: `No user found with username "${inviteUsername}"`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if user is already in a squad
      if (user.squadId) {
        toast({
          title: "Already in Squad",
          description: `${inviteUsername} is already in a squad`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if user is already in this squad
      if (squad.members?.includes(user.id)) {
        toast({
          title: "Already a Member",
          description: `${inviteUsername} is already in your squad`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Send invite
      await squadService.inviteToSquad(squad.id, user.id, currentUser.uid);

      toast({
        title: "Invite Sent! 📧",
        description: `Invitation sent to @${inviteUsername}`,
      });

      setInviteDialogOpen(false);
      setInviteUsername("");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        title: "Error",
        description: "Failed to send invite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompeteWithSquad = (squadId: string, squadName: string) => {
    toast({
      title: "Challenge Coming Soon! 🏆",
      description: `Squad vs Squad challenges will be available soon!`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading squad...</p>
        </div>
      </div>
    );
  }

  // Show static data by default
  const progressPercent = squad.goal > 0 ? Math.min((squad.progress / squad.goal) * 100, 100) : 0;
  const totalCompletions = members.reduce((sum, m) => sum + (m.completedHabits || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex gap-3">
              <Users className="w-8 h-8 text-primary" />
              {squad.name}
            </h1>
            <p className="text-muted-foreground mt-1">{members.length} members</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleInviteMembers} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Members
            </Button>
            <Button onClick={() => setLeaveDialogOpen(true)} variant="outline" className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Leave Squad
            </Button>
          </div>
        </div>
        <Card className="bg-gradient-to-br from-primary/20 to-success/20 border-primary p-6">
          <div className="bg-background/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold flex gap-2">
                <Target className="w-5 h-5 text-success" />
                Weekly Goal
              </span>
              <span className="font-bold text-success">{squad.progress} / {squad.goal} XP</span>
            </div>
            <Progress value={progressPercent} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progressPercent >= 100 ? " Goal achieved!" : `${Math.round(progressPercent)}% complete`}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold">Members</h3>
            {members.map((m) => (
              <div key={m.userId} className="bg-background/50 rounded-lg p-3 flex justify-between">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(m.firstName || m.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex gap-2">
                      <span className="font-semibold text-sm">{m.firstName || m.username}</span>
                      {m.role === "leader" && <Crown className="w-4 h-4 text-warning" />}
                    </div>
                    <p className="text-xs text-muted-foreground">Level {m.level || 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-success">{m.contribution || 0} XP</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 text-center">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <div className="text-sm text-muted-foreground">Completions</div>
          </Card>
          <Card className="p-5 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{members.length}</div>
            <div className="text-sm text-muted-foreground">Members</div>
          </Card>
          <Card className="p-5 text-center">
            <Target className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold">#{squad.rank || "—"}</div>
            <div className="text-sm text-muted-foreground">Rank</div>
          </Card>
        </div>

        {/* Browse Squads Section */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-success/10 border-primary/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Want to expand your network?</h3>
              <p className="text-muted-foreground">Discover and compete with other squads to climb the leaderboard!</p>
            </div>
            <Button size="lg" className="whitespace-nowrap">
              <Users className="w-4 h-4 mr-2" />
              Browse All Squads
            </Button>
          </div>
        </Card>

        {otherSquads.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Other Top Squads</h2>
            {otherSquads.slice(0, 5).map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4 items-center flex-1">
                    <Badge variant={s.rank === 1 ? "default" : "outline"} className="text-base px-3 py-1">
                      #{s.rank}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.members?.length || 0} members</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success text-lg">{s.totalXP.toLocaleString()} XP</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCompeteWithSquad(s.id, s.name)}
                    >
                      <Swords className="w-4 h-4 mr-2" />
                      Compete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Available Squads to Join */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Squads Looking for Members</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {AVAILABLE_SQUADS.map((s) => (
              <Card key={s.id} className="p-5 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">{s.membersCount} members</p>
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      {s.totalXP.toLocaleString()} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleJoinSquad(s.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Squad
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Create Your Own Squad CTA */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-success/5">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-5xl">🚀</div>
            <h3 className="text-2xl font-bold">Start Your Own Squad</h3>
            <p className="text-muted-foreground">
              Can't find the perfect squad? Create your own and invite friends to join your journey!
            </p>
            <Button size="lg" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Squad
            </Button>
          </div>
        </Card>

        {/* Create Squad Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Squad</DialogTitle>
              <DialogDescription>
                Create your own squad and invite friends to join your habit-building journey!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="squad-name">Squad Name *</Label>
                <Input
                  id="squad-name"
                  placeholder="Thunder Squad"
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="squad-description">Description</Label>
                <Textarea
                  id="squad-description"
                  placeholder="Elite habit crushers dedicated to daily growth..."
                  value={squadDescription}
                  onChange={(e) => setSquadDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="squad-goal">Weekly XP Goal</Label>
                <Input
                  id="squad-goal"
                  type="number"
                  placeholder="1000"
                  value={squadGoal}
                  onChange={(e) => setSquadGoal(e.target.value)}
                  min="100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateSquad} disabled={isSubmitting || !squadName.trim()}>
                {isSubmitting ? "Creating..." : "Create Squad"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Members Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Members</DialogTitle>
              <DialogDescription>
                Invite friends to join your squad by username
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-username">Username</Label>
                <Input
                  id="invite-username"
                  type="text"
                  placeholder="@username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the username of the person you want to invite
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSendInvite} disabled={isSubmitting || !inviteUsername.trim()}>
                {isSubmitting ? "Sending..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Leave Squad Confirmation */}
        <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave Squad?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave "{squad.name}"? You'll lose access to squad features and your contribution stats.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveSquad} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isSubmitting ? "Leaving..." : "Leave Squad"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Squad;
