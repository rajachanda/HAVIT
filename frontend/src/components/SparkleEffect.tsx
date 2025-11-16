import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  top: number;
  left: number;
  delay: number;
  size: number;
}

interface SparkleEffectProps {
  children: React.ReactNode;
  count?: number;
  className?: string;
}

const SparkleEffect = ({ children, count = 3, className = '' }: SparkleEffectProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        size: 12 + Math.random() * 8,
      }));
    };

    setSparkles(generateSparkles());

    // Regenerate sparkles periodically
    const interval = setInterval(() => {
      setSparkles(generateSparkles());
    }, 3000);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className={`relative ${className}`}>
      {children}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none text-yellow-400 animate-sparkle"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
            fontSize: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

export default SparkleEffect;
