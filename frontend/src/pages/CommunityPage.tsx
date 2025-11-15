import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Users2, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
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

  const { posts, loading, loadMore, hasMore, refresh } = usePostsFeed(activeFilter, currentUser?.uid);
  const { results: searchResults, search, loading: searching } = useSearchPosts();
  const { users, loading: usersLoading, refresh: refreshUsers } = useDiscoverUsers(currentUser?.uid || '', 8);
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground">Community</h1>
          <p className="text-muted-foreground mt-1">Connect, share, and inspire each other on your habit journeys</p>
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
                    <span className="hidden sm:inline">🌐 All Posts</span>
                    <span className="sm:hidden">🌐 All</span>
                  </TabsTrigger>
                  <TabsTrigger value="following" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline">📰 Following</span>
                    <span className="sm:hidden">📰</span>
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline">🔥 Trending</span>
                    <span className="sm:hidden">🔥</span>
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline">💪 Challenges</span>
                    <span className="sm:hidden">💪</span>
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <span className="hidden sm:inline">🏆 Achievements</span>
                    <span className="sm:hidden">🏆</span>
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
                    {users.slice(0, 4).map((user) => (
                      <UserCard key={user.id} user={user} onFollowChange={refreshUsers} compact />
                    ))}
                  </div>
                  {users.length > 4 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-3 text-primary hover:text-primary-dark hover:bg-muted"
                      onClick={() => {
                        // TODO: Navigate to full users page or open modal
                        console.log('View all users');
                      }}
                    >
                      View More
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
                        <span className="text-2xl">🔥</span>
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
    </div>
  );
}
