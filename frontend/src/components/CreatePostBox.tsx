import { useState } from 'react';
import { Smile, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useFirebase';
import { useCreatePost } from '../hooks/useCommunityFeed';

const MAX_CHARS = 500;

interface CreatePostBoxProps {
  onPostCreated?: () => void;
}

export default function CreatePostBox({ onPostCreated }: CreatePostBoxProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [image, setImage] = useState<string>('');
  const { currentUser } = useAuth();
  const { data: userData } = useUser(currentUser?.uid || null);
  const { create, loading } = useCreatePost();
  const { toast } = useToast();

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost = content.trim().length > 0 && !isOverLimit && !loading;

  const handleSubmit = async () => {
    if (!canPost || !currentUser) {
      toast({
        title: '⚠️ Cannot create post',
        description: 'Please make sure you are logged in.',
        variant: 'destructive',
      });
      return;
    }

    // Use fallback values if userData is not available
    const username = userData?.username || currentUser.email?.split('@')[0] || 'User';
    const avatar = userData?.avatar || '👤';

    try {
      const postId = await create(
        currentUser.uid,
        username,
        avatar,
        content,
        visibility,
        image || undefined
      );

      if (postId) {
        setContent('');
        setImage('');
        setVisibility('public');
        toast({
          title: '✅ Post published!',
          description: 'Your post has been shared with the community.',
        });
        onPostCreated?.();
      } else {
        toast({
          title: '❌ Failed to post',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive',
      });
    }
  };

  const handleAddEmoji = () => {
    // Simple emoji picker - add to content
    const emojis = ['😊', '🎉', '💪', '🔥', '❤️', '👍', '✨', '🚀', '⭐', '🎯', '💯', '👏'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setContent(prev => prev + randomEmoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to post
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canPost) {
      handleSubmit();
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-card border border-border text-center">
        <p className="text-muted-foreground">Please sign in to create a post.</p>
      </div>
    );
  }

  const displayAvatar = userData?.avatar || '👤';
  const displayName = userData?.username || currentUser.email?.split('@')[0] || 'User';

  return (
    <div className="bg-card rounded-lg p-6 shadow-card border border-border">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl shadow-md">
            {displayAvatar}
          </div>
        </div>

        {/* Post Input */}
        <div className="flex-1">
          <Textarea
            placeholder={`What's on your mind, ${displayName}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[100px] bg-background border-border text-foreground resize-none focus:ring-primary focus:border-primary"
            disabled={loading}
          />

          {/* Character Counter */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              {canPost && '💡 Tip: Press Ctrl+Enter to post'}
            </div>
            <div className={`text-sm font-medium ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {charCount}/{MAX_CHARS}
            </div>
          </div>

          {/* Image Preview */}
          {image && (
            <div className="mt-3 relative">
              <img
                src={image}
                alt="Post attachment"
                className="rounded-lg max-h-64 object-cover"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => setImage('')}
              >
                Remove
              </Button>
            </div>
          )}

          {/* Post Options */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {/* Emoji Button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                onClick={handleAddEmoji}
                disabled={loading}
              >
                <Smile className="w-5 h-5" />
              </Button>

              {/* Image Button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) setImage(url);
                }}
                disabled={loading}
              >
                <ImageIcon className="w-5 h-5" />
              </Button>

              {/* Visibility Dropdown */}
              <Select value={visibility} onValueChange={(value: any) => setVisibility(value)} disabled={loading}>
                <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="public" className="text-foreground hover:bg-muted">
                    🌐 Public
                  </SelectItem>
                  <SelectItem value="friends" className="text-foreground hover:bg-muted">
                    👥 Friends Only
                  </SelectItem>
                  <SelectItem value="private" className="text-foreground hover:bg-muted">
                    🔒 Private
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Post Button */}
            <Button
              onClick={handleSubmit}
              disabled={!canPost}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Posting...
                </>
              ) : (
                '📤 Post'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
