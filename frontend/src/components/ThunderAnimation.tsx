import { useEffect, useState } from "react";

interface ThunderAnimationProps {
  isActive: boolean;
  onComplete: () => void;
}

export const ThunderAnimation = ({ isActive, onComplete }: ThunderAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        onComplete();
      }, 2000); // Slightly longer for more intense effect
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!showAnimation) return null;

  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
      {/* Lightning bolts - contained within circle */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {/* Lightning bolt 1 - Left */}
        <svg
          className="absolute top-0 left-[15%] w-3 h-full animate-thunder-1"
          viewBox="0 0 30 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 0 L8 40 L18 50 L10 80 L20 90 L15 160"
            stroke="url(#lightning-blue-1)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-blue-1)"
          />
          <defs>
            <linearGradient id="lightning-blue-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DBEAFE" stopOpacity="1" />
              <stop offset="30%" stopColor="#93C5FD" stopOpacity="1" />
              <stop offset="60%" stopColor="#60A5FA" stopOpacity="1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow-blue-1">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Lightning bolt 2 - Right */}
        <svg
          className="absolute top-0 right-[15%] w-3 h-full animate-thunder-2"
          viewBox="0 0 30 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 0 L22 35 L12 45 L20 75 L10 85 L15 160"
            stroke="url(#lightning-blue-2)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-blue-2)"
          />
          <defs>
            <linearGradient id="lightning-blue-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DBEAFE" stopOpacity="1" />
              <stop offset="30%" stopColor="#60A5FA" stopOpacity="1" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow-blue-2">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Lightning bolt 3 - Center */}
        <svg
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-full animate-thunder-3"
          viewBox="0 0 30 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 0 L12 25 L18 35 L11 60 L19 70 L15 160"
            stroke="url(#lightning-blue-3)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-blue-3)"
          />
          <defs>
            <linearGradient id="lightning-blue-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="25%" stopColor="#DBEAFE" stopOpacity="1" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="1" />
              <stop offset="75%" stopColor="#60A5FA" stopOpacity="1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
            </linearGradient>
            <filter id="glow-blue-3">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Additional smaller bolts for intensity */}
        <svg
          className="absolute top-0 left-[30%] w-2 h-full animate-thunder-4"
          viewBox="0 0 20 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 0 L6 50 L14 60 L8 100 L16 110 L10 160"
            stroke="url(#lightning-blue-4)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="lightning-blue-4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="absolute top-0 right-[30%] w-2 h-full animate-thunder-5"
          viewBox="0 0 20 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 0 L14 45 L6 55 L12 95 L4 105 L10 160"
            stroke="url(#lightning-blue-5)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="lightning-blue-5" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Intense blue flash overlay - contained in circle */}
      <div className="absolute inset-0 bg-blue-400 animate-flash-blue rounded-full" />

      {/* Blue glow effect - contained in circle */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/60 via-blue-400/30 to-transparent animate-glow-pulse-blue rounded-full" />
      
      {/* Outer rim glow */}
      <div className="absolute inset-0 rounded-full border-4 border-blue-400/80 animate-rim-glow" />
    </div>
  );
};

