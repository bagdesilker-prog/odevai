import React, { useState } from 'react';
import { CloseIcon } from './icons';
import { publishers } from '../data/publishers';

interface BookAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (details: { publisher: string; bookName: string; grade: string; request: string; }) => void;
}

export const BookAnalysisModal: React.FC<BookAnalysisModalProps> = ({ isOpen, onClose, onAnalyze }) => {
  const [publisher, setPublisher] = useState('');
  const [bookName, setBookName] = useState('');
  const [grade, setGrade] = useState('');
  const [request, setRequest] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!publisher.trim() || !bookName.trim() || !grade.trim() || !request.trim()) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    onAnalyze({ publisher, bookName, grade, request });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-lg p-6 m-4 animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Kitap Analizi ve Soru Çözümü</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-6 h-6 text-[var(--icon-color)]" />
          </button>
        </div>
        
        <p className="text-sm text-[var(--on-surface-variant)] mb-6">
            Torex AI'dan belirli bir ders kitabını internetten bulmasını ve isteğinizi yerine getirmesini isteyin. Lütfen bilgileri eksiksiz doldurun.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Yayınevi
            </label>
            <input
              id="publisher"
              list="publishers-list"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="Örn: SDR Dikey Yayıncılık"
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
            <datalist id="publishers-list">
                {publishers.map(p => <option key={p.name} value={p.name} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="bookName" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Kitap Adı
            </label>
            <input
              id="bookName"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="Örn: Matematik Ders Kitabı"
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Sınıf
            </label>
            <input
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Örn: 11. Sınıf"
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </div>
           <div>
            <label htmlFor="request" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              İsteğiniz
            </label>
            <textarea
              id="request"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={3}
              placeholder="Örn: Sayfa 51'deki 3. soruyu çöz ve açıkla. VEYA Sayfa 70-75 arasını özetle."
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)] placeholder-[var(--on-surface-variant)]"
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
            Analiz Et ve Sohbeti Başlat
          </button>
        </div>
      </div>
    </div>
  );
};