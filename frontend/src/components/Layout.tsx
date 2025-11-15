import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ListChecks,
  Swords,
  Trophy,
  Users,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRealtime } from "@/hooks/useFirebase";
import { NotificationBell } from "./NotificationBell";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { userData } = useUserRealtime(currentUser?.uid || null);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ListChecks, label: "Habits", path: "/habits" },
    { icon: Swords, label: "Challenges", path: "/challenges" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: Users, label: "Squad", path: "/squad" },
    { icon: MessageSquare, label: "Community", path: "/community" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="/Character_Img/Logo.png" 
                alt="Havit Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-foreground">Havit</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`gap-2 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className={isActive("/settings") ? "bg-muted" : ""}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/profile">
                <Avatar className="cursor-pointer border-2 border-purple-700/30 hover:border-purple-600/50 transition-colors">
                  <AvatarFallback className="bg-purple-600 text-white font-bold">
                    {(userData?.firstName?.charAt(0) || currentUser?.email?.charAt(0) || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1 mt-3 overflow-x-auto pb-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`gap-2 whitespace-nowrap ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
