import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/config/firebase';

export interface SquadMember {
  userId: string;
  joinedAt: any;
  role: 'leader' | 'member';
  contribution: number;
  completedHabits: number;
  // User data
  username?: string;
  firstName?: string;
  level?: number;
  avatar?: string;
}

export function useSquadMembers(squadId: string | null) {
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!squadId) {
      setLoading(false);
      return;
    }

    // Listen to squad document for members array
    const unsubscribe = onSnapshot(
      doc(db, 'squads', squadId),
      async (squadDoc) => {
        if (!squadDoc.exists()) {
          setMembers([]);
          setLoading(false);
          return;
        }

        const squadData = squadDoc.data();
        const memberIds = squadData.members || [];

        // Fetch all member data
        const memberPromises = memberIds.map(async (memberId: string) => {
          try {
            // Get user data
            const userDoc = await getDoc(doc(db, 'users', memberId));
            const userData = userDoc.data();

            // Get member contribution data (if exists)
            const memberDoc = await getDoc(doc(db, 'squadMembers', squadId, memberId));
            const memberData = memberDoc.exists() ? memberDoc.data() : {};

            return {
              userId: memberId,
              role: squadData.createdBy === memberId ? 'leader' : 'member',
              contribution: memberData.contribution || 0,
              completedHabits: memberData.completedHabits || 0,
              joinedAt: memberData.joinedAt || squadData.createdAt,
              username: userData?.username,
              firstName: userData?.firstName,
              level: userData?.level || 1,
              avatar: userData?.avatar,
            } as SquadMember;
          } catch (err) {
            console.error('Error fetching member:', memberId, err);
            return null;
          }
        });

        const fetchedMembers = (await Promise.all(memberPromises)).filter(Boolean) as SquadMember[];
        
        // Sort by contribution (descending)
        fetchedMembers.sort((a, b) => b.contribution - a.contribution);
        
        setMembers(fetchedMembers);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching squad members:', err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [squadId]);

  return { members, loading };
}
