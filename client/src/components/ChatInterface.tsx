import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageBubble } from "./MessageBubble";
import { InputArea } from "./InputArea";
import { AIProcessingIndicator } from "./AIProcessingIndicator";
import { SuggestionChips } from "./SuggestionChips";
import { EnergyMeter } from "./EnergyMeter";
import { AgenticBadge } from "./AgenticBadge";
import { useToast } from "@/hooks/use-toast";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { queryClient } from "@/lib/queryClient";
import type { Message } from "@shared/schema";
import { Loader2, Sparkles } from "lucide-react";

export function ChatInterface() {
  const [energyLevel, setEnergyLevel] = useState(0);
  const [currentAgenticActions, setCurrentAgenticActions] = useState<string[]>([]);
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<Message | null>(null);
  const { toast } = useToast();
  const { sendMessage, isStreaming, streamingContent, error } = useStreamingChat();

  // Fetch all messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Combine persisted messages with optimistic user message
  const displayMessages = optimisticUserMessage 
    ? [...messages, optimisticUserMessage] 
    : messages;

  const suggestions = [
    "Analyze this data",
    "Create a strategic plan",
    "Research latest trends",
    "Generate creative content",
    "Optimize workflow",
  ];

  const handleSendMessage = async (content: string) => {
    try {
      const startTime = Date.now();
      
      // Create optimistic user message
      const optimisticMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
        responseTime: null,
        agenticActions: null,
      };
      
      setOptimisticUserMessage(optimisticMessage);
      
      const result = await sendMessage(content);
      
      // Clear optimistic message once real messages are loaded
      setOptimisticUserMessage(null);
      
      // Calculate and update energy level based on actual response time
      const responseTime = result.aiMessage.responseTime || (Date.now() - startTime);
      const energyScore = Math.max(50, Math.min(100, 100 - (responseTime / 50)));
      setEnergyLevel(energyScore);
      
      // Update agentic actions from real backend data
      if (result.aiMessage.agenticActions && result.aiMessage.agenticActions.length > 0) {
        setCurrentAgenticActions(result.aiMessage.agenticActions);
        setTimeout(() => setCurrentAgenticActions([]), 5000);
      }
      
      // Gradually decrease energy level
      setTimeout(() => setEnergyLevel(0), 3000);
    } catch (err) {
      setOptimisticUserMessage(null);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setEnergyLevel(0);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Show error toast if streaming error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    const container = document.getElementById("chat-messages-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [displayMessages, isStreaming, streamingContent]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 animate-gradient-shift bg-200%" />
      
      {/* Radial gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-transparent to-background/80" />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto">
        {/* Header with glassmorphism */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 backdrop-blur-lg bg-card/30 border-b border-white/10" data-testid="header-main">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-energetic flex items-center justify-center">
                <span className="text-white font-mono font-bold text-sm">E</span>
              </div>
              <h1 className="text-xl font-mono font-bold bg-gradient-energetic bg-clip-text text-transparent">
                Energetic AI
              </h1>
            </div>
            
            {/* Connection status indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-status-online/10 border border-status-online/20">
              <div className="w-2 h-2 rounded-full bg-status-online animate-pulse-glow" />
              <span className="text-xs text-status-online font-medium">CONNECTED</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(isStreaming || energyLevel > 0) && <EnergyMeter level={energyLevel} />}
            {currentAgenticActions.length > 0 && <AgenticBadge actions={currentAgenticActions} />}
          </div>
        </header>

        {/* Chat messages area */}
        <div 
          id="chat-messages-container"
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth" 
          data-testid="chat-messages-container"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading conversation...</p>
              </div>
            </div>
          ) : displayMessages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-energetic opacity-20 blur-2xl" />
              <div className="space-y-3">
                <h2 className="text-2xl font-mono font-bold text-foreground">
                  Welcome to Energetic AI
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Experience advanced AI with autonomous decision-making and lightning-fast responses.
                  Ask anything to get started.
                </p>
              </div>
              
              {/* Suggestion chips for empty state */}
              <div className="mt-8">
                <p className="text-sm text-muted-foreground mb-4">Try asking:</p>
                <SuggestionChips 
                  suggestions={suggestions} 
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((message, index) => (
                <MessageBubble 
                  key={message.id} 
                  message={message}
                  index={index}
                />
              ))}
              
              {/* Streaming message */}
              {isStreaming && (
                <>
                  <AIProcessingIndicator />
                  {streamingContent && (
                    <div className="flex gap-3 animate-slide-up" data-testid="streaming-message">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-energetic flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 max-w-[70%]">
                        <div className="rounded-2xl px-6 py-4 backdrop-blur-md bg-card/40 border border-white/10 shadow-xl shadow-black/10">
                          <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                            {streamingContent}
                            <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse-glow" />
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Input area with glassmorphism */}
        <div className="flex-shrink-0 border-t border-white/10 backdrop-blur-xl bg-card/30">
          <div className="px-6 py-6">
            <InputArea 
              onSend={handleSendMessage}
              disabled={isStreaming}
            />
            
            {displayMessages.length > 0 && !isStreaming && (
              <div className="mt-4">
                <SuggestionChips 
                  suggestions={suggestions} 
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
