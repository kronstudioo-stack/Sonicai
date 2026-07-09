import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  font?: 'sans' | 'serif' | 'mono';
}

export default function MarkdownRenderer({ content, font = 'serif' }: MarkdownRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!content) return null;

  // Split content by triple-backtick code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  // Map chosen font value to its respective utility class
  const fontClass = font === 'serif' ? 'font-serif' : font === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className={`space-y-4 text-[15.5px] leading-relaxed text-[#F4F1EC]/90 ${fontClass}`}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : 'code';
          const code = match ? match[2] : part.slice(3, -3);
          const blockId = `code-${index}`;

          return (
            <div key={blockId} className="my-5 overflow-hidden rounded-2xl border border-white/5 bg-[#1F1D1B] text-[#F4F1EC] font-mono text-[13px] shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-between bg-[#262320] px-4.5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#B8B2AA] border-b border-white/5">
                <span className="text-[#D97A5A]">{lang || 'text'}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(code.trim(), blockId)}
                  className="flex items-center gap-1.5 hover:text-[#F4F1EC] transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedId === blockId ? (
                    <>
                      <Check size={12} className="text-[#53C28B]" />
                      <span className="text-[#53C28B]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-5 overflow-x-auto leading-relaxed text-left max-w-full font-mono bg-[#1F1D1B] text-[#E2C39B] scrollbar-none">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          // Parse regular text, handling bold, lists, and inline code
          const lines = part.split('\n');
          return (
            <div key={index} className="space-y-3">
              {lines.map((line, lineIdx) => {
                const trimmedLine = line.trim();
                
                // Bullet list item
                if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                  const content = parseInlineMarkdown(trimmedLine.slice(2));
                  return (
                    <ul key={lineIdx} className="list-disc pl-6 my-1.5 space-y-1.5 text-[#F4F1EC]/90">
                      <li>{content}</li>
                    </ul>
                  );
                }

                // Numbered list item
                const numMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
                if (numMatch) {
                  const content = parseInlineMarkdown(numMatch[2]);
                  return (
                    <ol key={lineIdx} className="list-decimal pl-6 my-1.5 space-y-1.5 text-[#F4F1EC]/90" start={parseInt(numMatch[1])}>
                      <li>{content}</li>
                    </ol>
                  );
                }

                // Header 3
                if (trimmedLine.startsWith('### ')) {
                  return (
                    <h4 key={lineIdx} className="text-[17px] font-bold text-[#F4F1EC] mt-5 mb-2 tracking-tight">
                      {parseInlineMarkdown(trimmedLine.slice(4))}
                    </h4>
                  );
                }

                // Header 2
                if (trimmedLine.startsWith('## ')) {
                  return (
                    <h3 key={lineIdx} className="text-[19px] font-extrabold text-[#F4F1EC] mt-6 mb-3 border-b border-white/5 pb-1.5 tracking-tight">
                      {parseInlineMarkdown(trimmedLine.slice(3))}
                    </h3>
                  );
                }

                // Header 1
                if (trimmedLine.startsWith('# ')) {
                  return (
                    <h2 key={lineIdx} className="text-[23px] font-black text-white mt-7 mb-4 tracking-tight">
                      {parseInlineMarkdown(trimmedLine.slice(2))}
                    </h2>
                  );
                }

                // Empty line
                if (trimmedLine === '') {
                  return <div key={lineIdx} className="h-2" />;
                }

                // Normal paragraph line
                return (
                  <p key={lineIdx} className="text-[#F4F1EC]/90">
                    {parseInlineMarkdown(line)}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

// Simple parser for inline elements like bold, italic, and inline code
function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex to split by bold (**), italic (*), and inline code (`)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-[#E2C39B]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 mx-0.5 rounded-lg bg-[#2A2724] border border-white/5 font-mono text-[13px] text-[#D97A5A] font-medium">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
