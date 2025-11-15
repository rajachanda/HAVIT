import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeBadgeProps {
  show?: boolean;
}

export const RealtimeBadge = ({ show = true }: RealtimeBadgeProps) => {
  const [isConnected, setIsConnected] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Pulse animation every few seconds to show it's live
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 transition-all ${
        isConnected 
          ? 'bg-success/10 text-success border-success/30' 
          : 'bg-destructive/10 text-destructive border-destructive/30'
      } ${pulse ? 'scale-110' : 'scale-100'}`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 animate-pulse" />
          <span className="text-xs">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span className="text-xs">Offline</span>
        </>
      )}
    </Badge>
  );
};
