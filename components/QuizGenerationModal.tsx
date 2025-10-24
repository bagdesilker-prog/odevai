import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface QuizGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (details: { subject: string; topic: string; questionCount: number; }) => void;
}

export const QuizGenerationModal: React.FC<QuizGenerationModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!subject.trim() || !topic.trim()) {
      alert('Lütfen ders ve konu alanlarını doldurun.');
      return;
    }
    onGenerate({ subject, topic, questionCount });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-lg p-6 m-4 animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Konu Testi Oluştur</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-6 h-6 text-[var(--icon-color)]" />
          </button>
        </div>
        
        <p className="text-sm text-[var(--on-surface-variant)] mb-6">
            Torex AI'dan istediğin konu hakkında çoktan seçmeli bir test hazırlamasını iste.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Ders
            </label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Örn: Biyoloji"
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Konu
            </label>
            <input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Örn: Hücre ve Organelleri"
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </div>
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Soru Sayısı: <span className="font-bold text-[var(--on-surface)]">{questionCount}</span>
            </label>
            <input
              id="questionCount"
              type="range"
              min="3"
              max="10"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-[var(--surface-container)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--on-surface)] bg-[var(--model-message-bg)] rounded-lg hover:bg-black/5"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-[var(--user-message-text)] bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"
          >
            Test Oluştur ve Başla
          </button>
        </div>
      </div>
    </div>
  );
};