import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Instagram, 
  Facebook, 
  Twitter, 
  Copy, 
  Sparkles, 
  Trophy,
  Zap,
  Crown,
  Star,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareCharacterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  level: number;
  levelName: string;
  totalXP: number;
  championType: string;
  characterImage: string;
}

export function ShareCharacterModal({
  open,
  onOpenChange,
  userName,
  level,
  levelName,
  totalXP,
  championType,
  characterImage,
}: ShareCharacterModalProps) {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `🎮 I just reached Level ${level} (${levelName}) in HAVIT with ${totalXP.toLocaleString()} XP! 🏆\n\nJoin me in building better habits!\n#HAVIT #HabitTracker #LevelUp`;

  const captureAndDownload = async () => {
    setIsCapturing(true);
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.getElementById('share-card');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HAVIT-Level${level}-${userName}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "🎉 Image Downloaded!",
        description: "Your achievement card has been saved. Share it on social media!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShare = async (platform: 'instagram' | 'facebook' | 'twitter' | 'copy') => {
    const shareUrl = window.location.origin;

    switch (platform) {
      case 'instagram':
        await captureAndDownload();
        try {
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "📸 Ready for Instagram!",
            description: "Image downloaded and caption copied. Open Instagram to share!",
          });
          if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            setTimeout(() => window.open('instagram://'), 1000);
          }
        } catch (err) {
          toast({
            title: "📋 Caption Copied!",
            description: "Paste this when you share your downloaded image.",
          });
        }
        break;

      case 'facebook':
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
        break;

      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast({
            title: "✅ Copied!",
            description: "Share your achievement anywhere!",
          });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to copy. Please try again.",
            variant: "destructive",
          });
        }
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-transparent">
        <div className="relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-success/20 animate-pulse blur-3xl" />
          
          {/* Share Card - This is what gets captured */}
          <div id="share-card" className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/10 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative p-8 space-y-6">
              {/* Header with Logo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">HAVIT</h3>
                    <p className="text-xs text-gray-400">Habit Tracker</p>
                  </div>
                </div>
                <Badge className="bg-success/20 text-success border-success px-4 py-1.5">
                  Achievement Unlocked!
                </Badge>
              </div>

              {/* Main Content */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Character Image */}
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-success rounded-full blur-2xl opacity-50 animate-pulse" />
                  
                  {/* Image container */}
                  <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-primary bg-gradient-to-br from-primary/20 to-success/20 overflow-hidden shadow-2xl">
                    <img
                      src={characterImage}
                      alt={`Level ${level} Character`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Level badge */}
                  {/* <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-success text-white px-6 py-2 rounded-full shadow-lg border-2 border-white">
                    <span className="font-bold text-xl">Level {level}</span>
                  </div> */}
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <h2 className="text-4xl font-bold text-white">{userName}</h2>
                    </div>
                    <Badge variant="outline" className="text-xl px-6 py-2 border-2 border-primary text-primary">
                      {levelName}
                    </Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-primary" />
                        <p className="text-xs text-gray-400 uppercase">Total XP</p>
                      </div>
                      <p className="text-3xl font-bold text-white">{totalXP.toLocaleString()}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-success/20 to-success/10 border-success/30 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-success" />
                        <p className="text-xs text-gray-400 uppercase">Level</p>
                      </div>
                      <p className="text-3xl font-bold text-white">{level}</p>
                    </Card>
                  </div>

                  {/* Champion Type */}
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">{championType}</span>
                  </div>
                </div>
              </div>

              {/* Footer Quote */}
              <div className="border-t border-gray-700 pt-4 text-center">
                <p className="text-lg text-gray-300 italic">
                  "Building better habits, one day at a time"
                </p>
                <p className="text-sm text-gray-500 mt-2">havit.app</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleShare('instagram')}
                disabled={isCapturing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
                size="lg"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </Button>
              <Button
                onClick={() => handleShare('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                size="lg"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </Button>
              <Button
                onClick={() => handleShare('twitter')}
                className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                size="lg"
              >
                <Twitter className="w-5 h-5" />
                Twitter
              </Button>
              <Button
                onClick={captureAndDownload}
                disabled={isCapturing}
                className="bg-gradient-to-r from-primary to-success hover:opacity-90 text-white gap-2"
                size="lg"
              >
                <Download className="w-5 h-5" />
                {isCapturing ? 'Saving...' : 'Download'}
              </Button>
            </div>

            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
              className="w-full gap-2 border-2"
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Share Text
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
