import { useState, useEffect, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import {
  Post,
  Comment,
  DiscoverUser,
  getPosts,
  createPost,
  likePost,
  deletePost,
  sharePost,
  searchPosts,
  addComment,
  getComments,
  getReplies,
  likeComment,
  deleteComment,
  getDiscoverUsers,
  followUser,
  unfollowUser,
  getTrendingChallenges,
  getTrendingHashtags,
  getUserPosts,
} from '../services/communityService';

// Hook for posts feed
export const usePostsFeed = (
  filter: 'all' | 'following' | 'trending' | 'challenges' | 'achievements' = 'all',
  userId?: string
) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      const { posts: newPosts, lastDoc: newLastDoc } = await getPosts(
        filter,
        userId,
        isLoadMore ? lastDoc || undefined : undefined,
        10
      );

      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setLastDoc(newLastDoc);
      setHasMore(newPosts.length === 10);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [filter, userId, lastDoc]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(true);
    }
  }, [loading, hasMore, loadPosts]);

  const refresh = useCallback(() => {
    setLastDoc(null);
    loadPosts(false);
  }, [loadPosts]);

  useEffect(() => {
    loadPosts(false);
  }, [filter, userId]);

  return { posts, loading, error, loadMore, hasMore, refresh };
};

// Hook for creating posts
export const useCreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    userId: string,
    username: string,
    userAvatar: string,
    content: string,
    visibility: 'public' | 'friends' | 'private',
    image?: string,
    type?: 'normal' | 'challenge' | 'achievement' | 'milestone' | 'collaboration',
    challengeId?: string,
    achievementId?: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const postId = await createPost(
        userId,
        username,
        userAvatar,
        content,
        visibility,
        image,
        type,
        challengeId,
        achievementId
      );
      return postId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

// Hook for liking posts
export const useLikePost = () => {
  const [loading, setLoading] = useState(false);

  const like = async (postId: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await likePost(postId, userId);
      return true;
    } catch (err) {
      console.error('Failed to like post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { like, loading };
};

// Hook for deleting posts
export const useDeletePost = () => {
  const [loading, setLoading] = useState(false);

  const deleteP = async (postId: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await deletePost(postId, userId);
      return true;
    } catch (err) {
      console.error('Failed to delete post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { delete: deleteP, loading };
};

// Hook for sharing posts
export const useSharePost = () => {
  const [loading, setLoading] = useState(false);

  const share = async (postId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await sharePost(postId);
      return true;
    } catch (err) {
      console.error('Failed to share post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { share, loading };
};

// Hook for searching posts
export const useSearchPosts = () => {
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const posts = await searchPosts(query);
      setResults(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search posts');
    } finally {
      setLoading(false);
    }
  };

  return { results, search, loading, error };
};

// Hook for comments
export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComments(postId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId, loadComments]);

  return { comments, loading, error, refresh: loadComments };
};

// Hook for adding comments
export const useAddComment = () => {
  const [loading, setLoading] = useState(false);

  const add = async (
    postId: string,
    userId: string,
    username: string,
    userAvatar: string,
    content: string,
    parentCommentId?: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      const commentId = await addComment(
        postId,
        userId,
        username,
        userAvatar,
        content,
        parentCommentId
      );
      return commentId;
    } catch (err) {
      console.error('Failed to add comment:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { add, loading };
};

// Hook for loading replies
export const useReplies = (commentIds: string[]) => {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (commentIds.length === 0) {
      setReplies([]);
      return;
    }

    const loadReplies = async () => {
      try {
        setLoading(true);
        const data = await getReplies(commentIds);
        setReplies(data);
      } catch (err) {
        console.error('Failed to load replies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReplies();
  }, [commentIds.join(',')]);

  return { replies, loading };
};

// Hook for liking comments
export const useLikeComment = () => {
  const [loading, setLoading] = useState(false);

  const like = async (commentId: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await likeComment(commentId, userId);
      return true;
    } catch (err) {
      console.error('Failed to like comment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { like, loading };
};

// Hook for deleting comments
export const useDeleteComment = () => {
  const [loading, setLoading] = useState(false);

  const deleteC = async (commentId: string, userId: string, postId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await deleteComment(commentId, userId, postId);
      return true;
    } catch (err) {
      console.error('Failed to delete comment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { delete: deleteC, loading };
};

// Hook for discovering users
export const useDiscoverUsers = (currentUserId: string, limitCount: number = 8) => {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDiscoverUsers(currentUserId, limitCount);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, limitCount]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, error, refresh: loadUsers };
};

// Hook for following/unfollowing users
export const useFollowUser = () => {
  const [loading, setLoading] = useState(false);

  const follow = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await followUser(currentUserId, targetUserId);
      return true;
    } catch (err) {
      console.error('Failed to follow user:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await unfollowUser(currentUserId, targetUserId);
      return true;
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { follow, unfollow, loading };
};

// Hook for trending challenges
export const useTrendingChallenges = (limitCount: number = 5) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true);
        const data = await getTrendingChallenges(limitCount);
        setChallenges(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, [limitCount]);

  return { challenges, loading, error };
};

// Hook for trending hashtags
export const useTrendingHashtags = (limitCount: number = 10) => {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHashtags = async () => {
      try {
        setLoading(true);
        const data = await getTrendingHashtags(limitCount);
        setHashtags(data);
      } catch (err) {
        console.error('Failed to load hashtags:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHashtags();
  }, [limitCount]);

  return { hashtags, loading };
};

// Hook for user posts
export const useUserPosts = (userId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (isLoadMore = false) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { posts: newPosts, lastDoc: newLastDoc } = await getUserPosts(
        userId,
        isLoadMore ? lastDoc || undefined : undefined,
        10
      );

      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setLastDoc(newLastDoc);
      setHasMore(newPosts.length === 10);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [userId, lastDoc]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(true);
    }
  }, [loading, hasMore, loadPosts]);

  const refresh = useCallback(() => {
    setLastDoc(null);
    loadPosts(false);
  }, [loadPosts]);

  useEffect(() => {
    loadPosts(false);
  }, [userId]);

  return { posts, loading, error, loadMore, hasMore, refresh };
};
