import { useState, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage, ChatHistory, User } from '../types';
import { generateTextStream, generateImage, generateContentWithImageAnnotation } from '../services/geminiService';
import { SYSTEM_INSTRUCTION, DEFAULT_TEXT_MODEL } from '../constants';

const LOCAL_STORAGE_KEY = 'gemini-pro-chat-history';

export const useChat = (user: User | null, model: string) => {
  const [chats, setChats] = useState<ChatHistory>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startNewChat = useCallback((systemInstruction: string = SYSTEM_INSTRUCTION) => {
    const newChatId = `chat_${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: Date.now(),
      systemInstruction: systemInstruction,
    };
    setChats(prevChats => {
        const updatedChats = { ...prevChats, [newChatId]: newChat };
        saveChats(updatedChats, newChatId);
        return updatedChats;
    });
    setCurrentChatId(newChatId);
    return newChatId;
  }, []);

  useEffect(() => {
    const savedChats = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
    
    const lastChatId = localStorage.getItem(`${LOCAL_STORAGE_KEY}_last`);
    if (lastChatId && savedChats && JSON.parse(savedChats)[lastChatId]) {
      setCurrentChatId(lastChatId);
    } else {
        // No action needed, user will be directed to dashboard.
    }
  }, []);
  
  const saveChats = (updatedChats: ChatHistory, activeChatId: string | null) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedChats));
    if (activeChatId) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_last`, activeChatId);
    }
  };
  
  const switchChat = (chatId: string) => {
    if (chats[chatId]) {
      setCurrentChatId(chatId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_last`, chatId);
    }
  };
  
  const deleteChat = (chatId: string) => {
    const updatedChats = { ...chats };
    delete updatedChats[chatId];
    setChats(updatedChats);

    let newCurrentId: string | null = null;
    if (currentChatId === chatId) {
        const remainingChatIds = Object.values(updatedChats).sort((a: ChatSession, b: ChatSession) => b.createdAt - a.createdAt).map((c: ChatSession) => c.id);
        newCurrentId = remainingChatIds.length > 0 ? remainingChatIds[0] : null;
        setCurrentChatId(newCurrentId);
    } else {
        newCurrentId = currentChatId;
    }
    
    saveChats(updatedChats, newCurrentId);
    
    if (newCurrentId === null) {
        // App component will handle this state transition back to dashboard.
    }
  };
  
  const updateChatTitle = (chatId: string, newTitle: string) => {
    if (chats[chatId]) {
      const updatedChats = {
        ...chats,
        [chatId]: {
          ...chats[chatId],
          title: newTitle,
        },
      };
      setChats(updatedChats);
      saveChats(updatedChats, currentChatId);
    }
  };


  const sendMessage = async (text: string, images?: Array<{ base64: string; mimeType: string }>, imageGenConfig?: { aspectRatio: string }, chatId?: string) => {
    const activeChatId = chatId || currentChatId;
    
    if (!activeChatId) {
        console.error("Cannot send message without an active chat.");
        return;
    }
    
    if (isLoading) return;
    
    const isBookAnalysisRequest = text.startsWith("Şu kitabı bul");

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      parts: [{ text }],
      timestamp: Date.now(),
      isBookAnalysis: isBookAnalysisRequest
    };
    if (images && images.length > 0) {
        images.forEach(image => {
             userMessage.parts.push({ imageUrl: `data:${image.mimeType};base64,${image.base64}`});
        });
    }

    const currentChat = chats[activeChatId];
    const systemInstruction = currentChat?.systemInstruction || SYSTEM_INSTRUCTION;
    const currentMessages = currentChat?.messages || [];
    const updatedMessages = [...currentMessages, userMessage];
    
    let chatTitle = currentChat?.title || 'Yeni Sohbet';
    if (currentMessages.length === 0 && text.trim()) {
        chatTitle = text.trim().substring(0, 40);
    }

    const updatedChat = { ...currentChat, title: chatTitle, messages: updatedMessages };
    const updatedChats = { ...chats, [activeChatId]: updatedChat };

    setChats(updatedChats);
    setIsLoading(true);

    try {
        const history = [...currentMessages];

        if (imageGenConfig) {
            const prompt = text.substring(text.indexOf(' ')).trim();
            const imageUrl = await generateImage(prompt, imageGenConfig.aspectRatio);
            const modelMessage: ChatMessage = {
                id: `msg_${Date.now() + 1}`,
                role: 'model',
                parts: [{ text: `"${prompt}" için oluşturulan resim:` }, { imageUrl }],
                timestamp: Date.now(),
                isGeneratedImage: true,
                imagePrompt: text 
            };
            const finalMessages = [...updatedMessages, modelMessage];
            const finalChat = { ...updatedChat, messages: finalMessages };
            const finalChats = { ...chats, [activeChatId]: finalChat };
            setChats(finalChats);
            saveChats(finalChats, activeChatId);
        
        } else if (images && images.length > 0) {
            const responseParts = await generateContentWithImageAnnotation(text, images[0], systemInstruction, history, user);
            const modelMessage: ChatMessage = {
                id: `msg_${Date.now() + 1}`,
                role: 'model',
                parts: responseParts,
                timestamp: Date.now(),
            };
            const finalMessages = [...updatedMessages, modelMessage];
            const finalChat = { ...updatedChat, messages: finalMessages };
            const finalChats = { ...chats, [activeChatId]: finalChat };
            setChats(finalChats);
            saveChats(finalChats, activeChatId);

        } else { // Text only
            const modelMessage: ChatMessage = {
                id: `msg_${Date.now() + 1}`,
                role: 'model',
                parts: [{ text: '' }],
                timestamp: Date.now(),
            };
            
            const stream = generateTextStream(text, history, user, model, systemInstruction, isBookAnalysisRequest);
            let streamedText = '';
            for await (const chunk of stream) {
                streamedText += chunk;
                modelMessage.parts = [{ text: streamedText }];
                setChats(prevChats => ({
                    ...prevChats,
                    [activeChatId]: {
                        ...prevChats[activeChatId],
                        messages: [...updatedMessages, modelMessage],
                    }
                }));
            }
             setChats(prevChats => {
                saveChats(prevChats, activeChatId);
                return prevChats;
             });
        }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
          id: `msg_error_${Date.now()}`,
          role: 'model',
          parts: [{text: 'Bir hata oluştu, lütfen tekrar deneyin.'}],
          timestamp: Date.now()
      };
      setChats(prevChats => {
          const finalChats = {
                ...prevChats,
                [activeChatId]: {
                    ...prevChats[activeChatId],
                    messages: [...updatedMessages, errorMessage],
                }
            };
          saveChats(finalChats, activeChatId);
          return finalChats;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chats,
    currentChatId,
    messages: currentChatId ? chats[currentChatId]?.messages || [] : [],
    isLoading,
    startNewChat,
    switchChat,
    deleteChat,
    updateChatTitle,
    sendMessage,
  };
};