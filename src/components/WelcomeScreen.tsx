import React from 'react';
import { Code, Lightbulb, Map, PenTool, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  const suggestions = [
    {
      icon: <Code size={18} />,
      label: "Code & Debug",
      prompt: "Write an elegant TypeScript implementation of a binary search tree with operations to insert, delete, and find nodes.",
      bgColor: "bg-[#182320]/60",
      textColor: "text-[#F4F1EC]",
      iconColor: "text-[#2EAD79]"
    },
    {
      icon: <Lightbulb size={18} />,
      label: "Explain Concepts",
      prompt: "Explain the concept of quantum computing and superposition using a simple, intuitive analogy for a teenager.",
      bgColor: "bg-[#182320]/60",
      textColor: "text-[#F4F1EC]",
      iconColor: "text-[#2EAD79]"
    },
    {
      icon: <Map size={18} />,
      label: "Plan & Travel",
      prompt: "Create a 3-day itinerary for a weekend getaway in Kyoto, Japan, focusing on scenic historical temples, tea shops, and local culinary highlights.",
      bgColor: "bg-[#182320]/60",
      textColor: "text-[#F4F1EC]",
      iconColor: "text-[#2EAD79]"
    },
    {
      icon: <PenTool size={18} />,
      label: "Write & Draft",
      prompt: "Draft an engaging, professional welcome email for new members joining a community dedicated to sustainable living and green tech.",
      bgColor: "bg-[#182320]/60",
      textColor: "text-[#F4F1EC]",
      iconColor: "text-[#2EAD79]"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto px-6 py-12 md:py-24 text-center select-none animate-fade-in-up">
      {/* Premium Minimal Icon */}
      <div className="mb-8 flex items-center justify-center w-14 h-14 rounded-2xl bg-[#182320] border border-white/5 text-[#2EAD79] shadow-md">
        <Sparkles size={24} className="opacity-80" />
      </div>

      <h1 className="serif-title text-4xl md:text-5xl font-medium text-[#F4F1EC] tracking-tight mb-3">
        How can I assist you today?
      </h1>
      <p className="text-sm md:text-base text-[#B8B2AA] max-w-lg mx-auto mb-14 leading-relaxed font-sans">
        Powered by OmniMind—refined to compose elegant prose, design system layouts, debug complex logic, or simply organize your thoughts.
      </p>

      {/* Suggestion Bento-like Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex flex-col items-start p-6 text-left rounded-2xl border border-white/5 bg-[#182320]/35 hover:bg-[#182320]/80 hover:border-[#2EAD79]/30 transition-all duration-250 group cursor-pointer shadow-xs hover:scale-102"
          >
            <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.iconColor} mb-4 transition-transform group-hover:scale-105 border border-white/5`}>
              {item.icon}
            </div>
            <h3 className="font-semibold text-[#F4F1EC] text-sm mb-1.5 tracking-wide">{item.label}</h3>
            <p className="text-xs text-[#B8B2AA] line-clamp-2 leading-relaxed font-light">
              "{item.prompt}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
