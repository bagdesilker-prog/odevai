import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, User } from '../types';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { MenuIcon, GeminiAvatarIcon } from './icons';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, images?: Array<{ base64: string; mimeType: string }>, imageGenConfig?: { aspectRatio: string }) => void;
  onSidebarToggle: () => void;
  currentChatId: string | null;
  chatTitle: string;
  onUpdateChatTitle: (chatId: string, newTitle: string) => void;
  onRegenerateImage: (prompt: string, config: { aspectRatio: string }) => void;
  user: User | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  onSidebarToggle, 
  currentChatId,
  chatTitle,
  onUpdateChatTitle,
  onRegenerateImage,
  user
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(chatTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTitle(chatTitle);
  }, [chatTitle]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
        titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTitleSave = () => {
    if (currentChatId && currentTitle.trim() !== '') {
        onUpdateChatTitle(currentChatId, currentTitle.trim());
    } else {
        setCurrentTitle(chatTitle); // Revert if empty
    }
    setIsEditingTitle(false);
  };
  
  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const lastUserMessage = messages.filter(m => m.role === 'user').pop();

  return (
    <div className="flex flex-col flex-1 bg-[var(--background)] transition-colors">
      <header className="flex items-center p-4 border-b border-[var(--border-color)] sticky top-0 bg-[var(--header-bg)] backdrop-blur-lg z-10">
        <button onClick={onSidebarToggle} className="p-2 mr-2 rounded-full hover:bg-black/10">
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 group flex items-center gap-2">
            {isEditingTitle ? (
                <input
                    ref={titleInputRef}
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="text-lg font-semibold bg-transparent border-b-2 border-[var(--primary-color)] focus:outline-none w-full"
                />
            ) : (
                <h2 className="text-lg font-semibold truncate">{chatTitle}</h2>
            )}
            {!isEditingTitle && currentChatId && (
                <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--icon-color)]"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                </button>
            )}
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 ? (
                <InitialScreen onQuickPrompt={handleQuickPrompt} />
            ) : (
                messages.map((msg, index) => (
                    <Message 
                        key={msg.id} 
                        message={msg} 
                        isStreaming={isLoading && index === messages.length - 1 && msg.role === 'model'}
                        onRegenerateImage={onRegenerateImage}
                    />
                ))
            )}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <Message 
                  message={{ 
                    id: 'loading', 
                    role: 'model', 
                    parts: [{ isGenerating: true }], 
                    timestamp: Date.now(),
                    isBookAnalysis: lastUserMessage?.isBookAnalysis 
                  }} 
                />
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="p-4 bg-transparent sticky bottom-0">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput 
            onSendMessage={onSendMessage} 
            isLoading={isLoading}
          />
        </div>
      </footer>
    </div>
  );
};

const InitialScreen: React.FC<{onQuickPrompt: (prompt: string) => void}> = ({onQuickPrompt}) => (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-slide-up">
        <div className="p-4 bg-[var(--primary-color)] rounded-full inline-block">
            <GeminiAvatarIcon className="w-20 h-20" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--on-surface)] mt-6">Merhaba, ben Torex</h1>
        <p className="text-[var(--on-surface-variant)] mt-2">Bugün sana nasıl yardımcı olabilirim?</p>
        
        <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-lg">
            <QuickPromptButton onClick={() => onQuickPrompt("Bana Yükselme Dönemi'ndeki Osmanlı padişahlarını özetle.")} title="Bir konuyu özetle" />
            <QuickPromptButton onClick={() => onQuickPrompt("Bana sonbahar hakkında bir şiir yaz.")} title="Bir şiir yaz" />
            <QuickPromptButton onClick={() => onQuickPrompt("Malazgirt Meydan Muharebesi'nin sonuçlarını anlat.")} title="Tarihsel bir olayı anlat" />
            <QuickPromptButton onClick={() => onQuickPrompt("Bir metni İngilizce'ye çevir: 'Yapay zeka geleceği şekillendiriyor.'")} title="Metin çevir" />
        </div>
        
        <p className="text-[var(--on-surface-variant)] mt-8 text-sm bg-[var(--model-message-bg)] p-3 rounded-lg">
            Bir resim çizdirmek için <code className="font-mono bg-black/10 px-1.5 py-0.5 rounded">/çiz</code> veya <code className="font-mono bg-black/10 px-1.5 py-0.5 rounded">/draw</code> komutunu kullan.
        </p>
    </div>
);

const QuickPromptButton: React.FC<{onClick: () => void, title: string, description?: string}> = ({onClick, title, description}) => (
    <button onClick={onClick} className="p-4 bg-[var(--surface-container)] rounded-xl text-left hover:bg-black/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
        <p className="font-semibold text-[var(--on-surface)]">{title}</p>
        {description && <p className="text-xs text-[var(--on-surface-variant)]">{description}</p>}
    </button>
);