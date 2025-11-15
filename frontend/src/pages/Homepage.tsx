import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Users, Trophy, Target, TrendingUp, Calendar, Repeat, Brain, ListChecks, Shield, Swords, BarChart3, MessageSquare } from 'lucide-react';
import SignupModal from '@/components/SignupModal';
import Footer from '@/components/Footer';

const Homepage = () => {
  const [showSignup, setShowSignup] = useState(false);

  const features = [
    {
      title: "AI Sage",
      description: "Your personal AI coach that understands your habits, provides personalized insights, and guides you on your journey. Nobody else has this.",
      gradient: "from-purple-200 to-indigo-200",
      icon: Brain,
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 backdrop-blur-sm rounded-lg border border-purple-400/30">
            <Brain className="w-5 h-5 text-purple-200" />
            <span className="text-sm font-medium text-white">AI Insights</span>
          </div>
          <div className="text-xs text-white/70">Personalized guidance</div>
        </div>
      ),
    },
    {
      title: "Habits",
      description: "Core functionality at your fingertips. Create, track, and manage your habits with ease. The foundation of your success.",
      gradient: "from-blue-200 to-cyan-200",
      icon: ListChecks,
      visual: (
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20">
            <div className="w-4 h-4 border-2 border-green-400 rounded bg-green-500"></div>
            <span className="text-sm font-medium text-white">Morning Workout</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <div className="w-4 h-4 border-2 border-white/30 rounded"></div>
            <span className="text-sm text-white/80">Read 30 min</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20">
            <div className="w-4 h-4 border-2 border-green-400 rounded bg-green-500"></div>
            <span className="text-sm font-medium text-white">Meditate</span>
          </div>
        </div>
      ),
    },
    {
      title: "Champion",
      description: "Gamification that creates emotional engagement. Watch your character evolve from Learner to Transcendent as you build habits.",
      gradient: "from-orange-200 to-pink-200",
      icon: Shield,
      visual: (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-purple-500/30 backdrop-blur-sm rounded-lg border border-purple-400/30 text-white text-sm font-medium">Level 1</div>
            <div className="px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-lg border border-green-400/30 text-white text-sm font-medium">Level 5</div>
            <div className="px-3 py-1 bg-blue-500/30 backdrop-blur-sm rounded-lg border border-blue-400/30 text-white text-sm font-medium">Level 9</div>
          </div>
          <div className="text-xs text-white/70">Evolve with every habit</div>
        </div>
      ),
    },
    {
      title: "Challenges",
      description: "Social accountability that drives retention. Compete with friends, join challenges, and stay motivated together.",
      gradient: "from-red-200 to-orange-200",
      icon: Swords,
      visual: (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 bg-red-500/30 backdrop-blur-sm rounded-lg border border-red-400/30">
            <div>
              <div className="text-sm font-bold text-white">7-Day Challenge</div>
              <div className="text-xs text-white/70">3 days remaining</div>
            </div>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-xs text-white/70">Stay accountable</div>
        </div>
      ),
    },
    {
      title: "Stats",
      description: "Progress visibility that motivates users. See your growth with detailed analytics, streaks, and visual progress tracking.",
      gradient: "from-green-200 to-emerald-200",
      icon: BarChart3,
      visual: (
        <div className="space-y-2">
          <div className="flex items-end gap-1 h-12 bg-white/5 rounded-lg p-2">
            <div className="w-4 bg-gradient-to-t from-green-600 to-green-400 rounded-t shadow-lg" style={{ height: '60%' }}></div>
            <div className="w-4 bg-gradient-to-t from-green-600 to-green-400 rounded-t shadow-lg" style={{ height: '80%' }}></div>
            <div className="w-4 bg-gradient-to-t from-green-600 to-green-400 rounded-t shadow-lg" style={{ height: '100%' }}></div>
            <div className="w-4 bg-gradient-to-t from-green-600 to-green-400 rounded-t shadow-lg" style={{ height: '70%' }}></div>
            <div className="w-4 bg-gradient-to-t from-green-600 to-green-400 rounded-t shadow-lg" style={{ height: '90%' }}></div>
          </div>
          <div className="text-xs text-white/70">Weekly progress</div>
        </div>
      ),
    },
    {
      title: "Social Feed",
      description: "Community feel that reduces loneliness. Connect with others, share your wins, and feel part of something bigger.",
      gradient: "from-pink-200 to-purple-200",
      icon: MessageSquare,
      visual: (
        <div className="space-y-2">
          <div className="flex items-start gap-2 px-3 py-2 bg-pink-500/30 backdrop-blur-sm rounded-lg border border-pink-400/30">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-lg"></div>
            <div className="flex-1">
              <div className="text-xs font-medium text-white">@user123 completed Morning Workout!</div>
              <div className="text-xs text-white/70">2 hours ago</div>
            </div>
          </div>
          <div className="text-xs text-white/70">Stay connected</div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/Character_Img/Logo.png" 
                alt="Havit Logo" 
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold text-white">Havit</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="/#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Log In
              </Link>
              <Button onClick={() => setShowSignup(true)} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg">
                Get started free
              </Button>
            </nav>

            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-white/80">
                Log In
              </Link>
              <Button onClick={() => setShowSignup(true)} size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              The Only Habit Tracker
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                People Keep Using
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
              Build habits that actually stick. With character progression, social challenges, and AI-powered insights.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => setShowSignup(true)} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg px-8 shadow-xl">
                Get started free
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20">
                Learn more
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <div className="mb-4 min-h-[120px] flex items-center justify-center">
                    {feature.visual}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {Icon && <Icon className="w-6 h-6 text-white" />}
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Signup Modal */}
      <SignupModal open={showSignup} onOpenChange={setShowSignup} />
    </div>
  );
};

export default Homepage;

