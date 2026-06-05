import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, Coins } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
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
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-amber-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative h-10 w-10 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 shadow-lg shadow-amber-500/20">
                <Coins size={20} className="text-slate-950" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">PXX</span>
              <span className="text-white ml-1.5 text-[9px] font-bold tracking-[0.3em] uppercase opacity-75">Platform</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                  ${isActive(link.to)
                    ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/5 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-3">
            <div id="google_translate_element_desktop" className="w-28 text-slate-400" />
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin" className="px-4 py-2 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-amber-500/10 transition">
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-amber-500/10">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-white text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-900 px-4 pb-4">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 text-xs font-bold uppercase tracking-wider ${isActive(link.to) ? 'text-amber-400' : 'text-slate-400'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-900">
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-amber-400 font-bold text-xs uppercase tracking-wider">Admin Panel</Link>}
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">Dashboard</Link>
                <button onClick={handleLogout} className="block py-2 text-red-400 text-xs font-bold uppercase tracking-wider">Sign Out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-white font-bold text-xs uppercase tracking-wider">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
