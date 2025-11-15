import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';
import { getLevelInfo, LevelInfo } from '@/lib/xpSystem';

interface XPContextType {
  totalXP: number;
  levelInfo: LevelInfo | null;
  loading: boolean;
  error: string | null;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function useXP() {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
}

interface XPProviderProps {
  children: ReactNode;
}

export function XPProvider({ children }: XPProviderProps) {
  const { currentUser } = useAuth();
  const [totalXP, setTotalXP] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setTotalXP(0);
      setLevelInfo(null);
      setLoading(false);
      return;
    }

    console.log('[XPContext] Setting up real-time listener for user:', currentUser.uid);
    setLoading(true);
    setError(null);

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const xp = data.totalXP || 0;
          console.log('[XPContext] XP updated:', { totalXP: xp, timestamp: new Date().toISOString() });
          
          setTotalXP(xp);
          const info = getLevelInfo(xp);
          setLevelInfo(info);
          
          console.log('[XPContext] Level info calculated:', {
            level: info.level,
            currentXP: info.currentXP,
            xpForNextLevel: info.xpForNextLevel,
            xpProgress: info.xpProgress
          });
        } else {
          console.warn('[XPContext] User document does not exist:', currentUser.uid);
          setTotalXP(0);
          setLevelInfo(getLevelInfo(0));
        }
        setLoading(false);
      },
      (err) => {
        console.error('[XPContext] Error fetching XP data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('[XPContext] Cleaning up listener for user:', currentUser.uid);
      unsubscribe();
    };
  }, [currentUser]);

  const value: XPContextType = {
    totalXP,
    levelInfo,
    loading,
    error,
  };

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}

