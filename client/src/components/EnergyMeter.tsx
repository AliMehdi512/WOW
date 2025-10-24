import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnergyMeterProps {
  level: number;
}

export function EnergyMeter({ level }: EnergyMeterProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-md border border-white/10" data-testid="energy-meter">
      <Zap className="w-4 h-4 text-electric-blue" />
      
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-foreground uppercase tracking-wide">
          Energy
        </span>
        
        {/* Energy bar */}
        <div className="w-24 h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-cyan transition-all duration-500 animate-pulse-glow"
            )}
            style={{ width: `${level}%` }}
            data-testid="energy-level"
          />
        </div>
      </div>
      
      <span className="text-xs font-mono font-bold text-electric-blue ml-1">
        {level}%
      </span>
    </div>
  );
}
