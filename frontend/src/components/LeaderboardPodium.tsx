import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SparkleEffect from "./SparkleEffect";
import AnimatedCounter from "./AnimatedCounter";

interface PodiumUser {
  name: string;
  level: number;
  xp: number;
  streak: number;
  champion: string;
}

interface LeaderboardPodiumProps {
  first?: PodiumUser;
  second?: PodiumUser;
  third?: PodiumUser;
}

const LeaderboardPodium = ({ first, second, third }: LeaderboardPodiumProps) => {
  const defaultUser: PodiumUser = { name: '—', level: 0, xp: 0, streak: 0, champion: '' };
  
  const p1 = first || defaultUser;
  const p2 = second || defaultUser;
  const p3 = third || defaultUser;

  const getCharacterImage = (level: number) => {
    if (level === 0) return null;
    const clampedLevel = Math.min(Math.max(level, 1), 9);
    return `/Character_Img/Level ${clampedLevel}.png`;
  };

  // Fixed character images for top 3 positions
  const getFixedCharacterImage = (position: 1 | 2 | 3) => {
    if (position === 1) return '/Character_Img/Level 8.png'; // 1st place
    if (position === 2) return '/Character_Img/Level 4.png'; // 2nd place
    if (position === 3) return '/Character_Img/Level 2.png'; // 3rd place
    return null;
  };

  return (
    <div className="relative py-8 px-4">
      {/* Desktop: 3 columns with 1st in middle (2nd | 1st | 3rd layout) */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto">
        
        {/* 2nd Place - Left */}
        <div className="animate-slide-in-left flex flex-col items-center pb-8" style={{ animationDelay: '200ms' }}>
          <SparkleEffect count={2}>
            {/* Character Illustration */}
            <div className="relative mb-4 group">
              {getFixedCharacterImage(2) ? (
                <img 
                  src={getFixedCharacterImage(2)!} 
                  alt={p2.name}
                  className="w-44 h-44 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 filter brightness-105"
                />
              ) : (
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-6xl font-bold text-slate-800 dark:text-slate-100 shadow-2xl">
                  {p2.name.charAt(0)}
                </div>
              )}
              <div className="absolute -top-2 -right-2 text-5xl animate-bounce-slow">
                🥈
              </div>
            </div>
          </SparkleEffect>

          {/* Info Card */}
          <Card className="relative bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-slate-300 dark:border-slate-600 border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full overflow-hidden">
            <div className="p-5 text-center space-y-2">
              <h3 className="font-bold text-xl bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text text-transparent">{p2.name}</h3>
              <div className="flex items-center justify-center gap-1 text-amber-600">
                <span className="text-2xl">🪙</span>
                <AnimatedCounter 
                  value={p2.xp} 
                  className="text-2xl font-bold"
                />
              </div>
              <p className="text-sm text-muted-foreground">{p2.xp} Points</p>
            </div>
          </Card>
          
          {/* Platform/Podium Base */}
          <div className="mt-0 w-full h-24 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-t-xl shadow-lg flex items-center justify-center border-t-4 border-slate-400">
            <span className="text-5xl font-bold text-slate-100 dark:text-slate-900">2nd</span>
          </div>
        </div>

        {/* 1st Place - Center (Taller) */}
        <div className="animate-slide-in-down flex flex-col items-center" style={{ animationDelay: '0ms' }}>
          <SparkleEffect count={6}>
            {/* Level 1 Medal */}
            <div className="mb-3 text-6xl filter drop-shadow-lg">
              🥇
            </div>
            
            {/* Character Illustration - Larger */}
            <div className="relative mb-4 group">
              {getFixedCharacterImage(1) ? (
                <img 
                  src={getFixedCharacterImage(1)!} 
                  alt={p1.name}
                  className="w-56 h-56 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 filter brightness-110 animate-pulse-slow"
                />
              ) : (
                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 dark:from-yellow-500 dark:to-amber-600 flex items-center justify-center text-8xl font-bold text-yellow-900 dark:text-yellow-100 shadow-2xl ring-4 ring-yellow-400/50">
                  {p1.name.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-2xl -z-10 animate-pulse-glow"></div>
            </div>
          </SparkleEffect>

          {/* Info Card - Highlighted */}
          <Card className="relative bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 dark:from-yellow-900/40 dark:via-amber-800/30 dark:to-yellow-900/40 border-yellow-400 dark:border-yellow-500 border-4 rounded-2xl shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none"></div>
            <div className="p-6 text-center space-y-3 relative z-10">
              <h3 className="font-bold text-2xl bg-gradient-to-r from-yellow-700 to-amber-600 bg-clip-text text-transparent">{p1.name}</h3>
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <span className="text-4xl">🪙</span>
                <AnimatedCounter 
                  value={p1.xp} 
                  className="text-4xl font-bold"
                />
              </div>
              <p className="text-base font-semibold text-muted-foreground">{p1.xp} Points</p>
            </div>
          </Card>
          
          {/* Platform/Podium Base - Tallest */}
          <div className="mt-0 w-full h-40 bg-gradient-to-b from-yellow-400 via-amber-500 to-amber-600 dark:from-yellow-500 dark:to-amber-700 rounded-t-xl shadow-2xl flex items-center justify-center border-t-4 border-yellow-300 ring-4 ring-yellow-400/30">
            <span className="text-6xl font-bold text-yellow-900 dark:text-yellow-100">1st</span>
          </div>
        </div>

        {/* 3rd Place - Right */}
        <div className="animate-slide-in-right flex flex-col items-center pb-12" style={{ animationDelay: '400ms' }}>
          <SparkleEffect count={2}>
            {/* Character Illustration */}
            <div className="relative mb-4 group">
              {getFixedCharacterImage(3) ? (
                <img 
                  src={getFixedCharacterImage(3)!} 
                  alt={p3.name}
                  className="w-40 h-40 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 filter brightness-105"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-200 to-amber-300 dark:from-orange-600 dark:to-amber-700 flex items-center justify-center text-6xl font-bold text-orange-900 dark:text-orange-100 shadow-2xl">
                  {p3.name.charAt(0)}
                </div>
              )}
              <div className="absolute -top-2 -right-2 text-5xl animate-bounce-slow" style={{ animationDelay: '300ms' }}>
                🥉
              </div>
            </div>
          </SparkleEffect>

          {/* Info Card */}
          <Card className="relative bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 dark:from-orange-900/30 dark:via-amber-800/20 dark:to-orange-900/30 border-orange-300 dark:border-orange-600 border-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full overflow-hidden">
            <div className="p-5 text-center space-y-2">
              <h3 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{p3.name}</h3>
              <div className="flex items-center justify-center gap-1 text-amber-600">
                <span className="text-2xl">🪙</span>
                <AnimatedCounter 
                  value={p3.xp} 
                  className="text-2xl font-bold"
                />
              </div>
              <p className="text-sm text-muted-foreground">{p3.xp} Points</p>
            </div>
          </Card>
          
          {/* Platform/Podium Base */}
          <div className="mt-0 w-full h-20 bg-gradient-to-b from-orange-300 to-amber-500 dark:from-orange-600 dark:to-amber-700 rounded-t-xl shadow-lg flex items-center justify-center border-t-4 border-orange-400">
            <span className="text-4xl font-bold text-orange-900 dark:text-orange-100">3rd</span>
          </div>
        </div>
      </div>

      {/* Mobile: Stack vertically (1st, 2nd, 3rd) */}
      <div className="md:hidden space-y-6 animate-fade-in">
        {/* 1st Place */}
        <div className="flex flex-col items-center">
          <div className="mb-3 text-5xl filter drop-shadow-lg">🥇</div>
          <SparkleEffect count={4}>
            <div className="relative mb-4">
              {getFixedCharacterImage(1) ? (
                <img 
                  src={getFixedCharacterImage(1)!} 
                  alt={p1.name}
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center text-7xl font-bold text-yellow-900 shadow-2xl">
                  {p1.name.charAt(0)}
                </div>
              )}
            </div>
          </SparkleEffect>
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 border-4 p-6 text-center shadow-2xl w-full">
            <h3 className="font-bold text-2xl mb-2 bg-gradient-to-r from-yellow-700 to-amber-600 bg-clip-text text-transparent">{p1.name}</h3>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl">🪙</span>
              <AnimatedCounter value={p1.xp} className="text-3xl font-bold" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{p1.xp} Points</p>
            <div className="text-5xl font-bold text-yellow-600">1st</div>
          </Card>
        </div>

        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className="text-5xl mb-3">🥈</div>
          <SparkleEffect count={2}>
            <div className="relative mb-4">
              {getFixedCharacterImage(2) ? (
                <img 
                  src={getFixedCharacterImage(2)!} 
                  alt={p2.name}
                  className="w-40 h-40 object-contain drop-shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-6xl font-bold text-slate-800 shadow-xl">
                  {p2.name.charAt(0)}
                </div>
              )}
            </div>
          </SparkleEffect>
          <Card className="bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 border-2 p-5 text-center w-full">
            <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text text-transparent">{p2.name}</h3>
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-2xl">🪙</span>
              <AnimatedCounter value={p2.xp} className="text-2xl font-bold" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{p2.xp} Points</p>
            <div className="text-4xl font-bold text-slate-600">2nd</div>
          </Card>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className="text-5xl mb-3">🥉</div>
          <SparkleEffect count={2}>
            <div className="relative mb-4">
              {getFixedCharacterImage(3) ? (
                <img 
                  src={getFixedCharacterImage(3)!} 
                  alt={p3.name}
                  className="w-40 h-40 object-contain drop-shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-200 to-amber-300 flex items-center justify-center text-6xl font-bold text-orange-900 shadow-xl">
                  {p3.name.charAt(0)}
                </div>
              )}
            </div>
          </SparkleEffect>
          <Card className="bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300 border-2 p-5 text-center w-full">
            <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{p3.name}</h3>
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-2xl">🪙</span>
              <AnimatedCounter value={p3.xp} className="text-2xl font-bold" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{p3.xp} Points</p>
            <div className="text-4xl font-bold text-orange-600">3rd</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPodium;
