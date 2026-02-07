import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { About, Philosophy, Insight, Security, Compliance, FAQ, WithdrawalPolicy } from './pages/StaticPages';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import Plans from './pages/Plans';
import Calculator from './pages/Calculator';
import Support from './pages/Support';
import AdminLogin from './pages/AdminLogin';
import { supabase } from './lib/supabase';
import { RefreshCw } from 'lucide-react';
import CryptoTicker from './components/CryptoTicker';
import AIChatWidget from './components/AIChatWidget';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Define routes where public Navbar should be hidden
  const hideNavbarRoutes = ['/dashboard', '/admin'];
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    // Initial session check with timeout fallback
    const checkSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Fallback timeout in case Supabase hangs
    const timeout = setTimeout(() => setLoading(false), 2000);

    // Listen for auth updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="text-emerald-500 animate-spin" size={40} />
          <p className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px]">Initializing Secure Uplink</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <CryptoTicker />
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/insight" element={<Insight />} />
          <Route path="/security" element={<Security />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/withdrawal-policy" element={<WithdrawalPolicy />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/support" element={<Support />} />

          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={session ? <Admin /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </main>

      {!shouldHideNavbar && location.pathname !== '/login' && location.pathname !== '/signup' && <Footer />}
      <AIChatWidget />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;