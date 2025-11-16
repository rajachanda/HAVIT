import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Star } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface LeaderboardCardProps {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  champion: string;
  isUser?: boolean;
}

const LeaderboardCard = ({ rank, name, level, xp, streak, champion, isUser }: LeaderboardCardProps) => {
  const getCharacterImage = (level: number) => {
    if (level === 0) return null;
    const clampedLevel = Math.min(Math.max(level, 1), 9);
    return `/Character_Img/Level ${clampedLevel}.png`;
  };

  const getRankBadgeStyle = (rank: number) => {
    if (rank <= 10) {
      return 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-lg';
    }
    if (rank <= 20) {
      return 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800';
    }
    return 'bg-gradient-to-br from-orange-300 to-amber-400 text-orange-900';
  };

  const getChampionEmoji = (champion: string) => {
    const lower = champion.toLowerCase();
    if (lower.includes('warrior')) return '⚔️';
    if (lower.includes('mage')) return '🧙';
    if (lower.includes('rogue')) return '🗡️';
    if (lower.includes('guardian')) return '🛡️';
    if (lower.includes('bard')) return '🎵';
    if (lower.includes('healer')) return '🌟';
    return '⭐';
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up ${
        isUser 
          ? 'border-2 border-primary bg-primary/5 shadow-md shadow-primary/10' 
          : 'hover:border-primary/20'
      }`}
      style={{ animationDelay: `${rank * 20}ms` }}
    >
      <div className="relative p-5 flex items-center gap-5">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${getRankBadgeStyle(rank)}`}>
            {rank <= 3 ? (
              <span className="text-2xl">
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </span>
            ) : (
              <span>#{rank}</span>
            )}
          </div>
        </div>

        {/* Character Thumbnail */}
        <div className="flex-shrink-0">
          {getCharacterImage(level) ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/30 border border-border shadow-sm flex items-center justify-center">
              <img 
                src={getCharacterImage(level)!} 
                alt={name}
                className="w-14 h-14 object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center text-2xl font-bold shadow-sm">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-bold text-lg text-foreground truncate">
              {name}
            </h3>
            {isUser && (
              <Badge className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold">
                YOU
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            {/* Champion */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-base">{getChampionEmoji(champion)}</span>
              <span className="font-medium truncate max-w-[90px]">{champion}</span>
            </div>
            
            {/* Streak */}
            <div className="flex items-center gap-1">
              <Flame className={`w-4 h-4 ${streak > 7 ? 'text-orange-500' : 'text-orange-400'}`} />
              <span className="font-semibold text-foreground">{streak}</span>
            </div>
            
            {/* Level */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-foreground">Lv.{level}</span>
            </div>
          </div>
        </div>

        {/* XP Display */}
        <div className="flex-shrink-0 text-right pr-2">
          <div className="flex items-baseline gap-1 mb-0.5">
            <AnimatedCounter 
              value={xp} 
              className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent"
            />
            <span className="text-xs text-muted-foreground font-medium">XP</span>
          </div>
        </div>

        {/* Top 10 Badge */}
        {rank <= 10 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-600 text-white text-xs font-bold px-2 py-0.5 shadow-sm border-0">
              TOP 10
            </Badge>
          </div>
        )}
      </div>

      {/* Bottom accent line for user's card */}
      {isUser && (
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      )}
    </Card>
  );
};

export default LeaderboardCard;
