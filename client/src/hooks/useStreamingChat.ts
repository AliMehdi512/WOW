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
      // Try backend API first (for localhost development)
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

        if (response.ok && response.body) {
          // Backend is available, use it
          return await handleBackendStream(response, content);
        }
      } catch (backendError) {
        console.log("Backend not available, using direct MLVOCA API");
      }

      // Fallback to direct MLVOCA API call
      return await handleMLVOCAStream(content);

    } catch (err) {
      console.error("Streaming error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsStreaming(false);
      setStreamingContent("");
      throw err;
    }
  };

  const handleBackendStream = async (response: Response, content: string): Promise<StreamingResponse> => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalData: any = null;
    let aiContent = "";

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
              aiContent += data.content;
              setStreamingContent(aiContent);
            } else if (data.type === "complete") {
              finalData = data;
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

    await queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    setIsStreaming(false);
    setStreamingContent("");

    return {
      userMessage: finalData.userMessage,
      aiMessage: finalData.aiMessage,
    };
  };

  const handleMLVOCAStream = async (content: string): Promise<StreamingResponse> => {
    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      responseTime: null,
      agenticActions: null,
    };

    let response;
    try {
      // Call MLVOCA API directly
      response = await fetch("https://mlvoca.com/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tinyllama",
          prompt: content,
          stream: true,
        }),
      });
    } catch (fetchError) {
      // CORS or network error - provide helpful error message
      const errorMessage = fetchError instanceof TypeError && fetchError.message.includes('fetch')
        ? "Unable to connect to AI service. This may be due to CORS restrictions. Please run with the local backend server at localhost:5000."
        : fetchError instanceof Error ? fetchError.message : "Unknown error";
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      throw new Error(`MLVOCA API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let aiContent = "";

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Process each line (MLVOCA sends JSON objects per line)
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            // Only process the response field
            if (data.response !== undefined && data.response !== "") {
              aiContent += data.response;
              setStreamingContent(aiContent);
            }
          } catch (e) {
            // If JSON parsing fails, try to extract response using regex
            const responseMatch = line.match(/"response":"([^"]*)"/);
            if (responseMatch && responseMatch[1]) {
              aiContent += responseMatch[1];
              setStreamingContent(aiContent);
            }
          }
        }
      }
    }

    // Create AI message
    const aiMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiContent,
      timestamp: new Date(),
      responseTime: null,
      agenticActions: [],
    };

    setIsStreaming(false);
    setStreamingContent("");

    return {
      userMessage,
      aiMessage,
    };
  };

  return {
    sendMessage,
    isStreaming,
    streamingContent,
    error,
  };
}
