import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Users2, Trophy, ChevronRight, MessageCircle, Plus, X, Flame, Target, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import { useAuth } from '../contexts/AuthContext';
import {
  usePostsFeed,
  useSearchPosts,
  useDiscoverUsers,
  useTrendingChallenges,
  useTrendingHashtags,
} from '../hooks/useCommunityFeed';

type FeedFilter = 'all' | 'following' | 'trending' | 'challenges' | 'achievements';

export default function CommunityPage() {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const { posts, loading, loadMore, hasMore, refresh } = usePostsFeed(activeFilter, currentUser?.uid);
  const { results: searchResults, search, loading: searching } = useSearchPosts();
  const { users, loading: usersLoading, refresh: refreshUsers } = useDiscoverUsers(currentUser?.uid || '', 8);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const { challenges, loading: challengesLoading } = useTrendingChallenges(6);
  const { hashtags } = useTrendingHashtags(10);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search
  useEffect(() => {
    if (debouncedSearch.trim()) {
      search(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    });

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, loadMore]);

  const displayPosts = searchQuery.trim() ? searchResults : posts;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">Connect, share, and inspire each other on your habit journeys</p>
          </div>
          
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Plus className="w-5 h-5" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <CreatePostBox onPostCreated={() => {
                  refresh();
                  setShowCreatePost(false);
                }} />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-5 h-5" />
              Community Chat
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Main Feed (60% / 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Box */}
            <CreatePostBox onPostCreated={refresh} />

            {/* Feed Filters */}
            <Card className="bg-card border-border p-4">
              <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FeedFilter)}>
                <TabsList className="grid grid-cols-5 w-full bg-muted">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline"><Users2 className="w-4 h-4 inline mr-1" /> All Posts</span>
                    <span className="sm:hidden"><Users2 className="w-4 h-4" /></span>
                  </TabsTrigger>
                  <TabsTrigger value="following" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline"><TrendingUp className="w-4 h-4 inline mr-1" /> Following</span>
                    <span className="sm:hidden"><TrendingUp className="w-4 h-4" /></span>
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline"><Flame className="w-4 h-4 inline mr-1" /> Trending</span>
                    <span className="sm:hidden"><Flame className="w-4 h-4" /></span>
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline"><Target className="w-4 h-4 inline mr-1" /> Challenges</span>
                    <span className="sm:hidden"><Target className="w-4 h-4" /></span>
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline"><Award className="w-4 h-4 inline mr-1" /> Achievements</span>
                    <span className="sm:hidden"><Award className="w-4 h-4" /></span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {loading && posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : displayPosts.length === 0 ? (
                <Card className="bg-card border-border p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    {searchQuery.trim()
                      ? 'No posts found matching your search.'
                      : 'Be the first to share something with the community!'}
                  </p>
                </Card>
              ) : (
                <>
                  {displayPosts.map((post, index) => (
                    <div
                      key={post.id}
                      ref={index === displayPosts.length - 1 ? lastPostRef : null}
                    >
                      <PostCard
                        post={post}
                        onPostDeleted={refresh}
                        onPostUpdated={refresh}
                      />
                    </div>
                  ))}
                  
                  {loading && posts.length > 0 && (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  )}
                  
                  {!hasMore && posts.length > 0 && (
                    <p className="text-center text-muted-foreground py-6">
                      You've reached the end! 🎉
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Section - Sidebar (40% / 1 column) */}
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search posts, #hashtags, @users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 p-4">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{posts.length}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">{users.length}</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning">{challenges.length}</div>
                  <div className="text-xs text-muted-foreground">Challenges</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{hashtags.length}</div>
                  <div className="text-xs text-muted-foreground">Trending Tags</div>
                </div>
              </div>
            </Card>

            {/* Discover Users */}
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                  <Users2 className="w-5 h-5 text-primary" />
                  Discover Users
                </h3>
              </div>

              {usersLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">No users found</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {(showAllUsers ? users : users.slice(0, 4)).map((user) => (
                      <UserCard key={user.id} user={user} onFollowChange={refreshUsers} compact />
                    ))}
                  </div>
                  {users.length > 4 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-3 text-primary hover:text-primary-dark hover:bg-muted"
                      onClick={() => setShowAllUsers(prev => !prev)}
                    >
                      {showAllUsers ? 'Show Less' : 'View More'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </>
              )}
            </Card>

            {/* Trending Challenges */}
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                  <Trophy className="w-5 h-5 text-warning" />
                  Trending Challenges
                </h3>
              </div>

              {challengesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : challenges.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">No challenges yet</p>
              ) : (
                <div className="space-y-3">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="bg-muted rounded-lg p-3 hover:bg-card-hover transition-colors cursor-pointer border border-border"
                    >
                      <div className="flex items-start gap-2">
                        <Flame className="w-6 h-6 text-warning" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-sm mb-1">
                            {challenge.name || 'Challenge'}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {challenge.participantCount || 0} participants
                          </p>
                          <Button size="sm" className="w-full bg-primary hover:bg-primary-dark text-primary-foreground text-xs">
                            Join Challenge
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Trending Hashtags */}
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Trending Hashtags
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(hashtag)}
                    className="px-3 py-1 bg-muted hover:bg-primary rounded-full text-sm text-muted-foreground hover:text-primary-foreground transition-colors border border-border"
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons (Mobile) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 md:hidden z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-muted hover:bg-muted/90 shadow-lg"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-2xl"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <CreatePostBox onPostCreated={() => {
              refresh();
              setShowCreatePost(false);
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Community Chat Sidebar */}
      {showChat && (
        <div className="fixed top-0 right-0 h-screen w-full md:w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in-right">
          {/* Chat Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">Community Chat</h3>
                <p className="text-xs opacity-90">{users.length} members online</p>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setShowChat(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Welcome to the community chat!</p>
              <p className="text-xs mt-1">Connect with other habit trackers</p>
            </div>

            {/* Sample messages */}
            {[
              { user: 'John', msg: 'Just completed my 30-day streak! 🔥', time: '2m ago' },
              { user: 'Sarah', msg: 'Anyone want to join the morning workout challenge?', time: '5m ago' },
              { user: 'Mike', msg: 'Great community here! Love the support 💪', time: '10m ago' },
            ].map((chat, i) => (
              <div key={i} className="bg-card rounded-lg p-3 border border-border">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">
                    {chat.user[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{chat.user}</span>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{chat.msg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex gap-2">
              <Input 
                placeholder="Type a message..." 
                className="flex-1 bg-background"
              />
              <Button size="icon" className="bg-primary hover:bg-primary/90">
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
