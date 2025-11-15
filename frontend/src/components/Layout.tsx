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
import { NotificationBell } from "./NotificationBell";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

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
      <div className="sticky top-0 z-50 px-4 pt-4">
        <nav className="bg-card/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="/Character_Img/Logo.png" 
                alt="Havit Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-accent">Havit</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`gap-2 ${
                      isActive(item.path)
                        ? "bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
                        : "text-secondary hover:text-accent hover:bg-accent/10"
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
                className="text-secondary hover:text-accent hover:bg-accent/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className={isActive("/settings") ? "bg-accent/20 text-accent" : "text-secondary hover:text-accent hover:bg-accent/10"}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/profile">
                <Avatar className="cursor-pointer shadow-lg hover:shadow-xl transition-all">
                  <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                    UA
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
                      ? "bg-accent text-accent-foreground shadow-lg"
                      : "text-secondary hover:text-accent hover:bg-accent/10"
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
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
