import React from 'react';
// FIX: Import ChatSession to correctly type the chat objects.
import { ChatHistory, User, ChatSession } from '../types';
import { GeminiAvatarIcon, PlusIcon, HomeIcon, SettingsIcon, LogoutIcon, TrashIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatHistory;
  currentChatId: string | null;
  onNewChat: () => void;
  onSwitchChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onOpenSettings: () => void;
}


export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  user,
  onLogout,
  onNavigateHome,
  onOpenSettings,
}) => {
  // FIX: Cast the result of Object.values to ChatSession[] to provide correct types for sorting and mapping.
  const sortedChats = (Object.values(chats) as ChatSession[]).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-[var(--surface)] backdrop-blur-xl border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <GeminiAvatarIcon className="w-8 h-8"/>
            <h1 className="text-lg font-bold">Torex AI</h1>
          </div>
        </div>
        
        <div className="p-2">
            <button
                onClick={onNavigateHome}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-black/5 transition-colors text-left"
            >
                <HomeIcon className="w-5 h-5" />
                Ana Ekran
            </button>
            <button
                onClick={onNewChat}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-black/5 transition-colors text-left"
            >
                <PlusIcon className="w-5 h-5" />
                Yeni Sohbet
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {sortedChats.map(chat => (
            <div key={chat.id} className="group relative">
                <button
                onClick={() => onSwitchChat(chat.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors ${
                    currentChatId === chat.id ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]' : 'hover:bg-black/5'
                }`}
                >
                {chat.title}
                </button>
                <button 
                    onClick={() => onDeleteChat(chat.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--icon-color)] hover:text-red-500 rounded-full hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete chat"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)] space-y-4">
          <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-black/5 transition-colors text-left"
            >
                <SettingsIcon className="w-5 h-5" />
                Ayarlar
          </button>
          {user && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2 overflow-hidden">
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                </div>
              </div>
              <button onClick={onLogout} title="Logout" className="p-2 text-[var(--icon-color)] hover:text-red-500 rounded-full hover:bg-red-500/10">
                <LogoutIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};