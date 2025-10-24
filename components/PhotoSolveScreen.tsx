import React, { useState, useRef } from 'react';
import { CameraIcon, ImageIcon, SendIcon, CloseIcon } from './icons';

interface PhotoSolveScreenProps {
  onBack: () => void;
  onSubmit: (details: { text: string; image: { base64: string; mimeType: string } }) => void;
  isLoading: boolean;
}

export const PhotoSolveScreen: React.FC<PhotoSolveScreenProps> = ({ onBack, onSubmit, isLoading }) => {
  const [image, setImage] = useState<{ base64: string; mimeType: string; url: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImage({
          url: dataUrl,
          base64: dataUrl.split(',')[1],
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
  };

  const handleSubmit = () => {
    if (image && !isLoading) {
      onSubmit({
        image: { base64: image.base64, mimeType: image.mimeType },
        text: prompt.trim() || 'Bu resimdeki soruyu çöz.',
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] animate-fade-in-slide-up">
      <header className="flex items-center p-4 border-b border-[var(--border-color)] justify-between">
        <h1 className="text-xl font-semibold">Fotoğrafla Soru Çöz</h1>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10">
          <CloseIcon className="w-6 h-6 text-[var(--icon-color)]" />
        </button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-[var(--surface-container)]">
        <div className="w-full max-w-lg">
            {!image ? (
                <div className="w-full bg-[var(--surface)] rounded-2xl shadow-xl p-8 text-center transition-all duration-300 animate-fade-in-slide-up">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-24 w-24 text-[var(--icon-color)] opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    <h2 className="mt-4 text-2xl font-bold text-[var(--on-surface)]">Soru Fotoğrafını Yükle</h2>
                    <p className="mt-1 text-md text-[var(--on-surface-variant)]">Çözülmesini istediğin sorunun fotoğrafını çek veya galeriden seç.</p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => cameraInputRef.current?.click()} className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-color)] text-[var(--user-message-text)] font-bold rounded-lg hover:bg-[var(--primary-color-hover)] transition-all transform hover:scale-105">
                            <CameraIcon className="w-6 h-6"/>
                            <span>Kamera ile Çek</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-lg hover:bg-[var(--outline-variant)] transition-colors">
                           <ImageIcon className="w-6 h-6"/>
                           <span>Galeriden Seç</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        <input type="file" ref={cameraInputRef} onChange={handleImageChange} accept="image/*" capture="environment" className="hidden" />
                    </div>
                </div>
            ) : (
                 <div className="w-full bg-[var(--surface)] rounded-2xl shadow-xl p-6 transition-all duration-300 animate-fade-in-slide-up">
                    <div className="relative w-full mb-4">
                        <img src={image.url} alt="Soru Önizlemesi" className="rounded-xl object-contain max-h-[60vh] w-full" />
                        <button onClick={() => setImage(null)} className="absolute -top-3 -right-3 bg-black/70 text-white rounded-full p-1.5 hover:bg-black shadow-lg">
                             <CloseIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="w-full flex items-center bg-[var(--surface-container)] rounded-xl p-2 border border-[var(--border-color)] focus-within:ring-2 focus-within:ring-[var(--ring-color)]">
                        <input 
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ek bir not veya soru ekle (isteğe bağlı)"
                            className="flex-1 bg-transparent focus:ring-0 border-none placeholder-[var(--on-surface-variant)] text-[var(--on-surface)]"
                        />
                        <button onClick={handleSubmit} disabled={isLoading} className="p-2 text-[var(--user-message-text)] bg-[var(--primary-color)] rounded-full disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] enabled:hover:bg-[var(--primary-color-hover)] transition-colors">
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <SendIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};