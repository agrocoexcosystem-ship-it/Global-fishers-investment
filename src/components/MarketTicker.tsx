import { useEffect, useState } from 'react';

const MARKET_DATA = [
  { symbol: 'BTC/USD', price: 48230.50, change: 2.4 },
  { symbol: 'ETH/USD', price: 2890.12, change: 1.8 },
  { symbol: 'XAU/USD', price: 2045.80, change: 0.5 },
  { symbol: 'EUR/USD', price: 1.0842, change: -0.3 },
  { symbol: 'GBP/USD', price: 1.2640, change: -0.2 },
  { symbol: 'NDX100', price: 17950.20, change: 1.2 },
  { symbol: 'SPX500', price: 5080.50, change: 0.9 },
  { symbol: 'SOL/USD', price: 110.45, change: 5.6 },
  { symbol: 'XRP/USD', price: 0.5640, change: -1.2 },
  { symbol: 'ADA/USD', price: 0.6230, change: 0.8 },
];

export default function MarketTicker() {
  const [data, setData] = useState(MARKET_DATA);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        price: +(item.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(
          item.price > 100 ? 2 : 4
        ),
        change: +(item.change + (Math.random() - 0.5) * 0.1).toFixed(1),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [...data, ...data];

  return (
    <div className="bg-slate-900 border-b border-slate-800 overflow-hidden py-2">
      <div className="animate-ticker flex whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center mx-6 text-xs">
            <span className="text-slate-400 font-medium mr-2">{item.symbol}</span>
            <span className="text-white font-semibold mr-2">
              {item.price.toLocaleString(undefined, { minimumFractionDigits: item.price > 100 ? 2 : 4 })}
            </span>
            <span className={`flex items-center ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="mr-0.5">{item.change >= 0 ? '↗' : '↘'}</span>
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
