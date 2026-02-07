import React, { useState } from 'react';
import { INVESTMENT_PLANS } from '../constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const WALLET_ADDRESSES: Record<string, string> = {
  'Bitcoin (BTC)': 'bc1quv7wal02yhzhr5e67sdgjvpw2zxl6cevs2jy4n',
  'Ethereum (ETH)': '0xfd30aF1aff62C7602a874AA38155396347eECF0a',
};

const getQRCodeUrl = (address: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<'choice' | 'main-balance' | 'direct-deposit'>('choice');
  const [selectedCrypto, setSelectedCrypto] = useState('Bitcoin (BTC)');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInvestClick = (plan: any) => {
    setSelectedPlan(plan);
    setModalStep('choice');
    setShowModal(true);
  };

  const handleMainBalanceInvest = async () => {
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to invest.");
        navigate('/login');
        return;
      }

      // 1. Create Investment Record
      const { error: invError } = await supabase.from('investments').insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        amount: selectedPlan.minDeposit,
        daily_return: selectedPlan.dailyReturn,
        start_date: new Date().toISOString(),
        // Calculate end date based on duration
        end_date: new Date(Date.now() + (selectedPlan.durationDays * 86400000)).toISOString(),
        status: 'active',
        total_profit: 0
      });

      if (invError) throw invError;

      // 2. Create Transaction (Withdrawal/Investment type to deduct balance via trigger)
      // We use 'investment' type which we defined in schema, but our trigger handles 'withdrawal' for deduction.
      // Let's use 'withdrawal' type with method 'Investment: Plan Name' to ensure balance decreases.
      // OR better, update trigger to handle 'investment' type deduction.
      // Current trigger only handles: deposit (+), withdrawal (-), profit (+)
      // So we will insert a 'withdrawal' to represent the cost.
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'withdrawal', // deducts balance
        amount: selectedPlan.minDeposit,
        status: 'completed',
        method: `Investment: ${selectedPlan.name}`
      });

      if (txError) throw txError;

      toast.success(`Successfully invested in ${selectedPlan.name}!`);
      setShowModal(false);
      navigate('/dashboard');

    } catch (e: any) {
      console.error("Investment failed:", e);
      toast.error(e.message || "Investment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-[#020617] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
            Institutional Portfolios
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Select Your <span className="text-emerald-500">Tier</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
            Deploy capital into our high-performance quantitative tiers designed for consistent growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {INVESTMENT_PLANS.map((plan) => (
            <div key={plan.id} className="relative bg-[#0f172a] rounded-[40px] border border-slate-800 shadow-2xl transition-all group overflow-hidden flex flex-col h-full hover:border-emerald-500/50">
              {/* Image Header */}
              <div className="h-56 relative overflow-hidden">
                <img
                  src={plan.imageUrl}
                  alt={plan.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
                <div className="absolute top-6 right-6">
                  <div className="bg-emerald-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
                    +{plan.dailyReturn}%
                  </div>
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Global Asset Class</div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Minimum</span>
                    <span className="font-black text-white tracking-tight">${plan.minDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Maturity</span>
                    <span className="font-black text-white tracking-tight">{plan.durationDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Security</span>
                    <span className="font-black text-emerald-500 tracking-tight">Insured</span>
                  </div>
                </div>

                <button
                  onClick={() => handleInvestClick(plan)}
                  className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-95"
                >
                  Invest Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0f172a] w-full max-w-md p-10 rounded-[48px] border border-slate-800 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Invest in {selectedPlan.name}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 text-3xl leading-none hover:text-white">&times;</button>
            </div>

            {modalStep === 'choice' && (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm mb-6">Choose your preferred funding source for this tier allocation.</p>
                <button
                  onClick={() => setModalStep('main-balance')}
                  className="w-full p-6 bg-slate-900/50 border border-slate-800 rounded-[32px] text-left hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl">💳</div>
                    <div>
                      <div className="font-black text-sm text-white group-hover:text-emerald-400">Main Account Balance</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instant Allocation</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setModalStep('direct-deposit')}
                  className="w-full p-6 bg-slate-900/50 border border-slate-800 rounded-[32px] text-left hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-xl">₿</div>
                    <div>
                      <div className="font-black text-sm text-white group-hover:text-emerald-400">Direct Crypto Deposit</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">External Transfer</div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {modalStep === 'main-balance' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Required Investment</div>
                  <div className="text-4xl font-black text-white">${selectedPlan.minDeposit.toLocaleString()}</div>
                </div>
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  By confirming, this amount will be deducted from your available dashboard balance and locked into the {selectedPlan.name} contract.
                </p>
                <button
                  onClick={handleMainBalanceInvest}
                  disabled={isProcessing}
                  className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex justify-center items-center gap-3"
                >
                  {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm Allocation'}
                </button>
                <button onClick={() => setModalStep('choice')} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Go Back</button>
              </div>
            )}

            {modalStep === 'direct-deposit' && (
              <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setSelectedCrypto('Bitcoin (BTC)')}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedCrypto === 'Bitcoin (BTC)' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                  >
                    Bitcoin
                  </button>
                  <button
                    onClick={() => setSelectedCrypto('Ethereum (ETH)')}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedCrypto === 'Ethereum (ETH)' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                  >
                    Ethereum
                  </button>
                </div>

                <div className="bg-white p-6 rounded-[32px] flex flex-col items-center gap-4">
                  <img src={getQRCodeUrl(WALLET_ADDRESSES[selectedCrypto])} alt="QR Code" className="w-40 h-40" />
                  <div className="w-full text-center">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Transfer to this Address</div>
                    <div className="text-[11px] font-mono p-4 bg-slate-50 text-slate-900 rounded-xl break-all border border-slate-200 select-all cursor-copy">
                      {WALLET_ADDRESSES[selectedCrypto]}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                    Once sent, your investment will activate automatically after 3 network confirmations.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-5 bg-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800"
                >
                  Done
                </button>
                <button onClick={() => setModalStep('choice')} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Go Back</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
