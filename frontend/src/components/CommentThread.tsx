import { useState } from 'react';
import { Heart, Reply, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useFirebase';
import {
  useComments,
  useAddComment,
  useReplies,
  useLikeComment,
  useDeleteComment,
} from '../hooks/useCommunityFeed';
import { Comment } from '../services/communityService';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  postId: string;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  onDelete: () => void;
  postId: string;
}

function CommentItem({ comment, onReply, onDelete, postId }: CommentItemProps) {
  const { currentUser } = useAuth();
  const { like } = useLikeComment();
  const { delete: deleteComment } = useDeleteComment();
  const { replies, loading: repliesLoading } = useReplies(comment.replies);

  const [showReplies, setShowReplies] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes);
  const [localIsLiked, setLocalIsLiked] = useState(
    currentUser ? comment.likedBy.includes(currentUser.uid) : false
  );

  const isOwnComment = currentUser?.uid === comment.userId;

  const handleLike = async () => {
    if (!currentUser) return;

    const prevLikes = localLikes;
    const prevIsLiked = localIsLiked;

    // Optimistic update
    setLocalIsLiked(!localIsLiked);
    setLocalLikes(localIsLiked ? localLikes - 1 : localLikes + 1);

    const success = await like(comment.id, currentUser.uid);
    if (!success) {
      setLocalIsLiked(prevIsLiked);
      setLocalLikes(prevLikes);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !isOwnComment) return;

    const confirmed = window.confirm('Delete this comment?');
    if (!confirmed) return;

    const success = await deleteComment(comment.id, currentUser.uid, postId);
    if (success) {
      onDelete();
    }
  };

  const formatTimestamp = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg">
            {comment.userAvatar || '👤'}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground text-sm">{comment.username}</p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
            </div>
            <p className="text-foreground text-sm">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${
                localIsLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
              }`}
              disabled={!currentUser}
            >
              <Heart className={`w-4 h-4 ${localIsLiked ? 'fill-current' : ''}`} />
              {localLikes > 0 && <span>{localLikes}</span>}
            </button>

            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-muted-foreground hover:text-accent"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>

            {isOwnComment && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}

            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-muted-foreground hover:text-primary"
              >
                {showReplies ? 'Hide' : 'View'} {comment.replies.length}{' '}
                {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Nested Replies */}
          {showReplies && comment.replies.length > 0 && (
            <div className="mt-4 ml-6 space-y-3 border-l-2 border-border pl-4">
              {repliesLoading ? (
                <p className="text-muted-foreground text-sm">Loading replies...</p>
              ) : (
                replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    onDelete={onDelete}
                    postId={postId}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentThread({ postId }: CommentThreadProps) {
  const { currentUser } = useAuth();
  const { data: userData } = useUser(currentUser?.uid || null);
  const { comments, loading, refresh } = useComments(postId);
  const { add: addComment, loading: adding } = useAddComment();

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmitComment = async () => {
    if (!currentUser || !userData || !commentText.trim()) return;

    const commentId = await addComment(
      postId,
      currentUser.uid,
      userData.username || 'User',
      userData.avatar || '👤',
      commentText.trim(),
      replyingTo || undefined
    );

    if (commentId) {
      setCommentText('');
      setReplyingTo(null);
      refresh();
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      {currentUser && userData && (
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg">
              {userData.avatar || '👤'}
            </div>
          </div>
          <div className="flex-1">
            {replyingTo && (
              <div className="mb-2 flex items-center justify-between bg-muted rounded px-3 py-2 border border-border">
                <p className="text-sm text-muted-foreground">Replying to comment...</p>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] bg-background border-border text-foreground resize-none"
              disabled={adding}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || adding}
                size="sm"
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                {adding ? 'Posting...' : replyingTo ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={refresh}
              postId={postId}
            />
          ))
        )}
      </div>
    </div>
  );
}
