import React, { useState, useRef } from 'react';
import { User } from '../types';
import { CameraIcon } from './icons';

interface OnboardingScreenProps {
  onOnboardingComplete: (user: User) => void;
}

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzQzNDc0ZSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [picture, setPicture] = useState<string>(defaultAvatar);
  const [grade, setGrade] = useState('');
  const [department, setDepartment] = useState<'Sayısal' | 'Eşit Ağırlık' | 'Sözel' | 'Dil' | 'Yok'>('Yok');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.src = result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 128;
          const MAX_HEIGHT = 128;
          let width = img.width;
          let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          setPicture(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (step === 1 && !name.trim()) {
      setError('Lütfen adını gir.');
      return;
    }
    if (step === 2 && !grade.trim()) {
      setError('Lütfen sınıfını seç.');
      return;
    }
    setError('');
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (!name || !grade) return;
    const finalDepartment = ['11. Sınıf', '12. Sınıf', 'Mezun'].includes(grade) ? department : 'Yok';
    onOnboardingComplete({ name, picture, grade, department: finalDepartment });
  };

  const showDepartmentStep = ['11. Sınıf', '12. Sınıf', 'Mezun'].includes(grade);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">Profilini Oluştur</h2>
            <p className="text-[var(--on-surface-variant)] mb-8">Seni daha iyi tanımamız için bilgilerini gir.</p>
            
            <div className="relative w-32 h-32 mx-auto mb-6">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
              {picture === defaultAvatar ? (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full h-full rounded-full border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--icon-color)] hover:bg-black/5 hover:border-[var(--primary-color)] transition-all"
                  aria-label="Fotoğraf Yükle"
                >
                   <img src={picture} alt="Profile" className="w-1/2 h-1/2 opacity-50"/>
                  <span className="text-xs mt-1">Fotoğraf Ekle</span>
                </button>
              ) : (
                <>
                  <img src={picture} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-[var(--surface-container)] shadow-md"/>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute bottom-0 right-0 bg-[var(--primary-color)] text-white rounded-full p-2 hover:bg-[var(--primary-color-hover)] transition-transform duration-200 hover:scale-110 shadow-lg"
                    aria-label="Fotoğrafı değiştir"
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="w-full">
              <label htmlFor="name-input" className="sr-only">Adın Soyadın</label>
              <input 
                id="name-input"
                type="text" 
                placeholder="Adın Soyadın" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full text-center text-lg px-3 py-3 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)] transition-shadow" 
                required
              />
            </div>
          </>
        );
      case 2:
        const grades = ["İlkokul", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Mezun"];
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">Eğitim Seviyen</h2>
            <p className="text-[var(--on-surface-variant)] mb-6">Sana daha iyi yardımcı olabilmemiz için sınıfını seç.</p>
            <div className="grid grid-cols-2 gap-3">
              {grades.map(g => (
                <button key={g} onClick={() => setGrade(g)} className={`p-3 rounded-lg text-sm font-semibold transition-colors ${grade === g ? 'bg-[var(--primary-color)] text-[var(--user-message-text)]' : 'bg-[var(--model-message-bg)] hover:bg-black/5'}`}>{g}</button>
              ))}
            </div>
          </>
        );
      case 3:
        if (!showDepartmentStep) {
          handleSubmit();
          return null;
        }
        const departments = ['Sayısal', 'Eşit Ağırlık', 'Sözel', 'Dil'];
        return (
          <>
            <h2 className="text-2xl font-bold mb-2">Alanını Seç</h2>
            <p className="text-[var(--on-surface-variant)] mb-6">İçerikleri alanına göre özelleştirelim.</p>
            <div className="grid grid-cols-2 gap-3">
              {departments.map(d => (
                <button key={d} onClick={() => setDepartment(d as any)} className={`p-3 rounded-lg font-semibold transition-colors ${department === d ? 'bg-[var(--primary-color)] text-[var(--user-message-text)]' : 'bg-[var(--model-message-bg)] hover:bg-black/5'}`}>{d}</button>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const finalStep = showDepartmentStep ? 3 : 2;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)] p-4">
      <div className="text-center p-8 bg-[var(--surface)] rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-slide-up">
        <h1 className="text-3xl font-bold text-[var(--primary-color)]">Torex AI'ya Hoş Geldin!</h1>
        <div className="mt-8 text-left min-h-[320px]">
          {renderStep()}
        </div>
        {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}
        <div className="mt-6 flex items-center justify-between">
          <button onClick={prevStep} disabled={step === 1} className="px-6 py-2 text-sm font-medium text-[var(--on-surface-variant)] bg-[var(--model-message-bg)] rounded-lg hover:bg-black/5 disabled:opacity-50">Geri</button>
          {step === finalStep ? (
            <button onClick={handleSubmit} className="px-6 py-2 bg-[var(--primary-color)] text-[var(--user-message-text)] font-bold rounded-lg hover:bg-[var(--primary-color-hover)] transition-colors">Başlayalım!</button>
          ) : (
            <button onClick={nextStep} className="px-6 py-2 bg-[var(--primary-color)] text-[var(--user-message-text)] font-bold rounded-lg hover:bg-[var(--primary-color-hover)] transition-colors">İleri</button>
          )}
        </div>
      </div>
    </div>
  );
};