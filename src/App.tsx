import React, { useState, useEffect } from 'react';
import { Conversation, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

const STORAGE_KEY_CONVS = 'ai_chat_companion_conversations_v1';
const STORAGE_KEY_SYSTEM = 'ai_chat_companion_system_instruction_v1';
const STORAGE_KEY_THEME = 'ai_chat_companion_theme_v1';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to dark mode for an immersive chat experience
    return 'dark';
  });

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved conversations:", e);
      }
    }
    return [];
  });

  // Active Conversation ID State
  const [activeId, setActiveId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Conversation[];
        if (parsed.length > 0) {
          // Sort by updatedAt or pinned to choose the most recent active one
          const sorted = [...parsed].sort((a, b) => b.updatedAt - a.updatedAt);
          return sorted[0].id;
        }
      } catch (e) {}
    }
    return null;
  });

  // System Instruction State
  const [systemInstruction, setSystemInstruction] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SYSTEM);
    return saved || "You are a helpful, friendly, and highly intelligent AI chat assistant. Format your replies beautifully using Markdown.";
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SYSTEM, systemInstruction);
  }, [systemInstruction]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handler: Start a brand-new blank conversation
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: "llama-3.3-70b-versatile",
      isPinned: false
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
    setError(null);
  };

  // Handler: Delete a conversation
  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      // Adjust active conversation selection if deleted the current active one
      if (activeId === id) {
        if (next.length > 0) {
          setActiveId(next[0].id);
        } else {
          setActiveId(null);
        }
      }
      return next;
    });
  };

  // Handler: Toggle Pin/Unpin of a conversation
  const handleTogglePin = (id: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isPinned: !c.isPinned, updatedAt: Date.now() };
      }
      return c;
    }));
  };

  // Handler: Rename a conversation title
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, title: newTitle, updatedAt: Date.now() };
      }
      return c;
    }));
  };

  // Handler: Clear all histories
  const handleClearAll = () => {
    setConversations([]);
    setActiveId(null);
    setError(null);
  };

  // Locate the active conversation
  const activeConversation = conversations.find(c => c.id === activeId) || null;

  // Helper: auto-generate a beautiful title for a conversation on the first message exchange
  const generateTitleForConversation = async (convId: string, initialMessageText: string) => {
    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: initialMessageText })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.title) {
          handleRenameConversation(convId, data.title);
        }
      }
    } catch (e) {
      console.error("Title generation failed:", e);
    }
  };

  // Handler: Send a message to the Groq Server-Sent Events chat route
  const handleSendMessage = async (text: string, deepThink: boolean = false, model: string = "llama-3.3-70b-versatile") => {
    setError(null);
    let targetConvId = activeId;
    let targetConv = activeConversation;

    // If there is no active conversation or the active conversation is blank, create one
    if (!targetConvId || !targetConv) {
      const newConvId = generateId();
      const newConv: Conversation = {
        id: newConvId,
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: model,
        isPinned: false
      };
      
      // Update local variables and save state asynchronously
      targetConvId = newConvId;
      targetConv = newConv;
      
      setConversations(prev => [newConv, ...prev]);
      setActiveId(newConvId);
    }

    // 1. Add the user message immediately
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    const updatedMessages = [...targetConv.messages, userMessage];

    setConversations(prev => prev.map(c => {
      if (c.id === targetConvId) {
        return {
          ...c,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
      }
      return c;
    }));

    // 2. Start title generation if this is the first user query
    if (targetConv.messages.length === 0) {
      generateTitleForConversation(targetConvId, text);
    }

    setIsGenerating(true);

    try {
      // Format messages in standard chat history for API
      const formattedMessages = updatedMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      // Setup custom instruction if Deep Think is active
      const customInstruction = deepThink 
        ? `${systemInstruction}\n\nCRITICAL MANDATE: You MUST perform an extremely deep, step-by-step thinking process wrapped inside a <thought>...</thought> block BEFORE you write the final response. In this block, show detailed logical steps, analyze potential options, outline your hypotheses, and refine your logic. After the closing </thought> tag, present your final response to the user elegantly formatted in Markdown.`
        : systemInstruction;

      // 3. Initiate SSE connection
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedMessages,
          systemInstruction: customInstruction,
          model: model
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errorMessage = "";
        try {
          const errorData = JSON.parse(errText);
          errorMessage = errorData.error;
        } catch {
          // If the error is HTML/text (like a 502/503 from Cloud Run), strip tags or use a clean portion
          if (errText.includes("<html>")) {
            errorMessage = "Server experienced a temporary gateway or proxy issue. Please wait 5 seconds and try again.";
          } else {
            errorMessage = errText || "Failed to fetch response from GenAI backend. Please check your network or API secrets.";
          }
        }
        throw new Error(errorMessage || "Failed to fetch response from GenAI backend. Please check your network or API secrets.");
      }

      // 4. Ingest and stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("No response stream body reader available");
      }

      const botMessageId = generateId();
      let accumulatedText = "";

      // Add a placeholder message for the assistant
      setConversations(prev => prev.map(c => {
        if (c.id === targetConvId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                id: botMessageId,
                role: 'model',
                text: "",
                timestamp: Date.now()
              }
            ],
            updatedAt: Date.now()
          };
        }
        return c;
      }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        
        // Split chunk into separate SSE payload statements
        const sseLines = rawChunk.split("\n");
        for (const line of sseLines) {
          if (line.startsWith("data: ")) {
            const dataString = line.slice(6).trim();
            if (dataString === "[DONE]") {
              break;
            }
            try {
              const data = JSON.parse(dataString);
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                accumulatedText += data.text;
                // Incremental update of state
                setConversations(prev => prev.map(c => {
                  if (c.id === targetConvId) {
                    return {
                      ...c,
                      messages: c.messages.map(m => m.id === botMessageId ? { ...m, text: accumulatedText } : m),
                      updatedAt: Date.now()
                    };
                  }
                  return c;
                }));
              }
            } catch (e) {}
          }
        }
      }

    } catch (err: any) {
      console.error("Communication failure:", err);
      setError(err.message || "An unexpected error occurred while communicating with the server.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#0A100E] text-[#F4F1EC]">
      {/* Sidebar - Manage History */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => {
          setActiveId(id);
          setError(null);
        }}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Chat Area */}
      <ChatArea
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        onSelectPrompt={(prompt) => handleSendMessage(prompt, true)}
        systemInstruction={systemInstruction}
        setSystemInstruction={setSystemInstruction}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        error={error}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
