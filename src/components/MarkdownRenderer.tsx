import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!content) return null;

  // Split content by triple-backtick code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : 'code';
          const code = match ? match[2] : part.slice(3, -3);
          const blockId = `code-${index}`;

          return (
            <div key={blockId} className="my-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-[#222] bg-[#111] text-gray-200 font-mono text-sm shadow-sm">
              <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-950 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#222]">
                <span className="uppercase tracking-wider font-semibold text-[10px] text-gray-600 dark:text-gray-300">{lang || 'text'}</span>
                <button
                  onClick={() => copyToClipboard(code.trim(), blockId)}
                  className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedId === blockId ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto leading-relaxed text-left max-w-full font-mono bg-gray-50 dark:bg-[#111] text-gray-800 dark:text-indigo-300">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          // Parse regular text, handling bold, lists, and inline code
          const lines = part.split('\n');
          return (
            <div key={index} className="space-y-2">
              {lines.map((line, lineIdx) => {
                const trimmedLine = line.trim();
                
                // Bullet list item
                if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                  const content = parseInlineMarkdown(trimmedLine.slice(2));
                  return (
                    <ul key={lineIdx} className="list-disc pl-5 my-1 space-y-1">
                      <li className="text-gray-700 dark:text-gray-300">{content}</li>
                    </ul>
                  );
                }

                // Numbered list item
                const numMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
                if (numMatch) {
                  const content = parseInlineMarkdown(numMatch[2]);
                  return (
                    <ol key={lineIdx} className="list-decimal pl-5 my-1 space-y-1" start={parseInt(numMatch[1])}>
                      <li className="text-gray-700 dark:text-gray-300">{content}</li>
                    </ol>
                  );
                }

                // Header 3
                if (trimmedLine.startsWith('### ')) {
                  return (
                    <h4 key={lineIdx} className="text-[16px] font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
                      {parseInlineMarkdown(trimmedLine.slice(4))}
                    </h4>
                  );
                }

                // Header 2
                if (trimmedLine.startsWith('## ')) {
                  return (
                    <h3 key={lineIdx} className="text-[18px] font-bold text-gray-900 dark:text-gray-100 mt-5 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
                      {parseInlineMarkdown(trimmedLine.slice(3))}
                    </h3>
                  );
                }

                // Header 1
                if (trimmedLine.startsWith('# ')) {
                  return (
                    <h2 key={lineIdx} className="text-[22px] font-extrabold text-gray-900 dark:text-gray-100 mt-6 mb-3">
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
                  <p key={lineIdx} className="text-gray-700 dark:text-gray-300">
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
        <strong key={index} className="font-semibold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-gray-800 dark:text-gray-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 font-mono text-[13px] text-rose-600 dark:text-rose-400">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
