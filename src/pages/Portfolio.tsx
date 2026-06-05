import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { toast } from 'react-hot-toast';
import { ArrowRightLeft, Send, Copy, RefreshCw, Calendar, Flame, Lock, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const {
    provider,
    walletAddress,
    ethBalance,
    pxxBalance,
    connected,
    connectWallet,
    buyPxx,
    sendPxx,
    fetchPxxBalance,
    loading: web3Loading,
  } = useWeb3();

  const [ethAmount, setEthAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Launch Date: August 15, 2026
    const launchDate = new Date('2026-08-15T00:00:00Z').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBuy = async () => {
    if (!connected) {
      await connectWallet();
      return;
    }
    await buyPxx(ethAmount);
    setEthAmount('');
  };

  const handleSend = async () => {
    if (!connected) {
      await connectWallet();
      return;
    }
    await sendPxx(sendTo, sendAmount);
    setSendTo('');
    setSendAmount('');
  };

  const loading = web3Loading;

  // Mock presale data
  const presaleProgress = 68; // 68% sold
  const tokensSold = "3,400,000";
  const totalTokens = "5,000,000";

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto relative z-10 space-y-12"
      >
        
        {/* Elegant Header */}
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-1 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2 bg-amber-500/5">
            Ecosystem Dashboard
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight">
            PXX <span className="italic text-amber-500">Portfolio</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Manage your digital assets, participate in the exclusive presale, and prepare for the institutional liquidity launch.
          </p>
          
          <div className="pt-6 flex justify-center">
            {connected ? (
              <div className="flex items-center gap-3 bg-slate-900/50 border border-amber-500/20 px-5 py-2.5 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-sm text-amber-300 font-mono tracking-wider">
                  {walletAddress.substring(0,6)}...{walletAddress.substring(walletAddress.length - 4)}
                </span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(walletAddress); toast.success('Address copied'); }}
                  className="text-slate-500 hover:text-amber-400 transition ml-2"
                >
                  <Copy size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-8 py-3.5 bg-amber-500 text-slate-950 font-black rounded-full hover:bg-amber-400 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] disabled:opacity-50 tracking-wider text-sm uppercase"
              >
                {loading ? 'Authenticating…' : 'Connect Web3 Wallet'}
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Presale Status Banner (Elegant) */}
            <div className="relative overflow-hidden p-10 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-amber-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] group hover:border-amber-500/40 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-serif text-white mb-2">
                      Phase 1 <span className="italic text-amber-500">Presale</span>
                    </h2>
                    <p className="text-sm text-slate-400 font-light">Secure your position before public listing.</p>
                  </div>
                  <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-amber-500/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Current Swap Rate</p>
                    <p className="text-xl text-amber-400 font-mono tracking-tight">1 ETH = 1,000 PXX</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-light text-white">{presaleProgress}<span className="text-amber-500">%</span></p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Filled</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-amber-200">{tokensSold} <span className="text-sm text-slate-500">/ {totalTokens} PXX</span></p>
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${presaleProgress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 relative"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] w-[50%] animate-[slide_2s_linear_infinite]"></div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Buy Module */}
              <div className="p-8 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 text-amber-500">
                    <ArrowRightLeft size={24} />
                  </div>
                  <h3 className="text-xl font-serif text-white mb-6">Acquire <span className="italic">PXX</span></h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Ethereum Amount</label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          placeholder="0.00"
                          value={ethAmount}
                          onChange={e => setEthAmount(e.target.value)}
                          className="w-full px-5 py-4 bg-[#0a0f1c] border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 font-mono text-lg transition-colors"
                        />
                        <span className="absolute right-5 top-4 text-slate-500 font-bold">ETH</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center px-4 py-3 bg-[#0a0f1c] rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Estimated Yield</span>
                      <span className="font-mono text-amber-400 font-bold text-lg">
                        {ethAmount ? (parseFloat(ethAmount) * 1000).toLocaleString() : '0'} <span className="text-sm">PXX</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={loading || (connected && !ethAmount)}
                  className={`w-full mt-8 py-4 font-bold rounded-xl transition uppercase tracking-widest text-xs ${
                    loading || (connected && !ethAmount)
                      ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_10px_20px_-10px_rgba(245,158,11,0.5)]'
                  }`}
                >
                  {loading ? 'Processing…' : connected ? 'Execute Purchase' : 'Connect to Buy'}
                </button>
              </div>

              {/* Transfer Module */}
              <div className="p-8 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 text-slate-300">
                    <Send size={24} />
                  </div>
                  <h3 className="text-xl font-serif text-white mb-6">Transfer <span className="italic">Assets</span></h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Destination Address</label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={sendTo}
                        onChange={e => setSendTo(e.target.value)}
                        className="w-full px-5 py-4 bg-[#0a0f1c] border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-slate-600 font-mono text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Token Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          placeholder="0.00"
                          value={sendAmount}
                          onChange={e => setSendAmount(e.target.value)}
                          className="w-full px-5 py-4 bg-[#0a0f1c] border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-slate-600 font-mono text-lg transition-colors"
                        />
                        <span className="absolute right-5 top-4 text-slate-500 font-bold">PXX</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={loading || (connected && (!sendTo || !sendAmount))}
                  className={`w-full mt-8 py-4 font-bold rounded-xl transition uppercase tracking-widest text-xs border ${
                    loading || (connected && (!sendTo || !sendAmount))
                      ? 'bg-slate-800 border-slate-800 cursor-not-allowed text-slate-500'
                      : 'bg-transparent border-slate-600 text-white hover:bg-white hover:text-slate-950 hover:border-white'
                  }`}
                >
                  {loading ? 'Processing…' : connected ? 'Initiate Transfer' : 'Connect to Transfer'}
                </button>
              </div>

            </div>
          </div>

          {/* Sidebar / Secondary Info */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Holdings Widget */}
            <div className="p-8 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Activity size={100} />
              </div>
              
              <div className="flex justify-between items-end mb-8 relative z-10">
                <h3 className="text-xl font-serif text-white">Your <span className="italic text-amber-500">Holdings</span></h3>
                {connected && (
                  <button
                    onClick={() => fetchPxxBalance(walletAddress, provider)}
                    className="flex items-center gap-1.5 text-[10px] text-amber-500 uppercase tracking-widest font-bold hover:text-amber-400 transition"
                  >
                    <RefreshCw size={12} /> Sync
                  </button>
                )}
              </div>

              {connected ? (
                <div className="space-y-4 relative z-10">
                  <div className="p-5 bg-[#0a0f1c] rounded-2xl border border-amber-500/20 group hover:border-amber-500/50 transition duration-300">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">PXX Balance</p>
                    <p className="text-3xl font-mono text-amber-400 group-hover:scale-[1.02] origin-left transition-transform duration-300">{pxxBalance}</p>
                  </div>
                  <div className="p-5 bg-[#0a0f1c] rounded-2xl border border-slate-800 group hover:border-slate-600 transition duration-300">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">ETH Balance</p>
                    <p className="text-3xl font-mono text-white group-hover:scale-[1.02] origin-left transition-transform duration-300">{ethBalance}</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-slate-700 rounded-2xl bg-[#0a0f1c]/50 relative z-10">
                  <Lock className="mx-auto text-slate-600 mb-3" size={24} />
                  <p className="text-sm text-slate-400 font-light px-6">Authenticate via Web3 to view your decentralized assets.</p>
                </div>
              )}
            </div>

            {/* Launch Countdown Widget */}
            <div className="p-8 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/80 text-center">
              <Calendar className="mx-auto text-amber-500 mb-4" size={24} />
              <h3 className="text-xl font-serif text-white mb-2">Network <span className="italic">Launch</span></h3>
              <p className="text-[10px] text-slate-400 mb-8 uppercase tracking-[0.2em] font-bold">August 15, 2026</p>
              
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Mins', value: timeLeft.minutes },
                  { label: 'Secs', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-full aspect-square bg-[#0a0f1c] rounded-xl border border-slate-800 flex items-center justify-center mb-2 shadow-inner">
                      <span className="text-xl font-serif text-amber-400">
                        {item.value.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staking Teaser */}
            <div className="p-8 bg-gradient-to-br from-amber-900/20 to-[#0a0f1c] backdrop-blur-md rounded-3xl border border-amber-500/20 group hover:border-amber-500/40 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="text-amber-500" size={20} />
                <h3 className="text-xl font-serif text-white">Staking <span className="italic text-amber-500">V1</span></h3>
              </div>
              <p className="text-sm text-slate-300 font-light mb-6 leading-relaxed">
                Lock your PXX tokens early to secure high APY rewards before the public mainnet release.
              </p>
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-amber-500/10 mb-6">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Est. Base APY</span>
                <span className="text-lg text-emerald-400 font-serif italic">25.0%</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold text-amber-500 group-hover:text-amber-400 transition-colors">
                Available Soon <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
