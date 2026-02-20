import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PlusCircle, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const Layout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: 'Dasbor', icon: LayoutDashboard, path: '/' },
    { name: 'Transaksi', icon: Receipt, path: '/transactions' },
    { name: 'Kategori', icon: PlusCircle, path: '/categories' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pb-16 md:pb-0 md:pl-64">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-30 transition-colors duration-300">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">FinTracker</h1>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
              {user?.name?.[0]}
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
          <div className="mt-4 px-2 pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
              Dikembangkan oleh Fariz Rauf
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mt-8 pb-8 md:hidden text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
            Dikembangkan oleh Fariz Rauf
          </p>
        </footer>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex justify-around p-3 z-30 transition-colors duration-300">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center space-y-1 ${
              location.pathname === item.path ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center space-y-1 text-gray-400 dark:text-gray-500"
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          <span className="text-[10px] font-medium">Tema</span>
        </button>
        <button
          onClick={logout}
          className="flex flex-col items-center space-y-1 text-gray-400 dark:text-gray-500"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
