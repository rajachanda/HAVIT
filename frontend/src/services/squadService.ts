import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const squadService = {
  // Create a new squad
  async createSquad(
    userId: string, 
    name: string, 
    description: string, 
    goal: number = 1000
  ) {
    try {
      const squadRef = doc(collection(db, 'squads'));
      const squadId = squadRef.id;

      await setDoc(squadRef, {
        name,
        description,
        createdBy: userId,
        members: [userId],
        totalXP: 0,
        goal,
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create squad member record
      await setDoc(doc(db, 'squadMembers', squadId, userId), {
        userId,
        joinedAt: serverTimestamp(),
        role: 'leader',
        contribution: 0,
        completedHabits: 0,
      });

      // Update user's squadId
      await updateDoc(doc(db, 'users', userId), {
        squadId,
      });

      return squadId;
    } catch (error) {
      console.error('Error creating squad:', error);
      throw error;
    }
  },

  // Join an existing squad
  async joinSquad(userId: string, squadId: string) {
    try {
      // Add user to squad members array
      await updateDoc(doc(db, 'squads', squadId), {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });

      // Create squad member record
      await setDoc(doc(db, 'squadMembers', squadId, userId), {
        userId,
        joinedAt: serverTimestamp(),
        role: 'member',
        contribution: 0,
        completedHabits: 0,
      });

      // Update user's squadId
      await updateDoc(doc(db, 'users', userId), {
        squadId,
      });
    } catch (error) {
      console.error('Error joining squad:', error);
      throw error;
    }
  },

  // Leave squad
  async leaveSquad(userId: string, squadId: string) {
    try {
      // Remove user from squad members array
      await updateDoc(doc(db, 'squads', squadId), {
        members: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });

      // Remove user's squadId
      await updateDoc(doc(db, 'users', userId), {
        squadId: null,
      });
    } catch (error) {
      console.error('Error leaving squad:', error);
      throw error;
    }
  },

  // Update member contribution
  async updateMemberContribution(
    squadId: string, 
    userId: string, 
    xpGained: number,
    habitsCompleted: number = 1
  ) {
    try {
      const memberRef = doc(db, 'squadMembers', squadId, userId);
      const memberDoc = await getDoc(memberRef);
      
      if (memberDoc.exists()) {
        const currentData = memberDoc.data();
        await updateDoc(memberRef, {
          contribution: (currentData.contribution || 0) + xpGained,
          completedHabits: (currentData.completedHabits || 0) + habitsCompleted,
        });
      }

      // Update squad total XP
      const squadRef = doc(db, 'squads', squadId);
      const squadDoc = await getDoc(squadRef);
      
      if (squadDoc.exists()) {
        const squadData = squadDoc.data();
        const newTotalXP = (squadData.totalXP || 0) + xpGained;
        const newProgress = (squadData.progress || 0) + xpGained;
        
        await updateDoc(squadRef, {
          totalXP: newTotalXP,
          progress: newProgress,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating member contribution:', error);
      throw error;
    }
  },

  // Invite member to squad
  async inviteToSquad(squadId: string, invitedUserId: string, invitedBy: string) {
    try {
      const inviteRef = doc(collection(db, 'squadInvites'));
      await setDoc(inviteRef, {
        squadId,
        invitedUserId,
        invitedBy,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return inviteRef.id;
    } catch (error) {
      console.error('Error sending invite:', error);
      throw error;
    }
  },

  // Find user by username
  async findUserByUsername(username: string) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  },

  // Search users by username pattern
  async searchUsersByUsername(searchTerm: string, limit: number = 10) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }

      const usersRef = collection(db, 'users');
      
      // Search for usernames that start with the search term (case-insensitive)
      const searchLower = searchTerm.toLowerCase();
      const searchUpper = searchTerm.toUpperCase();
      
      const q = query(
        usersRef,
        where('username', '>=', searchLower),
        where('username', '<=', searchLower + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          username: doc.data().username,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          avatar: doc.data().avatar,
          level: doc.data().level,
          squadId: doc.data().squadId,
        }))
        .filter(user => 
          user.username && 
          user.username.toLowerCase().includes(searchLower)
        )
        .slice(0, limit);
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },
};

