import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';
import { predefinedTeachers } from '../data/teachers';
import { CloseIcon, PlusIcon } from './icons';

interface TeacherListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeacherSelect: (teacher: Teacher) => void;
  onOpenCreateTeacher: () => void;
}

const CUSTOM_TEACHERS_KEY = 'custom_teachers';

type Category = 'Lise' | 'Ortaokul' | 'İlkokul' | 'Rehberlik & Koçluk' | 'Özel';
const categories: Category[] = ['Rehberlik & Koçluk', 'Lise', 'Ortaokul', 'İlkokul', 'Özel'];

export const TeacherListModal: React.FC<TeacherListModalProps> = ({ isOpen, onClose, onTeacherSelect, onOpenCreateTeacher }) => {
  const [activeTab, setActiveTab] = useState<Category>('Rehberlik & Koçluk');
  const [allTeachers, setAllTeachers] = useState<Teacher[]>(predefinedTeachers);

  useEffect(() => {
    if (isOpen) {
      try {
          const savedCustomTeachers = localStorage.getItem(CUSTOM_TEACHERS_KEY);
          if (savedCustomTeachers) {
              setAllTeachers([...predefinedTeachers, ...JSON.parse(savedCustomTeachers)]);
          } else {
              setAllTeachers(predefinedTeachers);
          }
      } catch (e) {
          console.error("Failed to load custom teachers", e);
          setAllTeachers(predefinedTeachers);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  const filteredTeachers = allTeachers.filter(t => t.category === activeTab);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col m-4 animate-fade-in-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)] sticky top-0 bg-[var(--surface)]/80 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold">Uzman Hoca Seç</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
            <CloseIcon className="w-6 h-6 text-[var(--icon-color)]" />
          </button>
        </div>
        
        <div className="border-b border-[var(--border-color)] px-4">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`${
                    activeTab === category
                        ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                        : 'border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:border-gray-300'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    {category}
                </button>
                ))}
            </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredTeachers.map(teacher => (
                    <TeacherCard key={teacher.id} teacher={teacher} onSelect={() => onTeacherSelect(teacher)} />
                ))}
                {activeTab === 'Özel' && (
                    <CreateTeacherCard onClick={onOpenCreateTeacher} />
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

const TeacherCard: React.FC<{teacher: Teacher, onSelect: () => void}> = ({ teacher, onSelect }) => (
    <button onClick={onSelect} className="group flex flex-col items-center text-center p-4 bg-[var(--surface-container)] rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)] focus:ring-[var(--primary-color)]">
        <img src={teacher.imageUrl} alt={teacher.name} className="w-24 h-24 rounded-full object-cover border-4 border-[var(--border-color)] group-hover:border-[var(--primary-color)]/50 transition-colors" />
        <h3 className="mt-4 font-bold text-md">{teacher.name}</h3>
        <p className="text-xs text-[var(--on-surface-variant)] mt-1">{teacher.subject}</p>
    </button>
);

const CreateTeacherCard: React.FC<{onClick: () => void}> = ({ onClick }) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center text-center p-4 bg-[var(--model-message-bg)] border-2 border-dashed border-[var(--border-color)] rounded-2xl hover:border-[var(--primary-color)] hover:bg-black/5 hover:-translate-y-1.5 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)] focus:ring-[var(--primary-color)]">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-black/5 border-4 border-[var(--border-color)] group-hover:border-[var(--primary-color)]/50 transition-colors">
            <PlusIcon className="w-10 h-10 text-[var(--icon-color)] group-hover:text-[var(--primary-color)] transition-colors" />
        </div>
        <h3 className="mt-4 font-bold text-md">Hocanı Yarat</h3>
        <p className="text-xs text-[var(--on-surface-variant)] mt-1">Kendi uzmanını oluştur</p>
    </button>
);