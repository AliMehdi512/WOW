import { Brain } from "lucide-react";

interface AgenticBadgeProps {
  actions: string[];
}

export function AgenticBadge({ actions }: AgenticBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-agentic/20 backdrop-blur-md border border-vivid-magenta/30" data-testid="agentic-badge">
      <Brain className="w-4 h-4 text-vivid-magenta animate-pulse-glow" />
      
      <div className="flex flex-col">
        <span className="text-xs font-medium text-vivid-magenta uppercase tracking-wide">
          Agentic AI
        </span>
        <span className="text-xs text-muted-foreground">
          {actions.length} {actions.length === 1 ? 'action' : 'actions'}
        </span>
      </div>
    </div>
  );
}
