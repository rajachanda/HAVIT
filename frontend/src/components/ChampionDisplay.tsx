import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Sparkles, CheckCircle2, Zap, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ThunderAnimation } from "./ThunderAnimation";
import { ShareCharacterModal } from "./ShareCharacterModal";

interface ChampionDisplayProps {
  championType: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalXP?: number;
  userName?: string;
  showThunder?: boolean;
  onThunderComplete?: () => void;
}

// Level names mapping
const LEVEL_NAMES: Record<number, string> = {
  1: "Learner",
  2: "Apprentice",
  3: "Warrior",
  4: "Guardian",
  5: "Champion",
  6: "Master",
  7: "Legend",
  8: "Mythic",
  9: "Transcendent",
};

export const ChampionDisplay = ({
  championType,
  level,
  xp,
  xpToNext,
  totalXP = 0,
  userName,
  showThunder = false,
  onThunderComplete,
}: ChampionDisplayProps) => {
  const [displayLevel, setDisplayLevel] = useState(level);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Get character image path based on level (clamped between 1-9)
  const getCharacterImage = (lvl: number) => {
    const clampedLevel = Math.max(1, Math.min(9, lvl));
    return `/Character_Img/Level ${clampedLevel}.png`;
  };

  // Get level name
  const getLevelName = (lvl: number) => {
    const clampedLevel = Math.max(1, Math.min(9, lvl));
    return LEVEL_NAMES[clampedLevel] || "Unknown";
  };

  // Handle level changes with smooth transition
  useEffect(() => {
    if (level !== displayLevel) {
      setIsTransitioning(true);
      setImageError(false);
      const timer = setTimeout(() => {
        setDisplayLevel(level);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [level, displayLevel]);

  const xpPercent = Math.min((xp / xpToNext) * 100, 100);
  const characterImage = getCharacterImage(displayLevel);
  const levelName = getLevelName(displayLevel);

  return (
    <Card className="bg-card border-border shadow-card sticky top-8 overflow-hidden">
      <div className="p-8 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-6">
          {/* Profile Picture Section */}
          <div className="relative flex justify-center">
            <div className="relative w-40 h-40">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-success/20 blur-xl animate-pulse" />
              
              {/* Main circle with border */}
              <div className="relative w-40 h-40 rounded-full border-4 border-primary bg-gradient-to-br from-primary/20 to-success/20 overflow-hidden shadow-primary">
                {/* Thunder Animation */}
                {showThunder && onThunderComplete && (
                  <ThunderAnimation isActive={showThunder} onComplete={onThunderComplete} />
                )}
                
                {/* Character Image */}
                <div className={`w-full h-full transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
                  {!imageError ? (
                    <img
                      src={characterImage}
                      alt={`Level ${displayLevel} Character`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-card">
                      <Shield className="w-16 h-16 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Name Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {userName || "Your Champion"}
              </h2>
              {displayLevel >= 5 && (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              )}
            </div>
            
            {/* Level Badge */}
            <div className="flex justify-center">
              <Badge 
                variant="secondary" 
                className="text-lg px-4 py-1.5"
              >
                {levelName}
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* XP Card */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total XP
              </p>
              <p className="text-3xl font-bold text-foreground">
                {totalXP.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Level Progress Card */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Active Level
              </p>
              <p className="text-3xl font-bold text-primary">
                {displayLevel}
              </p>
            </div>
          </div>
        </div>

        {/* XP Progress Section */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Progress to Next Level</span>
            <span className="text-sm font-bold text-success flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {xp} / {xpToNext}
            </span>
          </div>
          
          <Progress 
            value={xpPercent} 
            className="h-2.5"
          />
          
          <p className="text-xs text-muted-foreground text-center">
            {displayLevel < 9 
              ? `${(xpToNext - xp).toLocaleString()} XP until Level ${displayLevel + 1}` 
              : 'Max Level Reached! 🎉'}
          </p>
        </div>

        {/* Champion Type Badge */}
        {championType && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {championType}
              </span>
            </div>
          </div>
        )}

        {/* Share Achievement Button */}
        <div className="pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowShareModal(true)}
            className="w-full gap-2 hover:bg-primary/10 hover:border-primary bg-gradient-to-r from-primary/5 to-success/5 border-primary/30 transition-all hover:shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            Share Achievement
          </Button>
        </div>
      </div>

      {/* Share Character Modal */}
      <ShareCharacterModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        userName={userName || "Champion"}
        level={displayLevel}
        levelName={levelName}
        totalXP={totalXP}
        championType={championType}
        characterImage={characterImage}
      />
    </Card>
  );
};
