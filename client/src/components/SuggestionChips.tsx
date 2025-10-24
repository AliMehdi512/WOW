import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSuggestionClick }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center" data-testid="suggestion-chips">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
          className="rounded-full backdrop-blur-md bg-card/40 border-white/10"
          data-testid={`suggestion-chip-${index}`}
        >
          <Lightbulb className="w-3 h-3 mr-2" />
          <span className="text-sm">{suggestion}</span>
        </Button>
      ))}
    </div>
  );
}
