import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const TICKER_ITEMS = [
    { symbol: 'BTC/USD', price: '48,230.50', change: '+2.4%', up: true },
    { symbol: 'ETH/USD', price: '2,890.12', change: '+1.8%', up: true },
    { symbol: 'XAU/USD', price: '2,045.00', change: '-0.5%', up: false },
    { symbol: 'EUR/USD', price: '1.0850', change: '+0.1%', up: true },
    { symbol: 'GBP/USD', price: '1.2640', change: '-0.2%', up: false },
    { symbol: 'NDX100', price: '17,950.20', change: '+1.2%', up: true },
    { symbol: 'SPX500', price: '5,080.50', change: '+0.9%', up: true },
    { symbol: 'SOL/USD', price: '110.45', change: '+5.6%', up: true },
    { symbol: 'XRP/USD', price: '0.5640', change: '-1.2%', up: false },
    { symbol: 'ADA/USD', price: '0.6230', change: '+0.8%', up: true },
];

const CryptoTicker: React.FC = () => {
    return (
        <div className="bg-slate-950 border-b border-slate-800 h-10 overflow-hidden flex items-center relative z-50">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

            <div className="flex whitespace-nowrap animate-marquee hover:pause-animation">
                {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 px-6 border-r border-slate-800/50">
                        <span className="text-xs font-bold text-slate-400">{item.symbol}</span>
                        <span className="text-xs font-mono text-white">{item.price}</span>
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {item.change}
                        </span>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .hover\\:pause-animation:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default CryptoTicker;
