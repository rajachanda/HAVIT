import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  image?: string;
  visibility: 'public' | 'friends' | 'private';
  timestamp: Timestamp;
  likes: number;
  comments: number;
  shares: number;
  likedBy: string[];
  hashtags: string[];
  type?: 'normal' | 'challenge' | 'achievement' | 'milestone' | 'collaboration';
  challengeId?: string;
  achievementId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: Timestamp;
  likes: number;
  likedBy: string[];
  replies: string[];
  parentCommentId?: string;
}

export interface DiscoverUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  level: number;
  streaks: number;
  mutualFriends?: number;
  isFollowing: boolean;
}

// Extract hashtags from content
const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
};

// ============ POSTS ============

export const createPost = async (
  userId: string,
  username: string,
  userAvatar: string,
  content: string,
  visibility: 'public' | 'friends' | 'private',
  image?: string,
  type?: 'normal' | 'challenge' | 'achievement' | 'milestone' | 'collaboration',
  challengeId?: string,
  achievementId?: string
): Promise<string> => {
  const hashtags = extractHashtags(content);
  
  const postData = {
    userId,
    username,
    userAvatar,
    content,
    image: image || null,
    visibility,
    timestamp: Timestamp.now(),
    likes: 0,
    comments: 0,
    shares: 0,
    likedBy: [],
    hashtags,
    type: type || 'normal',
    challengeId: challengeId || null,
    achievementId: achievementId || null,
  };

  const docRef = await addDoc(collection(db, 'posts'), postData);
  return docRef.id;
};

export const getPosts = async (
  filter: 'all' | 'following' | 'trending' | 'challenges' | 'achievements',
  userId?: string,
  lastDoc?: DocumentSnapshot,
  limitCount: number = 10
): Promise<{ posts: Post[], lastDoc: DocumentSnapshot | null }> => {
  const postsRef = collection(db, 'posts');
  let q;

  switch (filter) {
    case 'following':
      // TODO: Implement following logic with user's friends list
      q = query(
        postsRef,
        where('visibility', '==', 'public'),
        limit(limitCount)
      );
      break;
    
    case 'trending':
      // Get posts from last 24h sorted by likes
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      q = query(
        postsRef,
        where('visibility', '==', 'public'),
        where('timestamp', '>=', Timestamp.fromDate(oneDayAgo)),
        limit(limitCount)
      );
      break;
    
    case 'challenges':
      q = query(
        postsRef,
        where('visibility', '==', 'public'),
        where('type', '==', 'challenge'),
        limit(limitCount)
      );
      break;
    
    case 'achievements':
      q = query(
        postsRef,
        where('visibility', '==', 'public'),
        where('type', '==', 'achievement'),
        limit(limitCount)
      );
      break;
    
    default: // 'all'
      q = query(
        postsRef,
        where('visibility', '==', 'public'),
        limit(limitCount)
      );
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  let posts = snapshot.docs.map(doc => {
    const data = doc.data() as Omit<Post, 'id'>;
    return {
      id: doc.id,
      ...data
    } as Post;
  });

  // Sort on client side to avoid composite index requirements
  switch (filter) {
    case 'trending':
      // Sort by likes for trending
      posts.sort((a, b) => {
        const likeDiff = b.likes - a.likes;
        if (likeDiff !== 0) return likeDiff;
        return b.timestamp.toMillis() - a.timestamp.toMillis();
      });
      break;
    default:
      // Sort by timestamp for all other cases
      posts.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
  }

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc: lastVisible };
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }

  const likedBy = postSnap.data().likedBy || [];
  const isLiked = likedBy.includes(userId);

  if (isLiked) {
    // Unlike
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    // Like
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
  }
};

export const deletePost = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }

  if (postSnap.data().userId !== userId) {
    throw new Error('Unauthorized to delete this post');
  }

  await deleteDoc(postRef);
};

export const sharePost = async (postId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    shares: increment(1)
  });
};

export const searchPosts = async (searchQuery: string): Promise<Post[]> => {
  const postsRef = collection(db, 'posts');
  
  // Search by hashtag
  if (searchQuery.startsWith('#')) {
    const hashtag = searchQuery.toLowerCase();
    const q = query(
      postsRef,
      where('hashtags', 'array-contains', hashtag),
      where('visibility', '==', 'public'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Post, 'id'>;
      return {
        id: doc.id,
        ...data
      } as Post;
    });
    // Sort by timestamp on client side
    return posts.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
  }
  
  // Search by username
  if (searchQuery.startsWith('@')) {
    const username = searchQuery.substring(1).toLowerCase();
    const q = query(
      postsRef,
      where('username', '>=', username),
      where('username', '<=', username + '\uf8ff'),
      where('visibility', '==', 'public'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Post, 'id'>;
      return {
        id: doc.id,
        ...data
      } as Post;
    });
    // Sort by timestamp on client side
    return posts.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
  }

  // For keyword search, we'd need to implement full-text search with Algolia
  // For now, return empty array
  return [];
};

// ============ COMMENTS ============

export const addComment = async (
  postId: string,
  userId: string,
  username: string,
  userAvatar: string,
  content: string,
  parentCommentId?: string
): Promise<string> => {
  const commentData = {
    postId,
    userId,
    username,
    userAvatar,
    content,
    timestamp: Timestamp.now(),
    likes: 0,
    likedBy: [],
    replies: [],
    parentCommentId: parentCommentId || null,
  };

  const docRef = await addDoc(collection(db, 'comments'), commentData);

  // Update post comment count
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: increment(1)
  });

  // If reply, update parent comment replies array
  if (parentCommentId) {
    const parentRef = doc(db, 'comments', parentCommentId);
    await updateDoc(parentRef, {
      replies: arrayUnion(docRef.id)
    });
  }

  return docRef.id;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  const commentsRef = collection(db, 'comments');
  const q = query(
    commentsRef,
    where('postId', '==', postId),
    where('parentCommentId', '==', null)
  );

  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];
  
  // Sort by timestamp on client side
  return comments.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
};

export const getReplies = async (commentIds: string[]): Promise<Comment[]> => {
  if (commentIds.length === 0) return [];

  const replies: Comment[] = [];
  
  // Firestore 'in' query supports max 10 items
  for (let i = 0; i < commentIds.length; i += 10) {
    const batch = commentIds.slice(i, i + 10);
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('__name__', 'in', batch));
    const snapshot = await getDocs(q);
    
    const batchReplies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
    
    replies.push(...batchReplies);
  }

  return replies;
};

export const likeComment = async (commentId: string, userId: string): Promise<void> => {
  const commentRef = doc(db, 'comments', commentId);
  const commentSnap = await getDoc(commentRef);
  
  if (!commentSnap.exists()) {
    throw new Error('Comment not found');
  }

  const likedBy = commentSnap.data().likedBy || [];
  const isLiked = likedBy.includes(userId);

  if (isLiked) {
    await updateDoc(commentRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    await updateDoc(commentRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
  }
};

export const deleteComment = async (commentId: string, userId: string, postId: string): Promise<void> => {
  const commentRef = doc(db, 'comments', commentId);
  const commentSnap = await getDoc(commentRef);
  
  if (!commentSnap.exists()) {
    throw new Error('Comment not found');
  }

  if (commentSnap.data().userId !== userId) {
    throw new Error('Unauthorized to delete this comment');
  }

  await deleteDoc(commentRef);

  // Update post comment count
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: increment(-1)
  });
};

// ============ USER DISCOVERY ============

export const getDiscoverUsers = async (currentUserId: string, limitCount: number = 8): Promise<DiscoverUser[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, limit(limitCount + 1)); // +1 to exclude current user

  const snapshot = await getDocs(q);
  const users = snapshot.docs
    .filter(doc => doc.id !== currentUserId)
    .slice(0, limitCount)
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username || 'Unknown',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        avatar: data.avatar || '👤',
        level: data.level || 1,
        streaks: data.streaks || 0,
        mutualFriends: 0, // TODO: Calculate mutual friends
        isFollowing: false, // TODO: Check if current user follows this user
      };
    }) as DiscoverUser[];

  return users;
};

export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  // Add to current user's following list
  await updateDoc(currentUserRef, {
    following: arrayUnion(targetUserId)
  });

  // Add to target user's followers list
  await updateDoc(targetUserRef, {
    followers: arrayUnion(currentUserId)
  });
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  await updateDoc(currentUserRef, {
    following: arrayRemove(targetUserId)
  });

  await updateDoc(targetUserRef, {
    followers: arrayRemove(currentUserId)
  });
};

// ============ TRENDING ============

export const getTrendingChallenges = async (limitCount: number = 5): Promise<any[]> => {
  const challengesRef = collection(db, 'challenges');
  const q = query(
    challengesRef,
    orderBy('participantCount', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getTrendingHabits = async (limitCount: number = 5): Promise<any[]> => {
  // This would need aggregation of habit completions
  // For now, return empty array
  // TODO: Implement habit popularity tracking
  return [];
};

export const getTrendingHashtags = async (limitCount: number = 10): Promise<string[]> => {
  // This would need aggregation of hashtag usage
  // For now, return some common ones
  // TODO: Implement hashtag tracking
  return ['#fitness', '#challenge', '#productivity', '#wellness', '#achievement'];
};

// ============ USER POSTS ============

export const getUserPosts = async (
  userId: string,
  lastDoc?: DocumentSnapshot,
  limitCount: number = 10
): Promise<{ posts: Post[], lastDoc: DocumentSnapshot | null }> => {
  const postsRef = collection(db, 'posts');
  
  let q = query(
    postsRef,
    where('userId', '==', userId),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(
      postsRef,
      where('userId', '==', userId),
      startAfter(lastDoc),
      limit(limitCount)
    );
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => {
    const data = doc.data() as Omit<Post, 'id'>;
    return {
      id: doc.id,
      ...data
    } as Post;
  });

  // Sort by timestamp on client side
  posts.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc: lastVisible };
};
