import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, Camera, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Verification() {
  const [step, setStep] = useState<'scan' | 'otp' | 'success'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep('otp');
      toast.success('Biometric verification successful');
    }, 4000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setStep('success');
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 'scan' && (
            <motion.div 
              key="scan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full border-2 ${isScanning ? 'border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-slate-700'} flex items-center justify-center transition-all duration-500`}>
                    {isScanning ? (
                      <Fingerprint size={48} className="text-amber-500 animate-pulse" />
                    ) : (
                      <Camera size={48} className="text-slate-500" />
                    )}
                  </div>
                  {isScanning && (
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-1 bg-amber-500"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4 font-serif">Face Verification</h1>
              <p className="text-slate-400 mb-8">To ensure account security, please complete a biometric face scan to verify your identity.</p>

              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all
                  ${isScanning ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20'}`}
              >
                {isScanning ? 'Scanning Biometrics...' : 'Begin Verification'}
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                <Shield size={14} className="text-amber-400" />
                Secured by PXX Multi-Layer AI
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <ShieldCheck size={48} className="text-emerald-400" />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4 font-serif">Security Check</h1>
              <p className="text-slate-400 mb-8">A 6-digit security code has been sent to your registered email. Please enter it below.</p>

              <div className="flex justify-between gap-3 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-14 bg-slate-700 border border-slate-600 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Verify & Continue
              </button>

              <button className="mt-6 text-sm text-slate-500 hover:text-emerald-400 transition-colors">
                Didn't receive code? Resend
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="flex justify-center mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                >
                  <CheckCircle2 size={48} className="text-white" />
                </motion.div>
              </div>

              <h1 className="text-3xl font-bold mb-4 font-serif">Access Granted</h1>
              <p className="text-slate-400">Your identity has been verified. Redirecting you to your secure dashboard...</p>
              
              <div className="mt-8 flex justify-center">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
