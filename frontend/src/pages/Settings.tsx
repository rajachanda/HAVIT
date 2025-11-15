import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Lock, Palette, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
      navigate("/login");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="w-9 h-9 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize your ReHabit experience
          </p>
        </div>

        {/* Account Settings */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Account Settings</h2>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue="User Alex" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                defaultValue="alex@rehabit.app"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Change Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter new password"
                className="bg-background"
              />
            </div>
            <Button className="bg-primary hover:bg-primary-dark">Save Changes</Button>
          </form>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded to complete your habits
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Challenge Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when friends complete challenges
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Squad Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Updates from your squad members
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Achievement Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Celebrate when you unlock achievements
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">AI Insights</Label>
                <p className="text-sm text-muted-foreground">
                  Daily personalized tips from Sage AI
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Privacy</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your profile
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Show on Leaderboard</Label>
                <p className="text-sm text-muted-foreground">
                  Display your rank publicly
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Activity Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Share your habit completions with friends
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Champion Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Warrior", "Mage", "Rogue", "Guardian"].map((type) => (
                  <Button
                    key={type}
                    variant={type === "Warrior" ? "default" : "outline"}
                    className="w-full"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-card border-destructive/50 p-6">
          <h2 className="text-xl font-bold text-destructive mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full border-warning text-warning hover:bg-warning/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
              Reset All Progress
            </Button>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
