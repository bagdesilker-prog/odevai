import React, { useState, useRef } from 'react';
import { Teacher } from '../types';
import { CloseIcon } from './icons';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
}

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YjRjZCIgY2xhc3M9IncxMiBoMTIiPjxwYXRoIGQ9Ik01LjI1IDYuNzVjMC0uODI4LjY3Mi0xLjUgMS41LTEuNWgxMGMuODI4IDAgMS41LjY3MiAxLjUgMS41djEwLjVjMCAuODI4LS42NzIgMS41LTEuNSAxLjVIMy43NWMtLjYwOSAwLTEuMTM4LS4zNzQtMS4zNzMtLjkxNmwtMS41LTMuNzVBNTEuNDQzIDUxLjQ0MyAwIDAgMSA1LjI1IDYuNzV6bTQuNSA5YS43NS43NSAwIDEwMCAxLjVoM2EuNzUuNzUgMCAxMDEuNSAwbC43NS0uNzVhLjc1Ljc1IDAgMCAwLTEuMDYtMS4wNkwxMiAxMy40NGwtLjcxLS43MWEuNzUuNzUgMCAwMC0xLjA2IDEuMDZ2LjAwMXpNOC4yNSA4LjYyNWEuNzUuNzUgMCAxMDAtMS41Ljc1Ljc1IDAgMDAwIDEuNXoiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zIDMuNzVBMi4yNSAyLjI1IDAgMDAuNzUgNnYxMy41QTIuMjUgMi4yNSAwIDAwMyAyMS43NWgxOGEyLjI1IDIgLjI1IDAgMDAyLS4yNS0uMTA1bC43NS0uMzc1QS43NS43NSAwIDAwMjEuNzUgMjFoLS42MTRhMzMuNTgxIDMzLjU4MSAwIDAxLTMuMjEtMy4yMThjLTIuMi0yLjItNS4xNDUtMy41MzEtOC4yODItMy41MzFIMi45OThBMi4yNSA0LjA5IDAgMDExLjUgMTAuMjQ5VjYuNzVBMi4yNSAyLjI5IDAgMDAzIDMuNzV6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=';

export const CreateTeacherModal: React.FC<CreateTeacherModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [personality, setPersonality] = useState('');
  const [picture, setPicture] = useState(defaultAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
          // Fix: Defined the missing MAX_HEIGHT constant to prevent a reference error during image resizing.
          const MAX_HEIGHT = 128;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setPicture(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !subject.trim() || !personality.trim()) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    
    const newTeacher: Teacher = {
        id: `custom_${Date.now()}`,
        name: name.trim(),
        subject: subject.trim(),
        description: personality.trim().substring(0, 70) + '...', // Short description from personality
        imageUrl: picture,
        category: 'Özel',
        systemInstruction: `Senin adın ${name.trim()}. ${subject.trim()} alanında bir uzmansın. Kişilik özelliklerin ve iletişim tarzın şu şekilde: "${personality.trim()}". Öğrencilere bu kimlikle yaklaşmalı ve sorularını bu uzmanlık alanında yanıtlamalısın.`
    };

    onSave(newTeacher);
    // Reset form
    setName('');
    setSubject('');
    setPersonality('');
    setPicture(defaultAvatar);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-lg p-6 m-4 animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Kendi Hocanı Yarat</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-6 h-6 text-[var(--icon-color)]" />
          </button>
        </div>

        <div className="space-y-4">
            <div className="flex flex-col items-center">
                <img src={picture} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-4 border-[var(--border-color)] mb-2"/>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-[var(--primary-color)] hover:text-[var(--primary-color-hover)]">
                    Fotoğraf Yükle
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
            </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Hocanın Adı
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Uzmanlık Alanı / Ders
            </label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-container)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            />
          </div>
          <div>
            <label htmlFor="personality" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Kişilik ve Öğretme Tarzı
            </label>
            <textarea
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              rows={3}
              placeholder="Örn: Sabırlı, esprili ve konuları gerçek hayattan örneklerle anlatan biri."
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
            Kaydet ve Başla
          </button>
        </div>
      </div>
    </div>
  );
};