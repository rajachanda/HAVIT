import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  animationDuration: number;
  delay: number;
  emoji: string;
}

interface ConfettiEffectProps {
  active?: boolean;
  duration?: number;
  pieceCount?: number;
}

const ConfettiEffect = ({ active = true, duration = 3000, pieceCount = 50 }: ConfettiEffectProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  const emojis = ['🎉', '🎊', '🌟', '✨', '⭐', '💫', '🎈'];

  useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setPieces(newPieces);
      setShow(true);

      // Hide after duration
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, pieceCount]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute text-2xl animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-10%',
            animationDuration: `${piece.animationDuration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          {piece.emoji}
        </div>
      ))}
    </div>
  );
};

export default ConfettiEffect;
