import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, ImageIcon, MicIcon, CloseIcon, StopCircleIcon, CameraIcon } from './icons';
import { useLiveConversation } from '../hooks/useLiveConversation';
import { ImageGenModal } from './ImageGenModal';

interface ChatInputProps {
  onSendMessage: (text: string, images?: Array<{ base64: string; mimeType: string }>, imageGenConfig?: { aspectRatio: string }) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
}) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isImageGenModalOpen, setIsImageGenModalOpen] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening } = useLiveConversation();

  useEffect(() => {
    if (transcript) {
        setText(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmedText = text.trim();
    if ((trimmedText || image) && !isLoading) {
      if (trimmedText.startsWith('/draw ') || trimmedText.startsWith('/çiz ')) {
        const prompt = trimmedText.substring(trimmedText.indexOf(' ') + 1);
        setImageGenPrompt(prompt);
        setIsImageGenModalOpen(true);
        setText('');
      } else {
        onSendMessage(text, image ? [image] : undefined);
        setText('');
        setImage(null);
      }
    }
  };

  const handleImageGeneration = (prompt: string, aspectRatio: string) => {
    onSendMessage(`/çiz ${prompt}`, undefined, { aspectRatio });
    setIsImageGenModalOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage({
          base64: (event.target?.result as string).split(',')[1],
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <>
      <ImageGenModal 
        isOpen={isImageGenModalOpen}
        onClose={() => setIsImageGenModalOpen(false)}
        onGenerate={handleImageGeneration}
        initialPrompt={imageGenPrompt}
      />
      <div className="bg-[var(--surface-container)] backdrop-blur-lg border border-[var(--border-color)] rounded-2xl p-2 flex flex-col focus-within:ring-2 focus-within:ring-[var(--ring-color)] transition-all">
          {image && (
              <div className="relative w-24 h-24 m-2">
                  <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-gray-900/80 rounded-full p-1 text-white hover:bg-gray-700 transition-colors">
                      <CloseIcon className="w-4 h-4" />
                  </button>
              </div>
          )}
          <div className="flex items-end w-full">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-[var(--icon-color)] hover:text-[var(--primary-color)] rounded-full hover:bg-black/5 transition-colors" title="Galeriden Yükle">
                  <ImageIcon className="w-6 h-6" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              
              <button onClick={() => cameraInputRef.current?.click()} className="p-2 text-[var(--icon-color)] hover:text-[var(--primary-color)] rounded-full hover:bg-black/5 transition-colors" title="Kamerayı Aç">
                  <CameraIcon className="w-6 h-6" />
              </button>
              <input type="file" ref={cameraInputRef} onChange={handleImageChange} accept="image/*" capture="environment" className="hidden" />

              <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Dinleniyor..." : "Torex'e bir mesaj gönderin"}
                  className="flex-1 bg-transparent text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] resize-none border-none focus:ring-0 px-3 py-2 text-base max-h-52"
                  rows={1}
                  disabled={isLoading || isListening}
              />
               <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full transition-colors ${
                      isListening ? 'text-red-500 bg-red-500/20' : 'text-[var(--icon-color)] hover:text-[var(--primary-color)] hover:bg-black/5'
                  }`}
              >
                  {isListening ? <StopCircleIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
              </button>
              <button onClick={handleSend} disabled={(!text.trim() && !image) || isLoading} className="p-2 text-white bg-[var(--primary-color)] rounded-full disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:cursor-not-allowed enabled:hover:bg-[var(--primary-color-hover)] transition-colors ml-2">
                  <SendIcon className="w-6 h-6" />
              </button>
          </div>
      </div>
    </>
  );
};