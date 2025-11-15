import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { ThunderAnimation } from "./ThunderAnimation";

interface ChampionDisplayProps {
  championType: string;
  level: number;
  xp: number;
  xpToNext: number;
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
  showThunder = false,
  onThunderComplete,
}: ChampionDisplayProps) => {
  const [displayLevel, setDisplayLevel] = useState(level);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get character image path based on level (clamped between 1-9)
  const getCharacterImage = (lvl: number) => {
    const clampedLevel = Math.max(1, Math.min(9, lvl));
    // Try both paths in case the folder is in root or public
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
      setImageError(false); // Reset image error on level change
      const timer = setTimeout(() => {
        setDisplayLevel(level);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [level, displayLevel]);

  const xpPercent = (xp / xpToNext) * 100;
  const characterImage = getCharacterImage(displayLevel);
  const levelName = getLevelName(displayLevel);

  return (
    <Card className="bg-card/60 backdrop-blur-xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sticky top-8">
      <div className="text-center space-y-4">
        {/* Champion Title */}
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {levelName}
          </Badge>
        </div>

        {/* Champion Visual */}
        <div className="relative">
          <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center animate-float shadow-[0_0_60px_-12px_rgba(57,62,70,0.8)] overflow-hidden relative">
            {/* Thunder Animation - contained within circle */}
            {showThunder && onThunderComplete && (
              <ThunderAnimation isActive={showThunder} onComplete={onThunderComplete} />
            )}
            <div className={`w-40 h-40 bg-card rounded-full flex items-center justify-center shadow-[0_0_40px_-8px_rgba(57,62,70,0.7)] transition-all duration-300 relative z-0 ${isTransitioning ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
              {!imageError ? (
                <img
                  src={characterImage}
                  alt={`Level ${displayLevel} Character`}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Shield className="w-20 h-20 text-primary" />
              )}
            </div>
          </div>
          
          {/* Level Badge */}
          <div className="absolute -top-2 -right-2 bg-success shadow-[0_0_20px_rgba(34,197,94,0.5)] rounded-full w-16 h-16 flex items-center justify-center shadow-lg animate-level-up">
            <div className="text-center">
              <div className="text-xs text-success-foreground font-medium">Level</div>
              <div className="text-xl font-bold text-success-foreground">{displayLevel}</div>
            </div>
          </div>
        </div>

        {/* Champion Name */}
        <div>
          <h3 className="text-2xl font-bold text-foreground">Your Champion</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Evolves with every habit
          </p>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">XP Progress</span>
            <span className="text-success font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {xp} / {xpToNext}
            </span>
          </div>
          <Progress value={xpPercent} className="h-3 gradient-xp" />
          <p className="text-xs text-muted-foreground text-center">
            {displayLevel < 9 ? `${xpToNext - xp} XP until Level ${displayLevel + 1}` : 'Max Level Reached!'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{displayLevel * 10}</div>
            <div className="text-xs text-muted-foreground">Total Habits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{displayLevel * 85}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
