import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getLevelInfo, getLevelTitle } from '@/lib/xpSystem';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp } from 'lucide-react';

interface XPDisplayProps {
  variant?: 'full' | 'compact' | 'minimal';
  showProgress?: boolean;
}

export default function XPDisplay({ variant = 'full', showProgress = true }: XPDisplayProps) {
  const { currentUser } = useAuth();
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTotalXP(data.totalXP || 0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-24"></div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(totalXP);
  const title = getLevelTitle(levelInfo.level);

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-warning" />
        <span className="font-bold text-foreground">{totalXP}</span>
        <span className="text-xs text-muted-foreground">XP</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            Lvl {levelInfo.level}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-warning" />
          <span className="font-semibold text-foreground">{totalXP}</span>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{totalXP}</span>
              <span className="text-sm text-muted-foreground">XP</span>
            </div>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Level {levelInfo.level}
        </Badge>
      </div>

      {showProgress && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{levelInfo.currentXP} / {levelInfo.xpForNextLevel}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {Math.round(levelInfo.xpProgress)}%
            </span>
          </div>
          <Progress value={levelInfo.xpProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {levelInfo.xpForNextLevel - levelInfo.currentXP} XP to Level {levelInfo.level + 1}
          </p>
        </div>
      )}
    </div>
  );
}
