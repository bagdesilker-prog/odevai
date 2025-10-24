import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, aspectRatio: string) => void;
  initialPrompt: string;
}

const aspectRatios = [
  { label: 'Kare (1:1)', value: '1:1' },
  { label: 'Dikey (3:4)', value: '3:4' },
  { label: 'Yatay (4:3)', value: '4:3' },
  { label: 'Dikey Geniş (9:16)', value: '9:16' },
  { label: 'Geniş Ekran (16:9)', value: '16:9' },
];

export const ImageGenModal: React.FC<ImageGenModalProps> = ({ isOpen, onClose, onGenerate, initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, aspectRatio);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-lg p-6 m-4 animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Resim Oluşturma</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-6 h-6 text-[var(--icon-color)]" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              İstek (Prompt)
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </div>
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              En-Boy Oranı
            </label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            >
              {aspectRatios.map((ratio) => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--model-message-bg)] rounded-lg hover:bg-black/5"
          >
            İptal
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm font-medium text-[var(--user-message-text)] bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  );
};