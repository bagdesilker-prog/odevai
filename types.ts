
export interface User {
  name: string;
  picture: string; // This can be a URL or a data URI for local uploads
  grade: string;
  department?: 'Sayısal' | 'Eşit Ağırlık' | 'Sözel' | 'Dil' | 'Yok';
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  description: string;
  imageUrl: string;
  systemInstruction: string;
  category: 'Lise' | 'Ortaokul' | 'İlkokul' | 'Rehberlik & Koçluk' | 'Özel';
}

export interface MessagePart {
  text?: string;
  imageUrl?: string; 
  isGenerating?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp: number;
  isGeneratedImage?: boolean; // Flag for special rendering of generated images
  imagePrompt?: string; // Store the original prompt for regeneration
  isBookAnalysis?: boolean; // Flag for special loading UI
}

export interface ChatSession {
  id:string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  systemInstruction: string;
}

export type ChatHistory = Record<string, ChatSession>;

export interface MebBook {
  id: string;
  level: 'İlkokul' | 'Ortaokul' | 'Lise';
  grade: string;
  subject: string;
  title: string;
  url: string;
}
