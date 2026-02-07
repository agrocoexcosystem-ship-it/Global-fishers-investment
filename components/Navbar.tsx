import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../constants';
import { supabase } from '../lib/supabase';
import { Menu, X, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    const top30Languages = 'en,de,es,fr,zh-CN,hi,ar,pt,ru,ja,ko,it,tr,nl,vi,id,pl,th,sv,no,fi,el,cs,da,hu,ro,sk,bg,uk,he';

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          const layout = window.google.translate.TranslateElement.InlineLayout
            ? window.google.translate.TranslateElement.InlineLayout.SIMPLE
            : 0;

          // Desktop Instance
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: top30Languages,
            layout: layout,
            autoDisplay: false
          }, 'google_translate_element_desktop');

          // Mobile Instance
          // Note: Google Translate API might conflict if ID is missing, handled by having div present in DOM
          const mobileDiv = document.getElementById('google_translate_element_mobile');
          if (mobileDiv) {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: top30Languages,
              layout: layout,
              autoDisplay: false
            }, 'google_translate_element_mobile');
          }
        }
      } catch (err) {
        console.error("Google Translate initialization error:", err);
      }
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }

    return () => subscription.unsubscribe();
  }, [isOpen]); // Re-run when menu opens/closes to re-init mobile translate if needed? Actually better to init once.

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Plans', path: '/plans' },
    { name: 'Compliance', path: '/compliance' },
    { name: 'Security', path: '/security' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Support', path: '/support' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled || isOpen ? 'bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-sm py-2' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 relative z-50 transform hover:scale-105 transition-transform duration-300">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <div className="flex items-center bg-white/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/50 shadow-sm mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${location.pathname === link.path ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 translate-y-[-1px]' : 'text-slate-600 hover:text-emerald-700 hover:bg-white/80'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 ml-2">
              <div id="google_translate_element_desktop" className="min-w-[120px]"></div>

              <div className="flex items-center gap-2">
                {session ? (
                  <div className="flex items-center gap-2">
                    <Link to="/dashboard" className="group flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-full hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md transition-all">
                      <LayoutDashboard size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-300" title="Logout">
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-emerald-600 px-4 transition-colors">Login</Link>
                    <Link
                      to="/signup"
                      className="group flex items-center gap-1 bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-emerald-600 shadow-xl shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300 active:scale-95"
                    >
                      Join Now
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button - Z-index increased to sit above overlay */}
          <div className="flex lg:hidden items-center gap-4 relative z-[70]">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-slate-800 bg-white border border-slate-200 rounded-full shadow-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay - Solid Background, High Z-Index */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-white h-screen w-screen pt-28 px-6 lg:hidden flex flex-col overflow-y-auto"
          >
            {/* Mobile Translate Placeholders */}
            <div className="flex justify-center mb-8 bg-slate-50 p-3 rounded-2xl mx-auto w-fit border border-slate-100 shadow-sm transition-all pb-1 min-h-[50px]">
              <div id="google_translate_element_mobile"></div>
            </div>

            <div className="space-y-3">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + (idx * 0.05) }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-6 py-4 text-lg font-bold rounded-2xl transition-all border ${location.pathname === link.path ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'text-slate-600 bg-slate-50/50 border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      {link.name}
                      {location.pathname === link.path && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4 pb-20">
              {session ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex justify-center items-center gap-3 w-full py-5 font-black text-slate-900 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl active:scale-95 transition-transform"
                  >
                    <LayoutDashboard size={20} className="text-emerald-600" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex justify-center items-center gap-3 w-full bg-rose-50 text-rose-500 py-5 rounded-2xl font-black active:scale-95 transition-transform"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-4 font-bold text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 active:scale-95 transition-transform"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 text-center flex justify-center items-center gap-2 active:scale-95 transition-transform"
                  >
                    Start Investing
                    <ChevronRight size={18} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;