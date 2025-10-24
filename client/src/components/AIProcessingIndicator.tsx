import { Sparkles } from "lucide-react";

export function AIProcessingIndicator() {
  return (
    <div className="flex gap-3 animate-slide-up" data-testid="ai-processing-indicator">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-energetic flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>

      {/* Processing bubble */}
      <div className="flex-1 max-w-[70%]">
        <div className="rounded-2xl px-6 py-4 backdrop-blur-md bg-card/40 border border-white/10 shadow-xl shadow-black/10">
          <div className="flex items-center gap-3">
            {/* Processing badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-energetic/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs text-primary font-medium uppercase tracking-wide">
                Processing
              </span>
            </div>

            {/* Typing dots animation */}
            <div className="flex gap-1">
              <div 
                className="w-2 h-2 rounded-full bg-primary animate-typing-dots"
                style={{ animationDelay: "0ms" }}
              />
              <div 
                className="w-2 h-2 rounded-full bg-primary animate-typing-dots"
                style={{ animationDelay: "200ms" }}
              />
              <div 
                className="w-2 h-2 rounded-full bg-primary animate-typing-dots"
                style={{ animationDelay: "400ms" }}
              />
            </div>
          </div>

          {/* AI status text */}
          <p className="text-sm text-muted-foreground mt-2">
            Analyzing your request with advanced neural processing...
          </p>
        </div>
      </div>
    </div>
  );
}
