import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, PlusCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Transactions', icon: Receipt, path: '/transactions' },
    { name: 'Categories', icon: PlusCircle, path: '/categories' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 md:pl-64">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">FinTracker</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user?.name?.[0]}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-30 glass-morphism">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center space-y-1 ${
              location.pathname === item.path ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center space-y-1 text-gray-400"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
