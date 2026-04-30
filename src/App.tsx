import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MarketTicker from './components/MarketTicker';
import Home from './pages/Home';
import About from './pages/About';
import Plans from './pages/Plans';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Compliance from './pages/Compliance';
import Security from './pages/Security';
import Calculator from './pages/Calculator';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Risk from './pages/Risk';
import WithdrawalPolicy from './pages/WithdrawalPolicy';
import Verification from './pages/Verification';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
          <MarketTicker />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/security" element={<Security />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/support" element={<Support />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/risk" element={<Risk />} />
              <Route path="/withdrawal-policy" element={<WithdrawalPolicy />} />
              <Route path="/verify" element={<Verification />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
