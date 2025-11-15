import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useLikePost, useDeletePost, useSharePost } from '../hooks/useCommunityFeed';
import { Post } from '../services/communityService';
import CommentThread from './CommentThread';
import { useToast } from '../hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export default function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
  const { currentUser } = useAuth();
  const { like } = useLikePost();
  const { delete: deletePost } = useDeletePost();
  const { share } = useSharePost();
  const { toast } = useToast();

  const [showComments, setShowComments] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [localIsLiked, setLocalIsLiked] = useState(
    currentUser ? post.likedBy.includes(currentUser.uid) : false
  );
  const [isLiking, setIsLiking] = useState(false);

  const isOwnPost = currentUser?.uid === post.userId;

  const handleLike = async () => {
    if (!currentUser || isLiking) return;

    setIsLiking(true);
    const prevLikes = localLikes;
    const prevIsLiked = localIsLiked;

    // Optimistic update
    setLocalIsLiked(!localIsLiked);
    setLocalLikes(localIsLiked ? localLikes - 1 : localLikes + 1);

    const success = await like(post.id, currentUser.uid);

    if (!success) {
      // Revert on failure
      setLocalIsLiked(prevIsLiked);
      setLocalLikes(prevLikes);
      toast({
        title: '❌ Failed to like post',
        variant: 'destructive',
      });
    } else {
      onPostUpdated?.();
    }

    setIsLiking(false);
  };

  const handleDelete = async () => {
    if (!currentUser || !isOwnPost) return;

    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    const success = await deletePost(post.id, currentUser.uid);
    if (success) {
      toast({
        title: '✅ Post deleted',
        description: 'Your post has been removed.',
      });
      onPostDeleted?.();
    } else {
      toast({
        title: '❌ Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    const success = await share(post.id);
    if (success) {
      // Copy link to clipboard
      const link = `${window.location.origin}/community/post/${post.id}`;
      navigator.clipboard.writeText(link);
      toast({
        title: '✅ Link copied!',
        description: 'Post link has been copied to clipboard.',
      });
    }
  };

  const handleReport = () => {
    toast({
      title: '📢 Report submitted',
      description: 'Thank you for helping keep our community safe.',
    });
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
    <Card className="bg-card border-border p-6 shadow-card">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* User Avatar */}
        <div className="flex-shrink-0 cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl">
            {post.userAvatar || '👤'}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground cursor-pointer hover:underline">
                {post.username}
              </p>
              <p className="text-sm text-muted-foreground">
                @{post.username.toLowerCase().replace(/\s/g, '')} • {formatTimestamp(post.timestamp)}
              </p>
            </div>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                {isOwnPost ? (
                  <>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive hover:bg-muted cursor-pointer"
                    >
                      Delete Post
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={handleReport}
                      className="text-foreground hover:bg-muted cursor-pointer"
                    >
                      Report Post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
                      Mute User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
                      Block User
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleShare}
                  className="text-foreground hover:bg-muted cursor-pointer"
                >
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-foreground whitespace-pre-wrap">
          {post.content.split(' ').map((word, i) => {
            if (word.startsWith('#')) {
              return (
                <span key={i} className="text-primary hover:underline cursor-pointer">
                  {word}{' '}
                </span>
              );
            }
            if (word.startsWith('@')) {
              return (
                <span key={i} className="text-accent hover:underline cursor-pointer">
                  {word}{' '}
                </span>
              );
            }
            return word + ' ';
          })}
        </p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt="Post attachment"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Challenge/Achievement Card */}
      {post.type === 'challenge' && (
        <div className="mb-4 bg-muted rounded-lg p-4 border border-primary">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💪</span>
            <p className="font-semibold text-foreground">Challenge Post</p>
          </div>
          <p className="text-muted-foreground text-sm mb-3">
            Join this challenge and compete with others!
          </p>
          <Button size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground">
            Join Challenge
          </Button>
        </div>
      )}

      {post.type === 'achievement' && (
        <div className="mb-4 bg-muted rounded-lg p-4 border border-warning">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <p className="font-semibold text-foreground">Achievement Unlocked!</p>
          </div>
          <p className="text-muted-foreground text-sm">
            Congratulations on this amazing milestone!
          </p>
        </div>
      )}

      {post.type === 'milestone' && (
        <div className="mb-4 bg-muted rounded-lg p-4 border border-success">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <p className="font-semibold text-foreground">Milestone Reached!</p>
          </div>
          <p className="text-muted-foreground text-sm">
            A new level of achievement unlocked!
          </p>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center gap-6 mb-3 text-sm text-muted-foreground pb-3 border-b border-border">
        <span className={localIsLiked ? 'text-destructive' : ''}>
          ❤️ {localLikes} {localLikes === 1 ? 'Like' : 'Likes'}
        </span>
        <span>💬 {post.comments} {post.comments === 1 ? 'Comment' : 'Comments'}</span>
        <span>📤 {post.shares} {post.shares === 1 ? 'Share' : 'Shares'}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className={`flex-1 ${localIsLiked ? 'text-destructive hover:text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
          onClick={handleLike}
          disabled={isLiking || !currentUser}
        >
          <Heart className={`w-5 h-5 mr-2 ${localIsLiked ? 'fill-current' : ''}`} />
          Like
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="flex-1 text-muted-foreground hover:text-accent"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Comment
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="flex-1 text-muted-foreground hover:text-success"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-warning"
        >
          <Bookmark className="w-5 h-5" />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-border">
          <CommentThread postId={post.id} />
        </div>
      )}
    </Card>
  );
}
