import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Users, Settings, LogOut, Cpu, RefreshCcw } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Users', path: '/admin?tab=users', icon: Users },
    { name: 'Transactions', path: '/admin?tab=transactions', icon: RefreshCcw },
    { name: 'Automation', path: '/admin?tab=automation', icon: Cpu },
    { name: 'Settings', path: '/admin?tab=settings', icon: Settings },
  ];

  return (
    <div className="admin-layout min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black/60 backdrop-blur-xl border-r border-gray-700 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-8">FishersPay Admin</h2>
          <nav className="space-y-4">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 text-sm font-medium text-gray-300 hover:text-emerald-300 transition"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-red-400 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
