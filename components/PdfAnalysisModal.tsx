import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface PdfAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (details: { file: File; startPage: string; endPage: string; request: string; }) => void;
}

const PDFIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M5.25 2.25a.75.75 0 00-.75.75v18a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75V6.31l-5.06-5.06H5.25zM14.25 18a.75.75 0 01-.75.75H10.5a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM15 13.5H9a.75.75 0 010-1.5h6a.75.75 0 010 1.5zM15 9H9a.75.75 0 010-1.5h6a.75.75 0 010 1.5z" />
        <path d="M14.25 2.25a.75.75 0 000 1.5v2.25h2.25a.75.75 0 000-1.5H15V2.25a.75.75 0 00-.75-.75z" />
    </svg>
);

export const PdfAnalysisModal: React.FC<PdfAnalysisModalProps> = ({ isOpen, onClose, onAnalyze }) => {
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [request, setRequest] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file || !request.trim()) {
      alert('Lütfen bir PDF dosyası seçin ve isteğinizi belirtin.');
      return;
    }
    onAnalyze({ file, startPage, endPage, request });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-lg p-6 m-4 animate-fade-in-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">PDF Analizi ve Soru Çözümü</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-6 h-6 text-[var(--icon-color)]" />
          </button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-2">PDF Dosyası Yükle</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--border-color)] border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <PDFIcon className="mx-auto h-12 w-12 text-[var(--icon-color)]"/>
                        {file ? (
                            <p className="text-sm text-[var(--on-surface)]">{file.name}</p>
                        ) : (
                            <div className="flex text-sm text-[var(--on-surface-variant)]">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] focus-within:outline-none">
                                    <span>Dosya seç</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">veya sürükleyip bırakın</p>
                            </div>
                        )}
                        <p className="text-xs text-[var(--on-surface-variant)] opacity-70">Sadece PDF dosyaları</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startPage" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Başlangıç Sayfası</label>
                    <input type="number" id="startPage" value={startPage} onChange={e => setStartPage(e.target.value)} placeholder="Opsiyonel" className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]" />
                </div>
                 <div>
                    <label htmlFor="endPage" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Bitiş Sayfası</label>
                    <input type="number" id="endPage" value={endPage} onChange={e => setEndPage(e.target.value)} placeholder="Opsiyonel" className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]" />
                </div>
            </div>

            <div>
                <label htmlFor="pdf-request" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">İsteğiniz</label>
                <textarea id="pdf-request" value={request} onChange={e => setRequest(e.target.value)} rows={3} placeholder="Örn: Bu sayfalardaki 5. soruyu çöz. VEYA Bu bölümü özetle." className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)] placeholder-[var(--on-surface-variant)]" />
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--on-surface)] bg-[var(--model-message-bg)] rounded-lg hover:bg-black/5">İptal</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-[var(--user-message-text)] bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">Analiz Et ve Sohbeti Başlat</button>
        </div>
      </div>
    </div>
  );
};