import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Star, Flame, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFollowUser } from '../hooks/useCommunityFeed';
import { DiscoverUser } from '../services/communityService';
import { useToast } from '../hooks/use-toast';

interface UserCardProps {
  user: DiscoverUser;
  onFollowChange?: () => void;
  compact?: boolean;
}

export default function UserCard({ user, onFollowChange, compact = false }: UserCardProps) {
  const { currentUser } = useAuth();
  const { follow, unfollow, loading } = useFollowUser();
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(user.isFollowing);

  const handleFollowToggle = async () => {
    if (!currentUser || loading) return;

    const prevState = isFollowing;
    setIsFollowing(!isFollowing);

    let success = false;
    if (isFollowing) {
      success = await unfollow(currentUser.uid, user.id);
      if (success) {
        toast({
          title: '👋 Unfollowed',
          description: `You unfollowed ${user.username}`,
        });
      }
    } else {
      success = await follow(currentUser.uid, user.id);
      if (success) {
        toast({
          title: '✅ Following',
          description: `You are now following ${user.username}`,
        });
      }
    }

    if (!success) {
      // Revert on failure
      setIsFollowing(prevState);
      toast({
        title: '❌ Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } else {
      onFollowChange?.();
    }
  };

  const handleCardClick = () => {
    // TODO: Navigate to user profile
    // window.location.href = `/profile/${user.id}`;
  };

  // Compact version for sidebar
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg cursor-pointer flex-shrink-0"
          onClick={handleCardClick}
        >
          {user.avatar || '👤'}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm truncate cursor-pointer hover:underline" onClick={handleCardClick}>
            {user.firstName} {user.lastName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-warning fill-current" />
              {user.level}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-destructive fill-current" />
              {user.streaks}d
            </span>
          </div>
        </div>

        {/* Follow Button */}
        <Button
          onClick={handleFollowToggle}
          disabled={loading || !currentUser}
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className={`flex-shrink-0 ${
            isFollowing
              ? 'bg-transparent hover:bg-muted text-muted-foreground'
              : 'bg-primary hover:bg-primary-dark text-primary-foreground'
          }`}
        >
          {isFollowing ? (
            <UserCheck className="w-4 h-4" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  // Full version for grid/modal
  return (
    <Card className="bg-card/60 backdrop-blur-xl p-4 hover:bg-card-hover transition-colors shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl mb-3 cursor-pointer"
          onClick={handleCardClick}
        >
          {user.avatar || '👤'}
        </div>

        {/* User Info */}
        <h3 className="font-semibold text-foreground text-sm mb-1 cursor-pointer hover:underline" onClick={handleCardClick}>
          {user.firstName} {user.lastName}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">@{user.username}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1 text-warning">
            <Star className="w-4 h-4 fill-current" />
            <span>Lvl {user.level}</span>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <Flame className="w-4 h-4 fill-current" />
            <span>{user.streaks}d</span>
          </div>
        </div>

        {/* Mutual Friends */}
        {user.mutualFriends && user.mutualFriends > 0 && (
          <p className="text-xs text-muted-foreground mb-3">
            {user.mutualFriends} mutual {user.mutualFriends === 1 ? 'friend' : 'friends'}
          </p>
        )}

        {/* Follow Button */}
        <Button
          onClick={handleFollowToggle}
          disabled={loading || !currentUser}
          className={`w-full ${
            isFollowing
              ? 'bg-muted hover:bg-card-hover text-foreground border border-border'
              : 'bg-primary hover:bg-primary-dark text-primary-foreground'
          }`}
          size="sm"
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
