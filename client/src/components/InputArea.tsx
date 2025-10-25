import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  externalValue?: string;
  onExternalValueChange?: () => void;
}

export function InputArea({ onSend, disabled = false, externalValue, onExternalValueChange }: InputAreaProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle external value changes
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== input) {
      setInput(externalValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      if (onExternalValueChange) {
        onExternalValueChange();
      }
    }
  }, [externalValue, input, onExternalValueChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={cn(
          "relative rounded-2xl backdrop-blur-xl bg-card/60 border-2 transition-all duration-300",
          disabled
            ? "border-border/50"
            : "border-white/20 hover:border-primary/30 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/10"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask WOW anything..."
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent px-6 py-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          data-testid="input-message"
        />

        {/* Character count */}
        <div className="absolute bottom-3 left-6 text-xs text-muted-foreground/50">
          {input.length} characters
        </div>

        {/* Send button */}
        <div className="absolute bottom-3 right-3">
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !input.trim()}
            className={cn(
              "rounded-full transition-all duration-300",
              input.trim() && !disabled
                ? "bg-gradient-energetic shadow-lg shadow-primary/30"
                : ""
            )}
            data-testid="button-send"
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground/60 mt-2 ml-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
}
