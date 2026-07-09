export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  isPinned?: boolean;
}

export interface SearchFilters {
  query: string;
  pinnedOnly: boolean;
}
