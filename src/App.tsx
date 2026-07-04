import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from './store/useAppStore';
import ErrorBoundary from './components/ErrorBoundary';
import TabBar from './components/layout/TabBar';
import LoginPage from './pages/login/LoginPage';
import HomePage from './pages/home/HomePage';
import StudyPage from './pages/study/StudyPage';
import CouplePage from './pages/couple/CouplePage';
import CommunityPage from './pages/community/CommunityPage';
import MessagePage from './pages/message/MessagePage';
import ProfilePage from './pages/profile/ProfilePage';

function AppContent() {
  const { currentTab, isLoggedIn } = useAppStore();

  // 未登录 → 显示登录页
  if (!isLoggedIn) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      <div className="pb-16">
        {currentTab === 'home' && <HomePage />}
        {currentTab === 'study' && <StudyPage />}
        {currentTab === 'couple' && <CouplePage />}
        {currentTab === 'community' && <CommunityPage />}
        {currentTab === 'message' && <MessagePage />}
        {currentTab === 'profile' && <ProfilePage />}
      </div>
      <TabBar />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // 原生环境隐藏 SplashScreen
    if (Capacitor.isNativePlatform()) {
      const hide = async () => {
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide();
        } catch {}
      };
      const t = setTimeout(hide, 800);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
