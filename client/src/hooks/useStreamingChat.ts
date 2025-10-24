import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@shared/schema";

interface StreamingChatResult {
  sendMessage: (content: string) => Promise<StreamingResponse>;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

interface StreamingResponse {
  userMessage: Message;
  aiMessage: Message;
}

export function useStreamingChat(): StreamingChatResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = async (content: string): Promise<StreamingResponse> => {
    setIsStreaming(true);
    setStreamingContent("");
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "chunk") {
                setStreamingContent((prev) => prev + data.content);
              } else if (data.type === "complete") {
                finalData = data;
                // Invalidate queries to refresh message list
                await queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
                setIsStreaming(false);
                setStreamingContent("");
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      if (!finalData) {
        throw new Error("No complete event received");
      }

      return {
        userMessage: finalData.userMessage,
        aiMessage: finalData.aiMessage,
      };
    } catch (err) {
      console.error("Streaming error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsStreaming(false);
      setStreamingContent("");
      throw err;
    }
  };

  return {
    sendMessage,
    isStreaming,
    streamingContent,
    error,
  };
}
