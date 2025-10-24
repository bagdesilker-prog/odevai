import React from 'react';
import { CloseIcon, DatabaseIcon } from './icons';
import { publishers } from '../data/publishers';

interface KnowledgeSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeSourceModal: React.FC<KnowledgeSourceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col m-4 animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)] sticky top-0 bg-[var(--header-bg)] backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <DatabaseIcon className="w-6 h-6 text-[var(--primary-color)]" />
            <h2 className="text-xl font-bold text-[var(--on-surface)]">Bilgi Kaynakları</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-6 h-6 text-[var(--on-surface-variant)]" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            <p className="text-md text-[var(--on-surface-variant)] mb-6 bg-[var(--primary-color)]/10 p-4 rounded-lg">
                Torex AI, web arama özelliği sayesinde aşağıdaki yayınevleri de dahil olmak üzere internette bulunan <strong>tüm ders kitaplarına</strong> erişebilir ve içlerindeki soruları çözebilir. Liste, sıkça aranan bazı popüler yayınevlerini içermektedir.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {publishers.sort((a,b) => a.name.localeCompare(b.name)).map(pub => (
                    <li key={pub.name} className="flex items-center gap-2 p-2 rounded-md hover:bg-black/5">
                        <span className="text-[var(--primary-color)]">&#8226;</span>
                        <span className="text-[var(--on-surface)]">{pub.name}</span>
                    </li>
                ))}
            </ul>
        </div>

      </div>
    </div>
  );
};