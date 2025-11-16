import { collection, getDocs, orderBy, query, limit, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/config/firebase';
import { Squad } from './useSquad';

export function useSquadLeaderboard(excludeSquadId?: string | null) {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for squad leaderboard
    const q = query(
      collection(db, 'squads'),
      orderBy('totalXP', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const squadsList = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          rank: index + 1
        })) as Squad[];

        // Exclude user's own squad if specified
        const filtered = excludeSquadId 
          ? squadsList.filter(s => s.id !== excludeSquadId)
          : squadsList;

        setSquads(filtered);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching squad leaderboard:', err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [excludeSquadId]);

  return { squads, loading };
}
