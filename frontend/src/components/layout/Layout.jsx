import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PlusCircle, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

const Layout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleLanguage, t, language } = useLanguage();
  const location = useLocation();

  const navItems = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/' },
    { name: t('transactions'), icon: Receipt, path: '/transactions' },
    { name: t('categories'), icon: PlusCircle, path: '/categories' },
  ];

  // Default User Data if empty
  const displayName = user?.name || 'Guest User';
  const displayEmail = user?.email || 'guest@example.com';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 transition-colors duration-300">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-none">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight dark:text-white">FinanceApp</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dashboard V2</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 group ${
                  location.pathname === item.path
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon size={22} className={location.pathname === item.path ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-slate-700/30 rounded-3xl p-4 border border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 border-2 border-white dark:border-slate-600 shadow-sm flex items-center justify-center text-white font-bold text-xs">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate dark:text-white">{displayName}</p>
                <p className="text-[10px] text-gray-400 truncate font-medium">{displayEmail}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm border border-gray-100 dark:border-slate-700 group"
                title={t('theme')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{t('theme')}</span>
                </div>
                <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>

              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm border border-gray-100 dark:border-slate-700 group"
                title={t('language')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <Globe size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{t('language')}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700/50 p-1 rounded-lg">
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all ${language === 'en' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400'}`}>EN</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all ${language === 'id' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400'}`}>ID</span>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-bold"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-gray-100 dark:border-slate-700 px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 ${
              location.pathname === item.path ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
        
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center space-y-1 text-gray-400 dark:text-gray-500"
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          <span className="text-[10px] font-bold uppercase tracking-wider">{t('theme')}</span>
        </button>

        <button
          onClick={toggleLanguage}
          className="flex flex-col items-center space-y-1 text-gray-400 dark:text-gray-500"
        >
          <Globe size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{(language || 'EN').toUpperCase()}</span>
        </button>

        <button
          onClick={logout}
          className="flex flex-col items-center space-y-1 text-red-400"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t('logout')}</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
