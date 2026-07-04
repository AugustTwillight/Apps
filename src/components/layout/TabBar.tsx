import { useAppStore } from '../../store/useAppStore';
import type { TabItem, TabType } from '../../types';

const tabs: TabItem[] = [
  { key: 'home', icon: '🏠', activeIcon: '🏡', label: '首页' },
  { key: 'study', icon: '📖', activeIcon: '📚', label: '自习室' },
  { key: 'couple', icon: '💑', activeIcon: '💕', label: '情侣' },
  { key: 'community', icon: '🌐', activeIcon: '🌍', label: '社区' },
  { key: 'message', icon: '💬', activeIcon: '💌', label: '消息' },
  { key: 'profile', icon: '👤', activeIcon: '😎', label: '我的' },
];

export default function TabBar() {
  const { currentTab, setTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {tabs.map((tab) => {
          const active = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[52px] transition-all duration-200 ${
                active ? 'scale-110' : 'opacity-50'
              }`}
            >
              <span className="text-xl leading-none">{active ? tab.activeIcon : tab.icon}</span>
              <span className={`text-[10px] mt-0.5 font-medium ${active ? 'text-primary-600' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
