import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please configure it in your Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Retry helper for handling transient Gemini API 503/UNAVAILABLE errors
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = String(error.message || error);
    const isUnavailable = 
      error.status === 'UNAVAILABLE' || 
      error.statusCode === 503 || 
      error.code === 503 ||
      errorStr.includes('503') ||
      errorStr.includes('UNAVAILABLE') ||
      errorStr.includes('high demand') ||
      errorStr.includes('Service Unavailable');
    
    if (retries > 0 && isUnavailable) {
      console.warn(`Gemini API currently experiencing high demand/unavailable. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * backoff, backoff);
    }
    throw error;
  }
}

// API endpoint: Chat with Gemini (supports Streaming!)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, model } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Setup headers for Server-Sent Events (SSE) streaming to prevent buffering on Cloud Run/Nginx
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let requestedModel = model || "gemini-3.5-flash";
    // Force standard Gemini models to keep things out-of-the-box and fully managed by Google AI Studio
    if (!requestedModel.startsWith("gemini-")) {
      requestedModel = "gemini-3.5-flash";
    }

    try {
      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text || m.content || "" }]
      }));

      const ai = getGeminiClient();
      const responseStream = await retryWithBackoff<any>(() =>
        ai.models.generateContentStream({
          model: requestedModel,
          contents,
          config: {
            systemInstruction: systemInstruction || "You are a helpful, friendly, and highly intelligent AI chat assistant. Format your replies beautifully using Markdown.",
          }
        })
      );

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    } catch (geminiError: any) {
      console.error("Gemini stream failed:", geminiError);
      throw geminiError;
    }
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    
    const friendlyMessage = error.message || "Internal Server Error";

    // Write the error into the SSE stream if possible, or send JSON if stream not started
    if (!res.headersSent) {
      res.status(500).json({ error: friendlyMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: friendlyMessage })}\n\n`);
      res.end();
    }
  }
});

// API endpoint: Generate Conversation Title with Gemini
app.post("/api/generate-title", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const prompt = `Based on this initial user query, generate a very brief, concise chat conversation title (maximum 3-5 words, do not include quotes or surrounding punctuation): "${message}"`;

    try {
      const ai = getGeminiClient();
      const response = await retryWithBackoff(() =>
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        })
      );
      const title = response.text?.trim().replace(/^["']|["']$/g, "") || "New Chat";
      res.json({ title });
    } catch (geminiError) {
      console.warn("Gemini title generation failed, using fallback title:", geminiError);
      res.json({ title: "New Chat" });
    }
  } catch (error: any) {
    console.error("Error in /api/generate-title:", error);
    res.status(500).json({ error: error.message || "Failed to generate title" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support React Router/SPA fallback serving
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
