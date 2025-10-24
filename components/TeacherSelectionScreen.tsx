import React, { useState } from 'react';
import { User, Teacher } from '../types';
import { CreateTeacherModal } from './CreateTeacherModal';
import { TeacherListModal } from './TeacherListModal';
import { BookAnalysisModal } from './BookAnalysisModal';
import { KnowledgeSourceModal } from './KnowledgeSourceModal';
import { LogoutIcon, SettingsIcon, ChatBubbleIcon, MenuIcon, QuizIcon } from './icons';

interface DashboardScreenProps {
  user: User;
  onTeacherSelect: (teacher: Teacher) => void;
  onLogout: () => void;
  onNavigateToPhotoSolve: () => void;
  onStartGeneralChat: () => void;
  onStartBookAnalysis: (details: { publisher: string; bookName: string; grade: string; request: string; }) => void;
  onStartPdfAnalysis: () => void;
  onOpenQuizModal: () => void;
  onOpenSettings: () => void;
  onSidebarToggle: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
    user, 
    onTeacherSelect, 
    onLogout,
    onNavigateToPhotoSolve,
    onStartGeneralChat,
    onStartBookAnalysis,
    onStartPdfAnalysis,
    onOpenQuizModal,
    onOpenSettings,
    onSidebarToggle
}) => {
  const [isTeacherListModalOpen, setIsTeacherListModalOpen] = useState(false);
  const [isCreateTeacherModalOpen, setIsCreateTeacherModalOpen] = useState(false);
  const [isBookAnalysisModalOpen, setIsBookAnalysisModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  const handleSelectTeacher = (teacher: Teacher) => {
    setIsTeacherListModalOpen(false);
    onTeacherSelect(teacher);
  }

  const handleCreateTeacher = (newTeacher: Teacher) => {
    setIsCreateTeacherModalOpen(false);
    // The `useChat` hook will now handle saving the new teacher to local storage
    onTeacherSelect(newTeacher); // Directly start chat with the new teacher
  };

  return (
    <>
      <TeacherListModal
        isOpen={isTeacherListModalOpen}
        onClose={() => setIsTeacherListModalOpen(false)}
        onTeacherSelect={handleSelectTeacher}
        onOpenCreateTeacher={() => {
            setIsTeacherListModalOpen(false);
            setIsCreateTeacherModalOpen(true);
        }}
      />
      <CreateTeacherModal
        isOpen={isCreateTeacherModalOpen}
        onClose={() => setIsCreateTeacherModalOpen(false)}
        onSave={handleCreateTeacher}
      />
      <BookAnalysisModal
        isOpen={isBookAnalysisModalOpen}
        onClose={() => setIsBookAnalysisModalOpen(false)}
        onAnalyze={onStartBookAnalysis}
      />
      <KnowledgeSourceModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
      />


      <div className="flex flex-col flex-1 bg-[var(--background)] text-[var(--on-background)]">
        <header className="flex items-center justify-between p-4 border-b border-[var(--border-color)] sticky top-0 bg-[var(--header-bg)] backdrop-blur-lg z-10">
          <div className="flex items-center gap-2">
            <button onClick={onSidebarToggle} className="p-2 rounded-full hover:bg-black/10">
                <MenuIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-[var(--on-surface-variant)]">{user.grade}{user.department && user.department !== 'Yok' ? ` - ${user.department}` : ''}</p>
            </div>
            <img src={user.picture} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
            <button onClick={onOpenSettings} title="Ayarlar" className="p-2 text-[var(--icon-color)] hover:text-[var(--primary-color)] rounded-full hover:bg-black/5">
                <SettingsIcon className="w-6 h-6" />
            </button>
            <button onClick={onLogout} title="Çıkış Yap" className="p-2 text-[var(--icon-color)] hover:text-red-500 rounded-full hover:bg-red-500/10">
                <LogoutIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-5xl mx-auto w-full text-center">
            
            <h2 className="text-4xl font-bold">Merhaba, {user.name.split(' ')[0]}!</h2>
            <p className="text-lg text-[var(--on-surface-variant)] mt-2">Bugün sana nasıl yardımcı olabilirim?</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 animate-fade-in-slide-up">
                <DashboardCard
                    title="Yapay Zekaya Sor"
                    description="Genel konularda sohbet et, metin oluştur veya bilgi al."
                    icon="chat"
                    onClick={onStartGeneralChat}
                />
                <DashboardCard
                    title="Fotoğrafla Soru Çöz"
                    description="Kameradan veya galeriden bir soru yükle, Torex anında çözsün."
                    icon="camera"
                    onClick={onNavigateToPhotoSolve}
                />
                <DashboardCard
                    title="Uzman Hoca Seç"
                    description="Belirli bir ders veya alan için uzman bir yapay zeka öğretmen seç."
                    icon="teacher"
                    onClick={() => setIsTeacherListModalOpen(true)}
                />
                <DashboardCard
                    title="Kitap Analizi (Web)"
                    description="Belirli bir kitaptan sayfa özeti iste veya soru çözdür."
                    icon="book"
                    onClick={() => setIsBookAnalysisModalOpen(true)}
                />
                 <DashboardCard
                    title="PDF Analizi"
                    description="Kendi PDF dosyanı yükle, belirli sayfalardaki soruları çözdür."
                    icon="pdf"
                    onClick={onStartPdfAnalysis}
                />
                <DashboardCard
                    title="Konu Testi Oluştur"
                    description="Bir ders ve konu seç, yapay zeka sana özel bir test hazırlasın."
                    icon="quiz"
                    onClick={onOpenQuizModal}
                />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

interface DashboardCardProps {
    title: string;
    description: string;
    icon: 'camera' | 'teacher' | 'book' | 'pdf' | 'quiz' | 'knowledge' | 'chat';
    onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, onClick }) => {
    const icons = {
        camera: <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>,
        teacher: <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
        book: <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
        pdf: <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
        quiz: <QuizIcon className="w-7 h-7" />,
        knowledge: <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-.625-6.25a3.75 3.75 0 00-6.25-.625l-6.402 6.401a3.75 3.75 0 000 5.304m7.498-7.498a.75.75 0 011.06 0l3.001 3.001a.75.75 0 11-1.06 1.06l-3.001-3.001a.75.75 0 010-1.06z" /></svg>,
        chat: <ChatBubbleIcon className="w-7 h-7"/>
    }
    
    return (
        <button
            onClick={onClick}
            className="group p-6 bg-[var(--surface)] rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left"
        >
            <div className="rounded-lg w-12 h-12 flex items-center justify-center mb-4 bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                {icons[icon]}
            </div>
            <h3 className="text-xl font-semibold text-[var(--on-surface)]">{title}</h3>
            <p className="text-[var(--on-surface-variant)] mt-1">{description}</p>
        </button>
    );
};