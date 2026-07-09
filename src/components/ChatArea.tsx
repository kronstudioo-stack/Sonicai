import React, { useRef, useEffect, useState } from 'react';
import { 
  Send, 
  Menu, 
  Bot, 
  User, 
  Settings2,
  ChevronDown,
  Sparkles,
  Info,
  Sliders,
  CircleAlert,
  Moon,
  Sun,
  Mic,
  Paperclip,
  X,
  FileText,
  Volume2
} from 'lucide-react';
import { Conversation, Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import WelcomeScreen from './WelcomeScreen';

interface ChatAreaProps {
  conversation: Conversation | null;
  onSendMessage: (text: string, deepThink?: boolean) => void;
  isGenerating: boolean;
  onSelectPrompt: (prompt: string) => void;
  systemInstruction: string;
  setSystemInstruction: (inst: string) => void;
  onOpenSidebar: () => void;
  error: string | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
}

export default function ChatArea({
  conversation,
  onSendMessage,
  isGenerating,
  onSelectPrompt,
  systemInstruction,
  setSystemInstruction,
  onOpenSidebar,
  error,
  theme,
  setTheme
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeModel, setActiveModel] = useState<'Gemini-3.5-Flash' | 'Gemini-1.5-Pro'>('Gemini-3.5-Flash');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDeepThink, setIsDeepThink] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isGenerating) return;
    
    let finalMessage = input.trim();
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => `[Attachment: ${f.name}]`).join(', ');
      finalMessage = `${finalMessage}\n\n${fileNames}`;
    }

    onSendMessage(finalMessage, isDeepThink);
    setInput('');
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Mock voice recording experience
  const handleToggleVoice = () => {
    if (isGenerating) return;
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    setIsRecording(true);
    // Simulate smart transcription after 1.5s
    setTimeout(() => {
      setIsRecording((prev) => {
        if (prev) {
          setInput("Draft a premium, elegant product launch strategy for our next-generation AI platform.");
          return false;
        }
        return false;
      });
    }, 1800);
  };

  // Handle Attachment trigger
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newAttached: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
      newAttached.push({
        id: Math.random().toString(36).substring(7),
        name: f.name,
        size: `${sizeMB} MB`
      });
    }
    setAttachedFiles(prev => [...prev, ...newAttached]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const systemPresets = [
    {
      name: "Default Assistant",
      instruction: "You are a helpful, friendly, and highly intelligent AI chat assistant. Format your replies beautifully using Markdown.",
      desc: "Balanced, helpful, and polite"
    },
    {
      name: "Expert Software Engineer",
      instruction: "You are an expert senior software developer and systems architect. Write extremely clean, robust, and commented code snippets. Think step-by-step and focus on edge cases, efficiency, and design patterns.",
      desc: "Technical, precise, and optimized code"
    },
    {
      name: "Creative Writer",
      instruction: "You are an award-winning creative writer, copywriter, and brainstorming partner. Write engagingly with elegant prose, vivid metaphors, and dynamic structure.",
      desc: "Inspiring, vivid, and conceptual"
    },
    {
      name: "Clear Explainer",
      instruction: "You are a highly skilled educator. Explain complex technical, mathematical, or scientific concepts using simple analogies, clear terminology, and highly structured, easy-to-follow breakdowns.",
      desc: "Simple breakdowns and analogies"
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1B1A18] text-[#F4F1EC] relative overflow-hidden">
      
      {/* Hidden file selector */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        multiple
      />

      {/* Top Floating Header with Blur Glass Effect */}
      <header className="flex items-center justify-between h-16 px-6 md:px-10 border-b border-white/5 shrink-0 bg-[#1B1A18]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-[#2A2724] text-[#B8B2AA] cursor-pointer"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <h2 className="serif-title font-medium text-base md:text-lg text-[#F4F1EC] truncate max-w-[150px] sm:max-w-xs">
              {conversation ? conversation.title : "New Conversation"}
            </h2>

            {/* Model Selector Rounded Pill */}
            <div className="relative">
              <button 
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A2724] text-[10px] font-semibold text-[#B8B2AA] border border-white/5 hover:border-[#D97A5A]/30 transition-all cursor-pointer shadow-xs select-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#53C28B]"></div>
                <span>{activeModel === 'Gemini-3.5-Flash' ? 'Gemini 3.5 Flash' : 'Gemini 1.5 Pro'}</span>
                <ChevronDown size={10} className="opacity-60" />
              </button>

              {showModelDropdown && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-[#242220] border border-white/5 p-2 shadow-xl z-30 animate-fade-in-up">
                  <button 
                    onClick={() => { setActiveModel('Gemini-3.5-Flash'); setShowModelDropdown(false); }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-0.5 cursor-pointer transition-colors ${activeModel === 'Gemini-3.5-Flash' ? 'bg-[#2A2724] text-[#F4F1EC]' : 'text-[#B8B2AA] hover:bg-[#2A2724]/40'}`}
                  >
                    <span className="font-semibold text-white">Gemini 3.5 Flash</span>
                    <span className="text-[9px] opacity-65">Ultra-fast, responsive multimodal AI. Latest optimized release.</span>
                  </button>
                  <button 
                    onClick={() => { setActiveModel('Gemini-1.5-Pro'); setShowModelDropdown(false); }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-0.5 mt-1 cursor-pointer transition-colors ${activeModel === 'Gemini-1.5-Pro' ? 'bg-[#2A2724] text-[#F4F1EC]' : 'text-[#B8B2AA] hover:bg-[#2A2724]/40'}`}
                  >
                    <span className="font-semibold text-white">Gemini 1.5 Pro</span>
                    <span className="text-[9px] opacity-65">State-of-the-art reasoning for complex multi-step coding and analysis.</span>
                  </button>
                </div>
              )}
            </div>

            {/* Deep Think Pill Toggle */}
            <button
              onClick={() => setIsDeepThink(!isDeepThink)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs select-none border ${
                isDeepThink
                  ? 'bg-[#D97A5A]/15 text-[#E2C39B] border-[#D97A5A]/35 hover:bg-[#D97A5A]/25'
                  : 'bg-[#2A2724] text-[#7E7871] border-white/5 hover:text-[#B8B2AA]'
              }`}
            >
              <Sliders size={10} className={`${isDeepThink ? 'animate-pulse text-[#D97A5A]' : ''}`} />
              <span>Deep Think</span>
              <div className={`w-1.5 h-1.5 rounded-full ${isDeepThink ? 'bg-[#D97A5A] animate-pulse' : 'bg-[#7E7871]/40'}`}></div>
            </button>
          </div>
        </div>

        {/* Right Header buttons (SaaS aesthetic minimal icons only) */}
        <div className="flex items-center gap-2">
          {/* Settings / Config Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showSettings 
                ? 'bg-[#2A2724] border-[#D97A5A]/40 text-[#D97A5A]' 
                : 'bg-transparent border-transparent text-[#B8B2AA] hover:bg-[#2A2724] hover:text-[#F4F1EC]'
            }`}
            title="Configure AI Persona"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        {/* Settings Panel styled with Premium dark theme */}
        {showSettings && (
          <div className="absolute top-0 inset-x-0 bg-[#242220] border-b border-white/5 z-20 p-6 shadow-xl transition-all duration-250 animate-slide-down">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2 text-[#F4F1EC]">
                  <Sliders size={15} className="text-[#D97A5A]" />
                  <span className="serif-title font-medium text-sm">Configure AI Persona</span>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-xs text-[#B8B2AA] hover:text-[#F4F1EC] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Presets Column */}
                <div className="md:col-span-1 space-y-2 border-r border-transparent md:border-white/5 pr-0 md:pr-4">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#7E7871] mb-2">Presets</span>
                  {systemPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setSystemInstruction(preset.instruction)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border cursor-pointer ${
                        systemInstruction === preset.instruction
                          ? 'bg-[#2A2724] border-[#D97A5A]/35 text-[#F4F1EC] font-medium shadow-xs'
                          : 'bg-[#1B1A18]/40 border-white/5 text-[#B8B2AA] hover:bg-[#2A2724]/50'
                      }`}
                    >
                      <span className="block font-semibold">{preset.name}</span>
                      <span className="block text-[9px] text-[#7E7871] font-normal line-clamp-1 mt-0.5">{preset.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Textarea Column */}
                <div className="md:col-span-2 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#7E7871] mb-2">Custom instructions</span>
                    <textarea
                      value={systemInstruction}
                      onChange={(e) => setSystemInstruction(e.target.value)}
                      placeholder="Instruct the AI on how to act, talk, or format replies..."
                      rows={4}
                      className="w-full p-3 bg-[#1B1A18] border border-white/5 rounded-2xl text-xs text-[#F4F1EC] placeholder-[#7E7871] focus:outline-hidden focus:border-[#D97A5A]/40 resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-[#7E7871] flex items-center gap-1.5">
                    <Info size={12} className="text-[#D7A657]" />
                    <span>These instructions alter how the model generates explanations and formats responses.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Message Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-8 md:px-12 space-y-10 scrollbar-thin"
        >
          {error && (
            <div className="max-w-2xl mx-auto p-4.5 rounded-2xl border border-[#E26868]/20 bg-[#E26868]/5 text-[#F4F1EC] text-sm flex gap-3 items-start animate-fade-in-up">
              <CircleAlert size={18} className="shrink-0 text-[#E26868] mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5 text-white">System Notice</span>
                <p className="text-xs text-[#B8B2AA] leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!conversation || conversation.messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={onSelectPrompt} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-12">
              {conversation.messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div 
                    key={m.id} 
                    className={`flex gap-6 md:gap-8 animate-fade-in-up ${isUser ? 'justify-end flex-row-reverse' : 'justify-start'}`}
                  >
                    {/* Perfect Outlined Premium Avatars */}
                    {isUser ? (
                      <div className="w-10 h-10 rounded-2xl bg-[#D97A5A] text-white flex-shrink-0 flex items-center justify-center font-bold text-xs select-none shadow-sm shadow-[#D97A5A]/15">
                        KS
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-[#D97A5A] flex-shrink-0 flex items-center justify-center">
                        <Bot size={18} />
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
                      {/* Name/Time Banner */}
                      <span className="text-[9px] text-[#7E7871] font-bold uppercase tracking-widest px-1">
                        {isUser ? 'You' : 'OmniMind'} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Bubble content - User has soft card; AI is elegantly clean and unbubbled */}
                      {isUser ? (
                        <div className="bg-[#2A2724] border border-white/5 rounded-3xl rounded-tr-sm p-5 text-[14.5px] text-[#F4F1EC] leading-relaxed shadow-sm whitespace-pre-wrap break-words text-left">
                          {m.text}
                        </div>
                      ) : (
                        <div className="text-[14.5px] text-[#B8B2AA] leading-relaxed w-full text-left font-sans prose prose-invert">
                          {(() => {
                            const { thought, answer } = extractThought(m.text);
                            const isThinking = m.text.includes('<thought>') && !m.text.includes('</thought>');
                            return (
                              <>
                                <ThoughtBlock thought={thought} isThinking={isThinking} />
                                {answer ? <MarkdownRenderer content={answer} /> : !thought ? <MarkdownRenderer content={m.text} /> : null}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Real-time Streaming Generator Bubble */}
              {isGenerating && (
                <div className="flex gap-6 md:gap-8 justify-start animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-[#D97A5A] flex-shrink-0 flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div className="flex flex-col items-start max-w-[80%] space-y-2">
                    <span className="text-[9px] text-[#7E7871] font-bold uppercase tracking-widest px-1">
                      OmniMind • streaming...
                    </span>
                    <div className="bg-[#2A2724]/40 border border-white/5 px-5 py-3.5 rounded-3xl rounded-tl-sm flex items-center justify-center min-w-[70px]">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#D97A5A] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-[#D97A5A] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-[#D97A5A] rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating rounded chat area input with inner shadows & accessory triggers */}
        <div className="p-6 md:p-8 shrink-0 bg-gradient-to-t from-[#1B1A18] via-[#1B1A18] to-transparent sticky bottom-0">
          <div className="max-w-3xl mx-auto">
            
            {/* Attachment preview panel */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 px-2">
                {attachedFiles.map(file => (
                  <div 
                    key={file.id} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A2724] border border-white/5 text-[11px] text-[#F4F1EC] shadow-xs animate-fade-in-up"
                  >
                    <FileText size={12} className="text-[#D97A5A]" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <span className="text-[#7E7871] text-[9px]">({file.size})</span>
                    <button 
                      type="button"
                      onClick={() => removeAttachedFile(file.id)}
                      className="text-[#7E7871] hover:text-[#E26868] p-0.5 rounded-full cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Simulated listening pulsing wave */}
            {isRecording && (
              <div className="flex items-center gap-3.5 px-4 py-2.5 mb-3 rounded-2xl bg-[#D97A5A]/10 border border-[#D97A5A]/20 text-xs text-[#D97A5A] justify-center animate-pulse">
                <Volume2 size={14} className="animate-bounce" />
                <span className="font-semibold tracking-wide uppercase text-[10px]">OmniMind Voice listening ... Speak now</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative flex items-center bg-[#2A2724] rounded-3xl border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] hover:border-white/10 transition-all p-1.5">
              
              {/* Left accessories: Attachment paperclip */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || isRecording}
                className="p-3 text-[#B8B2AA] hover:text-[#F4F1EC] hover:bg-[#1B1A18]/40 rounded-2xl transition-colors cursor-pointer select-none"
                title="Attach Files"
              >
                <Paperclip size={18} />
              </button>

              {/* Dynamic prompt input */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={isGenerating ? "OmniMind is synthesizing..." : "Ask anything..."}
                disabled={isGenerating}
                className="w-full bg-transparent text-[#F4F1EC] text-sm py-3.5 px-3 focus:outline-hidden resize-none scrollbar-none max-h-36 leading-normal min-h-[48px] placeholder-[#7E7871]"
                style={{ height: 'auto' }}
              />

              {/* Right accessories: Voice input */}
              <button
                type="button"
                onClick={handleToggleVoice}
                disabled={isGenerating}
                className={`p-3 rounded-2xl transition-all cursor-pointer select-none mr-1 ${
                  isRecording 
                    ? 'bg-[#D97A5A] text-white scale-110 shadow-lg shadow-[#D97A5A]/20' 
                    : 'text-[#B8B2AA] hover:text-[#F4F1EC] hover:bg-[#1B1A18]/40'
                }`}
                title="Voice Input"
              >
                <Mic size={18} className={isRecording ? "animate-pulse" : ""} />
              </button>

              {/* Send trigger */}
              <button
                type="submit"
                disabled={(!input.trim() && attachedFiles.length === 0) || isGenerating}
                className={`p-3 rounded-2xl transition-all duration-250 cursor-pointer ${
                  (input.trim() || attachedFiles.length > 0) && !isGenerating
                    ? 'bg-[#D97A5A] text-white hover:bg-[#E58B6C] hover:scale-105 active:scale-95'
                    : 'bg-transparent text-[#7E7871]/40'
                }`}
              >
                <Send size={16} />
              </button>
            </form>
            
            <div className="text-center mt-4 text-[10px] text-[#7E7871] font-bold uppercase tracking-widest select-none">
              OmniMind AI can make mistakes. Check important info.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Extract thinking tags `<thought>...</thought>` from stream content
function extractThought(text: string): { thought: string; answer: string } {
  if (!text) return { thought: '', answer: '' };
  
  const startTag = '<thought>';
  const endTag = '</thought>';
  const startIdx = text.indexOf(startTag);
  
  if (startIdx !== -1) {
    const endIdx = text.indexOf(endTag, startIdx + startTag.length);
    if (endIdx !== -1) {
      const thought = text.substring(startIdx + startTag.length, endIdx).trim();
      const answer = (text.substring(0, startIdx) + text.substring(endIdx + endTag.length)).trim();
      return { thought, answer };
    } else {
      const thought = text.substring(startIdx + startTag.length).trim();
      return { thought, answer: '' };
    }
  }
  
  return { thought: '', answer: text };
}

// Collapsible thinking indicator and container
interface ThoughtBlockProps {
  thought: string;
  isThinking?: boolean;
}

function ThoughtBlock({ thought, isThinking }: ThoughtBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!thought) return null;

  return (
    <div className="mb-6 rounded-2xl border border-white/5 bg-[#252220]/40 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#252220]/80 hover:bg-[#2D2A27] active:bg-[#34312E] transition-colors text-left select-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-[#D97A5A]/10 border border-[#D97A5A]/20 text-[#D97A5A]">
            <Sparkles size={12} className={isThinking ? "animate-spin" : ""} style={{ animationDuration: '4s' }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2C39B]">Thinking Process</span>
        </div>
        <div className="flex items-center gap-2">
          {isThinking ? (
            <span className="text-[9px] text-[#D97A5A] font-bold tracking-widest uppercase animate-pulse">Thinking...</span>
          ) : (
            <span className="text-[9px] text-[#7E7871] font-bold tracking-widest uppercase">Verified Logic</span>
          )}
          <ChevronDown
            size={12}
            className={`text-[#7E7871] transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}
          />
        </div>
      </button>
      {!isCollapsed && (
        <div className="px-5 pb-4 pt-3 border-t border-white/5 text-[12px] text-[#B8B2AA]/80 font-mono leading-relaxed whitespace-pre-wrap select-text max-h-80 overflow-y-auto scrollbar-none bg-[#1F1D1B]/30">
          {thought}
        </div>
      )}
    </div>
  );
}
