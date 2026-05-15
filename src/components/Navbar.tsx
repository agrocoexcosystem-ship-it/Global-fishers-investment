import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/plans', label: 'Plans' },
    { to: '/compliance', label: 'Compliance' },
    { to: '/security', label: 'Security' },
    { to: '/calculator', label: 'Calculator' },
    { to: '/support', label: 'Support' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img src="/logo.svg" alt="Global Fishers" className="relative h-10 w-10 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-emerald-400">GLOBAL</span>
              <span className="text-white ml-1.5">FISHERS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${isActive(link.to)
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-3">
            <div id="google_translate_element_desktop" className="w-28" />
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard" className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 transition">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-white text-slate-900 rounded-full text-sm font-semibold hover:bg-slate-100 transition">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pb-4">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm ${isActive(link.to) ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-800">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-emerald-400 font-semibold text-sm">Dashboard</Link>
                <button onClick={handleLogout} className="block py-2 text-red-400 text-sm">Sign Out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-white font-semibold text-sm">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
