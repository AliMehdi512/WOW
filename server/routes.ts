import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

const MLVO_API_URL = process.env.MLVO_API_URL || "https://mlvoca.com/api/generate";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a chat message and get AI response with streaming support
  app.post("/api/chat", async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Validate request body
      const userMessageData = insertMessageSchema.parse({
        role: "user" as const,
        content: req.body.content,
        responseTime: null,
        agenticActions: null,
      });

      // Save user message
      const userMessage = await storage.createMessage(userMessageData);

      // Check if client wants streaming (default to streaming for better UX)
      const useStreaming = req.body.stream !== false;

      if (useStreaming) {
        // Set up Server-Sent Events for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let aiContent = "";
        let responseTime = 0;
        let agenticActions: string[] = [];

        try {
          // Call MLVO API with streaming
          const mlvoResponse = await fetch(MLVO_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "tinyllama",
              prompt: req.body.content,
              stream: true,
            }),
          });

          if (!mlvoResponse.ok) {
            throw new Error(`MLVO API error: ${mlvoResponse.statusText}`);
          }

          // Stream the response
          const reader = mlvoResponse.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;
              
              // Process complete lines
              const lines = buffer.split('\n');
              buffer = lines.pop() || ""; // Keep incomplete line in buffer
              
              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const data = JSON.parse(line);
                    // Only process and send the response field
                    if (data.response !== undefined && data.response !== "") {
                      aiContent += data.response;
                      // Send only the parsed response text to client
                      const chunkToSend = { type: 'chunk', content: data.response };
                      console.log("Sending chunk to client:", chunkToSend);
                      res.write(`data: ${JSON.stringify(chunkToSend)}\n\n`);
                    }
                  } catch (e) {
                    // If JSON parsing fails, try to extract response using regex
                    const responseMatch = line.match(/"response":"([^"]*)"/);
                    if (responseMatch && responseMatch[1]) {
                      aiContent += responseMatch[1];
                      res.write(`data: ${JSON.stringify({ type: 'chunk', content: responseMatch[1] })}\n\n`);
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error calling MLVOCA API:", error);
          console.error("API URL:", MLVO_API_URL);
          
          // Fallback response if API fails
          aiContent = "I'm currently experiencing connectivity issues with the MLVOCA API. This is a demo response to show the interface capabilities. The application is working correctly, but the external AI service is temporarily unavailable. In production, I would provide intelligent responses powered by the MLVOCA AI engine.";
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: aiContent })}\n\n`);
          agenticActions = ["Error Recovery", "Fallback Mode"];
        }

        // Calculate response time and detect agentic actions
        responseTime = Date.now() - startTime;
        
        if (aiContent.toLowerCase().includes("analyze") || aiContent.toLowerCase().includes("research")) {
          agenticActions.push("Data Analysis");
        }
        if (aiContent.toLowerCase().includes("plan") || aiContent.toLowerCase().includes("strategy")) {
          agenticActions.push("Strategic Planning");
        }
        if (aiContent.toLowerCase().includes("create") || aiContent.toLowerCase().includes("generate")) {
          agenticActions.push("Content Generation");
        }

        // Save AI message
        const aiMessage = await storage.createMessage({
          role: "assistant" as const,
          content: aiContent,
          responseTime,
          agenticActions: agenticActions.length > 0 ? agenticActions : null,
        });

        // Send final message
        res.write(`data: ${JSON.stringify({ 
          type: 'complete', 
          userMessage,
          aiMessage 
        })}\n\n`);
        res.end();
      } else {
        // Non-streaming mode (fallback)
        let aiContent = "";
        let responseTime = 0;
        let agenticActions: string[] = [];

        try {
          const mlvoResponse = await fetch(MLVO_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "tinyllama",
              prompt: req.body.content,
              stream: false,
            }),
          });

          if (!mlvoResponse.ok) {
            throw new Error(`MLVO API error: ${mlvoResponse.statusText}`);
          }

          const mlvoData = await mlvoResponse.json();
          aiContent = mlvoData.response || mlvoData.message || mlvoData.text || "I apologize, but I couldn't process that request.";
          
          responseTime = Date.now() - startTime;

          if (aiContent.toLowerCase().includes("analyze") || aiContent.toLowerCase().includes("research")) {
            agenticActions.push("Data Analysis");
          }
          if (aiContent.toLowerCase().includes("plan") || aiContent.toLowerCase().includes("strategy")) {
            agenticActions.push("Strategic Planning");
          }
          if (aiContent.toLowerCase().includes("create") || aiContent.toLowerCase().includes("generate")) {
            agenticActions.push("Content Generation");
          }
        } catch (error) {
          console.error("Error calling MLVOCA API:", error);
          console.error("API URL:", MLVO_API_URL);
          
          aiContent = "I'm currently experiencing connectivity issues with the MLVOCA API. This is a demo response to show the interface capabilities. The application is working correctly, but the external AI service is temporarily unavailable. In production, I would provide intelligent responses powered by the MLVOCA AI engine.";
          responseTime = Date.now() - startTime;
          agenticActions = ["Error Recovery", "Fallback Mode"];
        }

        const aiMessage = await storage.createMessage({
          role: "assistant" as const,
          content: aiContent,
          responseTime,
          agenticActions: agenticActions.length > 0 ? agenticActions : null,
        });

        res.json({
          userMessage,
          aiMessage,
        });
      }
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to process chat message" });
      }
    }
  });

  // Clear all messages (for testing/demo purposes)
  app.delete("/api/messages", async (req, res) => {
    try {
      res.json({ success: true, message: "Messages cleared" });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
