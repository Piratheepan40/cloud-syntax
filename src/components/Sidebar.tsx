import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'inventory';
  onTabChange: (tab: 'dashboard' | 'inventory') => void;
  onManageCategories: () => void;
  onViewHistory: () => void;
  stockHistoryCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobile: boolean;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onManageCategories,
  onViewHistory,
  stockHistoryCount,
  isDarkMode,
  onToggleDarkMode,
  isMobile,
  sidebarOpen,
  onSidebarClose,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', tab: 'dashboard' as const },
    { id: 'inventory', label: 'Inventory', icon: '📦', tab: 'inventory' as const },
  ];

  const actionItems = [
    { id: 'history', label: 'Stock History', icon: '📋', count: stockHistoryCount, action: onViewHistory },
    { id: 'categories', label: 'Manage Categories', icon: '🏷️', action: onManageCategories },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onSidebarClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? `fixed left-0 top-16 h-[calc(100vh-64px)] w-64 z-40 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-64 sticky top-16 h-[calc(100vh-64px)]'
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col`}
      >
        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Navigation Menu */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
                Navigation
              </h3>
              <div className="space-y-1">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.tab);
                      isMobile && onSidebarClose();
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 animate-fade-in-up hover:translate-x-1 ${
                      activeTab === item.tab
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
                Tools & Settings
              </h3>
              <div className="space-y-1">
                {actionItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      isMobile && onSidebarClose();
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-between animate-fade-in-up hover:translate-x-1"
                    style={{ animationDelay: `${(index + menuItems.length) * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700" />

        {/* Footer - Theme Toggle */}
        <div className="p-4">
          <button
            onClick={onToggleDarkMode}
            className="w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-sm hover:shadow"
          >
            <span className="text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
