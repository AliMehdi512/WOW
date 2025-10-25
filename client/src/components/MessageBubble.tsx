import { format } from "date-fns";
import { User, Sparkles } from "lucide-react";
import type { Message } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      data-testid={`message-bubble-${message.id}`}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center overflow-hidden",
          isUser
            ? "bg-gradient-to-br from-muted to-secondary"
            : ""
        )}
        data-testid={`avatar-${message.role}`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-foreground" />
        ) : (
          <img 
            src="/logo.jpg" 
            alt="Energetic AI" 
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex-1 max-w-[85%] space-y-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Message bubble with glassmorphism */}
        <div
          className={cn(
            "rounded-2xl px-6 py-4 backdrop-blur-md border transition-all duration-300",
            isUser
              ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg shadow-primary/5"
              : "bg-card/40 border-white/10 shadow-xl shadow-black/10"
          )}
        >
          <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap" data-testid={`message-content-${message.id}`}>
            {message.content}
          </p>
          
          {/* AI response metadata */}
          {!isUser && message.responseTime && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-muted-foreground">
                Response time: {message.responseTime}ms
              </span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-electric-blue font-medium">
                Energetic AI
              </span>
            </div>
          )}
          
          {/* Agentic actions indicator */}
          {!isUser && message.agenticActions && message.agenticActions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.agenticActions.map((action, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs rounded-full bg-gradient-agentic text-white font-medium"
                  data-testid={`agentic-action-${idx}`}
                >
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "flex gap-2 px-2",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-muted-foreground/70" data-testid={`timestamp-${message.id}`}>
            {format(new Date(message.timestamp), "h:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
}
