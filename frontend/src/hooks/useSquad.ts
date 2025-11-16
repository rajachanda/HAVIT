import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/config/firebase';

export interface Squad {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  totalXP: number;
  goal: number;
  progress: number;
  createdAt: any;
  updatedAt: any;
  rank?: number;
}

export function useSquad(userId: string | null) {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSquad = async () => {
      try {
        // Get user document to find their squadId
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        
        if (!userData?.squadId) {
          setSquad(null);
          setLoading(false);
          return;
        }

        // Listen to squad updates in real-time
        const unsubscribe = onSnapshot(
          doc(db, 'squads', userData.squadId),
          (squadDoc) => {
            if (squadDoc.exists()) {
              setSquad({
                id: squadDoc.id,
                ...squadDoc.data()
              } as Squad);
            } else {
              setSquad(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching squad:', err);
            setError(err.message);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err: any) {
        console.error('Error in useSquad:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const unsubscribe = fetchSquad();
    return () => {
      if (unsubscribe instanceof Promise) {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, [userId]);

  return { squad, loading, error };
}
