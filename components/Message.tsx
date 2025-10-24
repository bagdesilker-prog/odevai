import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { playText } from '../services/elevenLabsService';
import { UserAvatarIcon, GeminiAvatarIcon, SpeakerIcon, CopyIcon } from './icons';

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerateImage?: (prompt: string, config: { aspectRatio: string }) => void;
}

const BlinkingCursor = () => <span className="inline-block w-2 h-4 bg-[var(--primary-color)] animate-blink ml-1 -mb-1"></span>;

export const Message: React.FC<MessageProps> = ({ message, isStreaming, onRegenerateImage }) => {
  const { role, parts, isGeneratedImage, imagePrompt, isBookAnalysis } = message;
  const isUser = role === 'user';
  const combinedText = parts.map(p => p.text).filter(Boolean).join('\n');

  const handleCopy = () => {
    if (combinedText) {
      navigator.clipboard.writeText(combinedText);
    }
  };

  const handleSpeak = async () => {
    if (combinedText) {
      await playText(combinedText);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerateImage && imagePrompt) {
        // Assuming aspect ratio is stored or defaulted. For now, we'll default to 1:1
        // A more robust solution would store the original config in the message object.
        onRegenerateImage(imagePrompt, { aspectRatio: '1:1' });
    }
  };

  const handleDownload = (imageUrl: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `torex-ai-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  return (
    <div className={`flex w-full my-6 animate-fade-in-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--model-message-bg)] border border-white/10 mt-5">
                {isUser ? <UserAvatarIcon className="w-5 h-5 text-[var(--icon-color)]" /> : <GeminiAvatarIcon className="w-8 h-8"/>}
            </div>
            <div className={`group ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {!parts.some(p => p.isGenerating) && (
                  <div className="font-bold text-[var(--on-surface)] mb-1">{isUser ? 'Siz' : 'Torex'}</div>
                )}
                <div className={`inline-block rounded-xl p-3 ${isUser ? 'bg-[var(--user-message-bg)] text-[var(--user-message-text)]' : 'bg-[var(--model-message-bg)] text-[var(--model-message-text)]'}`}>
                    <div className="prose prose-sm max-w-none text-left prose-p:text-[var(--model-message-text)] prose-strong:text-[var(--model-message-text)]">
                        {parts.map((part, index) => {
                            if (part.isGenerating) {
                                return isBookAnalysis 
                                    ? <BookAnalysisLoadingIndicator key={index} />
                                    : <LoadingIndicator key={index} isUser={isUser}/>;
                            }
                            if (part.imageUrl) {
                                return (
                                  <div key={index} className="flex flex-col items-center">
                                    <img src={part.imageUrl} alt="Chat content" className="mt-2 rounded-lg max-w-sm" />
                                    {isGeneratedImage && (
                                      <div className="flex gap-2 mt-2">
                                        <button onClick={handleRegenerate} className="text-xs px-3 py-1 rounded-full bg-black/10 hover:bg-black/20">Tekrar Oluştur</button>
                                        <button onClick={() => handleDownload(part.imageUrl!)} className="text-xs px-3 py-1 rounded-full bg-black/10 hover:bg-black/20">İndir</button>
                                      </div>
                                    )}
                                  </div>
                                );
                            }
                            if (part.text) {
                                return (
                                    <div key={index} className="inline">
                                        <div className="inline" dangerouslySetInnerHTML={{ __html: part.text.replace(/\n/g, '<br />') }}></div>
                                        {isStreaming && <BlinkingCursor />}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
                {!isUser && combinedText && !parts.some(p => p.isGenerating) && !isStreaming && (
                    <div className={`mt-2 flex items-center gap-2 transition-opacity ${isUser ? 'justify-end' : ''} opacity-0 group-hover:opacity-100`}>
                        <button onClick={handleCopy} className="p-1.5 text-[var(--icon-color)] rounded-full hover:bg-black/10 hover:text-[var(--on-surface)]" title="Kopyala">
                            <CopyIcon className="w-4 h-4" />
                        </button>
                        <button onClick={handleSpeak} className="p-1.5 text-[var(--icon-color)] rounded-full hover:bg-black/10 hover:text-[var(--on-surface)]" title="Dinle">
                            <SpeakerIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const LoadingIndicator: React.FC<{ isUser: boolean }> = ({ isUser }) => (
    <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isUser ? 'bg-white/70' : 'bg-[var(--primary-color)]'} animate-pulse [animation-delay:-0.3s]`}></div>
        <div className={`w-2 h-2 rounded-full ${isUser ? 'bg-white/70' : 'bg-[var(--primary-color)]'} animate-pulse [animation-delay:-0.15s]`}></div>
        <div className={`w-2 h-2 rounded-full ${isUser ? 'bg-white/70' : 'bg-[var(--primary-color)]'} animate-pulse`}></div>
    </div>
);

const BookAnalysisLoadingIndicator: React.FC = () => {
    const steps = [
      "Kitap bilgileri alınıyor...",
      "İnternet kaynakları taranıyor...",
      "Kitap içeriğine erişiliyor...",
      "İlgili sayfa analiz ediliyor...",
      "Cevap hazırlanıyor...",
    ];
    const [currentStep, setCurrentStep] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);
      return () => clearInterval(interval);
    }, [steps.length]);
  
    return (
      <div className="flex flex-col items-start space-y-2 text-sm">
        {steps.map((step, index) => (
          <div key={step} className={`flex items-center gap-2 transition-opacity duration-500 ${index <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
            {index < currentStep ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-[var(--primary-color)] animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
            )}
            <span>{step}</span>
          </div>
        ))}
      </div>
    );
  };