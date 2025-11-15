import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveConversation, savePersona } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Send, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'sage';
  text: string;
  timestamp: Date;
}

const QUESTIONS = [
  "What's your biggest blocker to building habits?",
  "How do you respond to failure?",
  "What's your relationship with competition?",
  "When you see someone else succeed, you...?",
  "What would make you DELETE this app?",
  "When you imagine the PERFECT habit, what does that look like?",
  "What's the smallest version of this habit that would feel like a WIN?",
  "Walk me through a typical day. When's your highest energy?",
  "Have you tried building habits before? What happened?",
  "If you had to describe your current life situation in ONE word, what would it be?",
];

export default function ConversationalOnboarding() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'sage',
      text: "Hello, I'm Sage. I'll be your guide on this journey. Let me ask you some questions to personalize your experience. Ready?",
      timestamp: new Date(),
    },
    {
      role: 'sage',
      text: QUESTIONS[0],
      timestamp: new Date(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (text: string): Promise<void> => {
    setIsTyping(true);
    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    
    setMessages((prev) => [
      ...prev,
      {
        role: 'sage',
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const generatePersona = (conversationHistory: Message[]) => {
    // Mock persona generation - in production, integrate with Gemini API
    const userResponses = conversationHistory
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.text.toLowerCase());

    // Simple logic to determine archetype based on keywords
    let archetype = 'Guardian';
    let traits = ['methodical', 'reliable', 'persistent'];
    let coachingStyle = 'supportive and steady';

    if (userResponses.some((r) => r.includes('compete') || r.includes('win'))) {
      archetype = 'Warrior';
      traits = ['competitive', 'driven', 'ambitious'];
      coachingStyle = 'challenging and motivational';
    } else if (userResponses.some((r) => r.includes('learn') || r.includes('understand'))) {
      archetype = 'Mage';
      traits = ['analytical', 'curious', 'strategic'];
      coachingStyle = 'educational and insightful';
    } else if (userResponses.some((r) => r.includes('quick') || r.includes('flexible'))) {
      archetype = 'Rogue';
      traits = ['adaptable', 'spontaneous', 'resourceful'];
      coachingStyle = 'dynamic and playful';
    }

    return {
      personaName: `The ${archetype}`,
      archetype,
      traits,
      coachingStyle,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: currentInput.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput('');

    // Check if we've finished all questions
    if (currentQuestion >= QUESTIONS.length - 1) {
      // Final question answered
      setLoading(true);
      
      if (currentUser) {
        const allMessages = [...messages, userMessage];
        
        // Save conversation to Firestore
        await saveConversation(currentUser.uid, allMessages);
        
        // Generate and save persona
        const persona = generatePersona(allMessages);
        await savePersona(currentUser.uid, persona);
        
        await simulateTyping(
          "Thank you for sharing! I've learned a lot about you. Now, let's choose your champion to represent your journey..."
        );
        
        setLoading(false);
        
        // Navigate to character select after a brief delay
        setTimeout(() => {
          navigate('/character-select');
        }, 2000);
      }
    } else {
      // Ask next question
      const nextQuestion = currentQuestion + 1;
      await simulateTyping(QUESTIONS[nextQuestion]);
      setCurrentQuestion(nextQuestion);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Messages container */}
        <Card className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.role === 'sage' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">Sage</span>
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">Sage</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your answer..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                disabled={loading || isTyping}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!currentInput.trim() || loading || isTyping}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
