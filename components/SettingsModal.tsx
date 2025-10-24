import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, PaletteIcon, ModelIcon, VoiceIcon, ProfileIcon } from './icons';
import { AVAILABLE_MODELS } from '../constants';
import { User } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSetTheme: (themeId: string) => void;
  currentModel: string;
  onSetModel: (modelId: string) => void;
  currentColor: string;
  onSetColor: (colorHue: string) => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
}

type Tab = 'profile' | 'appearance' | 'model' | 'voice';

const colorOptions = [
    { name: 'Mavi', hue: '210' },
    { name: 'Yeşil', hue: '145' },
    { name: 'Mor', hue: '260' },
    { name: 'Turuncu', hue: '30' },
    { name: 'Kırmızı', hue: '0' },
];

const themeOptions = [
    { id: 'light', name: 'Açık' },
    { id: 'dark', name: 'Koyu' },
    { id: 'latte', name: 'Latte' },
    { id: 'midnight', name: 'Gece Mavisi' },
    { id: 'forest', name: 'Orman' },
    { id: 'sky', name: 'Gökyüzü' },
];


export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    currentTheme, 
    onSetTheme,
    currentModel,
    onSetModel,
    currentColor,
    onSetColor,
    user,
    onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Form state for user profile
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [department, setDepartment] = useState(user?.department || 'Yok');
  const [picture, setPicture] = useState(user?.picture || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Resets form state if modal is reopened or user changes
  useEffect(() => {
    if (user && isOpen) {
        setName(user.name);
        setGrade(user.grade);
        setDepartment(user.department || 'Yok');
        setPicture(user.picture);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

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

  const handleProfileSave = () => {
    if (!name.trim() || !grade) {
        alert('İsim ve Sınıf alanları boş bırakılamaz.');
        return;
    }
    const showDepartment = ['11. Sınıf', '12. Sınıf', 'Mezun'].includes(grade);
    onUpdateUser({
        ...user,
        name: name.trim(),
        grade,
        picture,
        department: showDepartment ? department : 'Yok',
    });
    alert('Profil bilgilerin güncellendi.');
  };
  
  const renderContent = () => {
    switch(activeTab) {
        case 'profile':
            const grades = ["İlkokul", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Mezun"];
            const departments = ['Sayısal', 'Eşit Ağırlık', 'Sözel', 'Dil'];
            const showDepartmentSelector = ['11. Sınıf', '12. Sınıf', 'Mezun'].includes(grade);
            return (
                <div className="animate-fade-in-slide-up space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-2">Profil Bilgileri</h3>
                        <p className="text-sm text-[var(--on-surface-variant)] mb-4">
                            Bu bilgiler, yapay zekanın sana daha uygun cevaplar vermesine yardımcı olur.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img src={picture} alt="Profile" className="w-16 h-16 rounded-full object-cover"/>
                            <div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm font-medium border border-[var(--outline)] rounded-md hover:bg-black/5">
                                    Fotoğrafı Değiştir
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="profile-name" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Adın Soyadın</label>
                            <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"/>
                        </div>
                        <div>
                            <label htmlFor="profile-grade" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Sınıf</label>
                            <select id="profile-grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]">
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        {showDepartmentSelector && (
                            <div>
                                <label htmlFor="profile-dept" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Alan</label>
                                <select id="profile-dept" value={department} onChange={(e) => setDepartment(e.target.value as any)} className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]">
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button onClick={handleProfileSave} className="px-4 py-2 text-sm font-medium text-[var(--user-message-text)] bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]">
                            Değişiklikleri Kaydet
                        </button>
                    </div>
                </div>
            );
        case 'appearance':
            return (
                <div className="animate-fade-in-slide-up">
                    <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-4">Arayüz Teması</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {themeOptions.map((theme) => (
                            <ThemeOptionButton
                                key={theme.id}
                                theme={theme}
                                currentTheme={currentTheme}
                                onClick={() => onSetTheme(theme.id)}
                            />
                        ))}
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-4 mt-8">Vurgu Rengi</h3>
                    <div className="flex flex-wrap gap-4">
                        {colorOptions.map(color => (
                            <ColorButton key={color.hue} color={color} currentColor={currentColor} onClick={() => onSetColor(color.hue)} />
                        ))}
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-4 mt-8">Dil</h3>
                    <div className="opacity-50 cursor-not-allowed">
                        <label htmlFor="language-select" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Uygulama Dili</label>
                        <select id="language-select" defaultValue="tr" disabled className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)] disabled:cursor-not-allowed">
                            <option value="tr">Türkçe</option>
                            <option value="en">English (Yakında)</option>
                        </select>
                         <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                            Çoklu dil desteği gelecekte eklenecektir.
                        </p>
                    </div>
                </div>
            );
        case 'model':
            return (
                <div className="animate-fade-in-slide-up">
                    <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-2">Yapay Zeka Modeli</h3>
                    <p className="text-sm text-[var(--on-surface-variant)] mb-4">
                        Farklı görevler için optimize edilmiş modeller arasında geçiş yapın. Gemini Flash çoğu görev için hızlı ve verimlidir.
                    </p>
                    <div className="space-y-2">
                        {AVAILABLE_MODELS.map(model => (
                            <ModelOption 
                                key={model.id}
                                name={model.name}
                                modelId={model.id}
                                currentModel={currentModel}
                                onSelect={() => onSetModel(model.id)}
                            />
                        ))}
                    </div>
                </div>
            );
        case 'voice':
             return (
                <div className="animate-fade-in-slide-up">
                    <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-2">Ses ve Metin Ayarları</h3>
                    <p className="text-sm text-[var(--on-surface-variant)]">
                        Sesli okuma ve konuşma tanıma ile ilgili ayarlar gelecekte bu ekrana eklenecektir.
                    </p>
                </div>
            );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--surface-modal)] backdrop-blur-xl border border-[var(--outline-variant)] rounded-2xl shadow-2xl w-full max-w-3xl m-4 flex flex-col md:flex-row h-[90vh] max-h-[600px] animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-full md:w-60 p-4 border-b md:border-b-0 md:border-r border-[var(--outline-variant)] flex-shrink-0">
            <h2 className="text-xl font-bold mb-6 px-3">Ayarlar</h2>
            <nav className="flex flex-row md:flex-col gap-1">
                <TabButton label="Profil" icon={<ProfileIcon className="w-5 h-5"/>} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                <TabButton label="Görünüm" icon={<PaletteIcon className="w-5 h-5"/>} isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                <TabButton label="Model Ayarları" icon={<ModelIcon className="w-5 h-5"/>} isActive={activeTab === 'model'} onClick={() => setActiveTab('model')} />
                <TabButton label="Ses Ayarları" icon={<VoiceIcon className="w-5 h-5"/>} isActive={activeTab === 'voice'} onClick={() => setActiveTab('voice')} />
            </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto relative">
             <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors z-10">
                <CloseIcon className="w-6 h-6 text-[var(--on-surface-variant)]" />
            </button>
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void}> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'bg-[var(--primary-color)] text-[var(--primary-color-text)]' : 'hover:bg-black/5 text-[var(--on-surface-variant)]'
    }`}>
        {icon}
        <span>{label}</span>
    </button>
);

const ThemeOptionButton: React.FC<{
  theme: { id: string; name: string; };
  currentTheme: string;
  onClick: () => void;
}> = ({ theme, currentTheme, onClick }) => {
  const isActive = currentTheme === theme.id;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group text-center">
        <div className={`w-full h-24 rounded-lg p-2 transition-all duration-200 border-2 ${isActive ? 'border-[var(--primary-color)]' : 'border-[var(--outline-variant)] group-hover:border-[var(--outline)]'}`}>
            <div className={`theme-${theme.id} w-full h-full rounded-md flex flex-col p-2 bg-[var(--background)] overflow-hidden`}>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[var(--primary-color)]"></div>
                    <div className="flex-1 h-2 rounded-sm bg-[var(--on-surface-variant)] opacity-50"></div>
                </div>
                <div className="flex-1 mt-2 p-2 bg-[var(--surface)] rounded-sm">
                    <div className="h-2 w-3/4 rounded-sm bg-[var(--on-surface)] opacity-70"></div>
                     <div className="h-2 w-1/2 rounded-sm bg-[var(--on-surface-variant)] opacity-50 mt-1"></div>
                </div>
            </div>
        </div>
        <span className={`text-sm font-medium mt-1 ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--on-surface-variant)]'}`}>{theme.name}</span>
    </button>
  );
};


const ModelOption: React.FC<{name: string, modelId: string, currentModel: string, onSelect: () => void}> = ({ name, modelId, currentModel, onSelect }) => (
    <button onClick={onSelect} className={`w-full text-left p-3 rounded-lg flex items-center gap-4 border transition-colors ${currentModel === modelId ? 'border-[var(--primary-color)]/50 bg-[var(--primary-color)]/10' : 'border-transparent hover:bg-black/5'}`}>
        <div className="w-5 h-5 rounded-full border-2 border-[var(--outline)] flex items-center justify-center flex-shrink-0">
            {currentModel === modelId && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)]"></div>}
        </div>
        <span className="font-medium text-sm text-[var(--on-surface)]">{name}</span>
    </button>
);

const ColorButton: React.FC<{color: {name: string, hue: string}, currentColor: string, onClick: () => void}> = ({ color, currentColor, onClick }) => {
    const isActive = currentColor === color.hue;
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group" title={color.name}>
            <div 
                className={`w-10 h-10 rounded-full transition-all duration-200 border-2 flex items-center justify-center text-white ${isActive ? 'border-[var(--primary-color)] scale-110' : 'border-transparent group-hover:scale-110'}`}
                style={{ backgroundColor: `hsl(${color.hue}, 85%, 55%)` }}
            >
              {isActive && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
            </div>
            <span className={`text-xs font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--on-surface-variant)]'}`}>{color.name}</span>
        </button>
    );
};