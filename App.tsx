import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { OnboardingScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/TeacherSelectionScreen';
import { useChat } from './hooks/useChat';
import { User, Teacher } from './types';
import { SYSTEM_INSTRUCTION, GENERAL_CHAT_INSTRUCTION, DEFAULT_TEXT_MODEL } from './constants';
import { PdfAnalysisModal } from './components/PdfAnalysisModal';
import { QuizGenerationModal } from './components/QuizGenerationModal';
import { SplashScreen } from './components/SplashScreen';
import { SettingsModal } from './components/SettingsModal';
import { PhotoSolveScreen } from './components/PhotoSolveScreen';


type AppState = 'onboarding' | 'dashboard' | 'chat' | 'photoSolve';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [appTheme, setAppTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) return savedTheme;
        return 'light'; // Default to light theme
    }
    return 'light';
  });
  const [appColor, setAppColor] = useState<string>(() => localStorage.getItem('appColor') || '210');
  const [model, setModel] = useState<string>(() => {
    return localStorage.getItem('selectedModel') || DEFAULT_TEXT_MODEL;
  });

  const {
    chats,
    currentChatId,
    messages,
    isLoading,
    startNewChat,
    switchChat,
    deleteChat,
    sendMessage,
    updateChatTitle,
  } = useChat(user, model);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [appState, setAppState] = useState<AppState>('onboarding');

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000); // Show splash screen for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('chat_user');
      if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setAppState('dashboard');
      } else {
          setAppState('onboarding');
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('chat_user');
        setAppState('onboarding');
    }
  }, []);

  useEffect(() => {
    if (appState === 'chat' && !currentChatId && Object.keys(chats).length === 0) {
      setAppState('dashboard');
    }
  }, [currentChatId, chats, appState]);
  
  useEffect(() => {
    const root = document.documentElement;
    // Clean up old theme classes
    for (const className of [...root.classList]) {
        if (className.startsWith('theme-')) {
            root.classList.remove(className);
        }
    }
    root.classList.add(`theme-${appTheme}`);
    localStorage.setItem('appTheme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-hue', appColor);
    localStorage.setItem('appColor', appColor);
  }, [appColor]);

  useEffect(() => {
    localStorage.setItem('selectedModel', model);
  }, [model]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOnboardingComplete = (completedUser: User) => {
    localStorage.setItem('chat_user', JSON.stringify(completedUser));
    setUser(completedUser);
    setAppState('dashboard');
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('chat_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_user');
    localStorage.removeItem('gemini-pro-chat-history');
    localStorage.removeItem('gemini-pro-chat-history_last');
    setUser(null);
    setAppState('onboarding');
    window.location.reload(); 
  };
  
  const navigateToDashboard = () => {
    setAppState('dashboard');
  };
  
  const navigateToPhotoSolve = () => {
    setAppState('photoSolve');
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    startNewChat(teacher.systemInstruction);
    setAppState('chat');
  };

  const handleStartPhotoSolve = (details: { text: string; image: { base64: string; mimeType: string } }) => {
    const chatId = startNewChat(SYSTEM_INSTRUCTION);
    sendMessage(details.text, [details.image], undefined, chatId);
    setAppState('chat');
  };
  
  const handleStartGeneralChat = () => {
    startNewChat(GENERAL_CHAT_INSTRUCTION);
    setAppState('chat');
  };
  
  const handleStartBookAnalysis = (details: { publisher: string; bookName: string; grade: string; request: string; }) => {
    const chatId = startNewChat(SYSTEM_INSTRUCTION);
    const prompt = `Şu kitabı bul ve isteğimi yerine getir: Yayınevi: "${details.publisher}", Kitap Adı: "${details.bookName}", Sınıf: "${details.grade}". İsteğim: "${details.request}".`;
    sendMessage(prompt, undefined, undefined, chatId);
    setAppState('chat');
  };

  const handleStartQuiz = (details: { subject: string; topic: string; questionCount: number; }) => {
    const chatId = startNewChat(SYSTEM_INSTRUCTION);
    const prompt = `${user?.grade || ''} seviyesinde, "${details.subject}" dersinin "${details.topic}" konusuyla ilgili ${details.questionCount} adet çoktan seçmeli (4 şıklı) soru ve cevap anahtarı hazırla. Sorular, konuyu ne kadar anladığımı ölçmeli. Cevap anahtarını testin sonuna ekle.`;
    sendMessage(prompt, undefined, undefined, chatId);
    setAppState('chat');
    setIsQuizModalOpen(false);
  };
  
  const handleStartPdfAnalysis = async (details: { file: File; startPage: string; endPage: string; request: string; }) => {
    alert('PDF işleme özelliği şu anda tam fonksiyonlu değildir ve geliştirme aşamasındadır. Yüklenen PDF içeriği modele gönderilmeyecektir. Bunun yerine, isteğiniz ve dosya bilgileriyle bir sohbet başlatılacaktır.');
    
    const chatId = startNewChat(SYSTEM_INSTRUCTION);
    
    const pageInfo = (details.startPage || details.endPage) 
      ? ` (belirtilen sayfa aralığı: ${details.startPage || 'başlangıç'}-${details.endPage || 'son'})`
      : '';
        
    const fullPrompt = `Yüklediğim "${details.file.name}" adlı PDF dosyasındaki${pageInfo} içerikle ilgili isteğim şu: "${details.request}".`;
    
    sendMessage(fullPrompt, undefined, undefined, chatId);
    setAppState('chat');
  };

  const handleUpdateChatTitle = (chatId: string, newTitle: string) => {
    updateChatTitle(chatId, newTitle);
  };
  
  const handleRegenerateImage = (prompt: string, config: any) => {
    sendMessage(prompt, undefined, config);
  };

  const renderPageContent = () => {
    switch (appState) {
      case 'onboarding':
        return <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} />;
      case 'dashboard':
        return user ? (
          <DashboardScreen 
            user={user} 
            onTeacherSelect={handleTeacherSelect}
            onLogout={handleLogout}
            onNavigateToPhotoSolve={navigateToPhotoSolve}
            onStartGeneralChat={handleStartGeneralChat}
            onStartBookAnalysis={handleStartBookAnalysis}
            onStartPdfAnalysis={() => setIsPdfModalOpen(true)}
            onOpenQuizModal={() => setIsQuizModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onSidebarToggle={handleSidebarToggle}
          />
        ) : <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} />;
      case 'photoSolve':
        return (
            <PhotoSolveScreen 
                onBack={navigateToDashboard}
                onSubmit={handleStartPhotoSolve}
                isLoading={isLoading}
            />
        );
      case 'chat':
        if (!currentChatId || !user) {
            return user ? <DashboardScreen user={user} onTeacherSelect={handleTeacherSelect} onLogout={handleLogout} onNavigateToPhotoSolve={navigateToPhotoSolve} onStartGeneralChat={handleStartGeneralChat} onStartBookAnalysis={handleStartBookAnalysis} onStartPdfAnalysis={() => setIsPdfModalOpen(true)} onOpenQuizModal={() => setIsQuizModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)} onSidebarToggle={handleSidebarToggle}/> : <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} />;
        }
        return (
          <ChatView
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onSidebarToggle={handleSidebarToggle}
            currentChatId={currentChatId}
            chatTitle={currentChatId ? chats[currentChatId]?.title : ''}
            onUpdateChatTitle={handleUpdateChatTitle}
            onRegenerateImage={handleRegenerateImage}
            user={user}
          />
        );
    }
  };

  const showSidebar = (appState === 'dashboard' || appState === 'chat') && !!user;

  return (
    <>
      <PdfAnalysisModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        onAnalyze={handleStartPdfAnalysis} 
      />
      <QuizGenerationModal 
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onGenerate={handleStartQuiz}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentTheme={appTheme}
        onSetTheme={setAppTheme}
        currentModel={model}
        onSetModel={setModel}
        currentColor={appColor}
        onSetColor={setAppColor}
        user={user}
        onUpdateUser={handleUpdateUser}
      />
      
      {showWelcome ? <SplashScreen /> : (
          <div className="flex h-screen text-[var(--on-background)]">
              {showSidebar && (
                  <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    chats={chats}
                    currentChatId={currentChatId}
                    onNewChat={navigateToDashboard}
                    onSwitchChat={(id) => {
                      switchChat(id);
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    onDeleteChat={deleteChat}
                    user={user}
                    onLogout={handleLogout}
                    onNavigateHome={navigateToDashboard}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                  />
              )}
              <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen && showSidebar ? 'lg:ml-64' : ''}`}>
                  {renderPageContent()}
              </main>
          </div>
      )}
    </>
  );
};

export default App;
