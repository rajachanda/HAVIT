import { ReactNode } from "react";

interface StatsBarProps {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
}

export const StatsBar = ({ icon, label, value, suffix }: StatsBarProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg shadow-md transition-all duration-300 hover:bg-muted/50 hover:shadow-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground">
          {value}
          {suffix && <span className="text-base text-muted-foreground ml-1">{suffix}</span>}
        </div>
      </div>
    </div>
  );
};
