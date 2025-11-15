import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Share2, TrendingUp, Sparkles } from "lucide-react";

interface Post {
  id: string;
  author: string;
  champion: string;
  level: number;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  achievement?: string;
}

const Community = () => {
  const posts: Post[] = [
    {
      id: "1",
      author: "Sarah K.",
      champion: "Warrior",
      level: 15,
      content:
        "Just hit my 30-day streak on morning workouts! 💪 Never thought I'd make it this far. The key was starting with just 10 minutes and building up from there.",
      likes: 42,
      comments: 8,
      timestamp: "2 hours ago",
      achievement: "30 Day Streak",
    },
    {
      id: "2",
      author: "Mike T.",
      champion: "Mage",
      level: 18,
      content:
        "Completed my first week of the reading challenge with @alex! This competition feature is a game-changer. Already finished 2 books.",
      likes: 28,
      comments: 5,
      timestamp: "4 hours ago",
    },
    {
      id: "3",
      author: "Alex J.",
      champion: "Rogue",
      level: 14,
      content:
        "Pro tip: I've been using the squad feature with my gym buddies and our collective motivation is through the roof! 🚀 Highly recommend finding accountability partners.",
      likes: 56,
      comments: 12,
      timestamp: "6 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-9 h-9 text-primary" />
            Community
          </h1>
          <p className="text-muted-foreground mt-1">
            Share your journey and inspire others
          </p>
        </div>

        {/* Create Post */}
        <Card className="bg-card border-border p-6 shadow-card">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your progress, tips, or victories..."
                className="min-h-24 bg-background border-border resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Achievement
                  </Button>
                </div>
                <Button className="bg-primary hover:bg-primary-dark">Post</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Trending Topics */}
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-foreground">Trending Now</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
              #30DayChallenge
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
              #MorningRoutine
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
              #FitnessGoals
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
              #ProductivityTips
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
              #Meditation
            </Badge>
          </div>
        </Card>

        {/* Community Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card border-border p-6 shadow-card">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-12 h-12 border-2 border-border">
                  <AvatarFallback className="bg-muted font-bold">
                    {post.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground">{post.author}</h3>
                    <Badge variant="outline" className="text-xs">
                      {post.champion} • Lvl {post.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                </div>
              </div>

              {/* Achievement Badge */}
              {post.achievement && (
                <Badge
                  variant="secondary"
                  className="mb-3 bg-success/20 text-success border-success/50"
                >
                  🏆 {post.achievement}
                </Badge>
              )}

              {/* Post Content */}
              <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-success"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {post.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {post.comments}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Community;
