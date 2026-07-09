import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Pin, 
  Search, 
  Edit2, 
  Check, 
  X, 
  ChevronLeft,
  Sparkles,
  MessageCircleOff
} from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onTogglePin,
  onRenameConversation,
  onClearAll,
  isSidebarOpen,
  setIsSidebarOpen
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Sort: Pinned first, then by updatedAt desc
  const filteredConversations = conversations
    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Main Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-[#101815] border-r border-white/5 transition-transform duration-300 transform md:translate-x-0 md:static shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#182320] border border-white/5 text-[#2EAD79]">
              <Sparkles size={16} />
            </div>
            <span className="serif-title font-semibold text-[#F4F1EC] text-lg tracking-tight">OmniMind</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-xl hover:bg-[#182320] text-[#B8B2AA] cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-6 pb-4">
          <button
            onClick={() => {
              onNewConversation();
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-[#182320] hover:bg-[#101815] hover:scale-102 hover:shadow-lg active:scale-98 text-[#F4F1EC] border border-white/5 rounded-2xl font-medium text-xs tracking-wider uppercase transition-all duration-250 cursor-pointer"
          >
            <Plus size={15} className="text-[#2EAD79]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#7E7871]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#0A100E] border border-white/5 rounded-xl text-xs text-[#F4F1EC] placeholder-[#7E7871] focus:outline-hidden focus:border-[#2EAD79]/50 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#7E7871] hover:text-[#F4F1EC] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Header */}
        <div className="text-[10px] uppercase tracking-widest text-[#7E7871] font-semibold px-6 mb-3">
          Conversation History
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((c) => {
              const isActive = c.id === activeId;
              const isEditing = c.id === editingId;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectConversation(c.id);
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
                    }
                  }}
                  className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#182320] border border-white/5 text-[#F4F1EC]' 
                      : 'hover:bg-[#182320]/40 text-[#B8B2AA] hover:text-[#F4F1EC]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MessageSquare size={15} className={`shrink-0 ${isActive ? 'text-[#2EAD79]' : 'text-[#7E7871] group-hover:text-[#B8B2AA]'}`} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(c.id, e);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[#0A100E] px-1.5 py-0.5 border border-[#2EAD79] rounded text-xs text-[#F4F1EC] focus:outline-hidden"
                      />
                    ) : (
                      <span className="text-xs font-medium truncate pr-6 tracking-wide">
                        {c.title}
                      </span>
                    )}
                  </div>

                  {/* Actions Container */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-inherit pl-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => saveRename(c.id, e)}
                          className="p-1 rounded text-[#53C28B] hover:bg-[#0A100E] cursor-pointer"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="p-1 rounded text-[#E26868] hover:bg-[#0A100E] cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Pin Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(c.id);
                          }}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            c.isPinned 
                              ? 'text-[#D7A657] hover:bg-[#0A100E]' 
                              : 'text-[#7E7871] hover:text-[#D7A657] hover:bg-[#0A100E]'
                          }`}
                          title={c.isPinned ? "Unpin chat" : "Pin chat"}
                        >
                          <Pin size={12} className={c.isPinned ? "fill-[#D7A657]" : ""} />
                        </button>
 
                        {/* Rename Button */}
                        <button
                          onClick={(e) => startEditing(c.id, c.title, e)}
                          className="p-1 rounded text-[#7E7871] hover:text-[#2EAD79] hover:bg-[#0A100E] transition-colors cursor-pointer"
                          title="Rename chat"
                        >
                          <Edit2 size={12} />
                        </button>
 
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(c.id);
                          }}
                          className="p-1 rounded text-[#7E7871] hover:text-[#E26868] hover:bg-[#0A100E] transition-colors cursor-pointer"
                          title="Delete chat"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Static Pin Icon (when not hovered) */}
                  {c.isPinned && !isEditing && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 group-hover:hidden text-[#D7A657]">
                      <Pin size={11} className="fill-[#D7A657]" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <MessageCircleOff size={24} className="text-[#7E7871]/40 mb-3" />
              <p className="text-[11px] text-[#7E7871] font-medium uppercase tracking-wider">No conversations</p>
            </div>
          )}
        </div>

        {/* Bottom Actions and Profile */}
        <div className="mt-auto border-t border-white/5 bg-[#101815]">
          <div className="p-4 space-y-3">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all conversation history? This cannot be undone.")) {
                  onClearAll();
                }
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[#E26868] hover:bg-[#E26868]/5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear history</span>
            </button>

            {/* Profile badge styled like the luxury template */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#0A100E]/50 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center text-xs font-bold text-[#F4F1EC] shrink-0 shadow-sm select-none">
                KS
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium text-[#F4F1EC] truncate">kronstudioo@gmail.com</div>
                <div className="text-[9px] text-[#7E7871] font-bold uppercase tracking-widest mt-0.5">Pro Account</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
