import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time, CrosshairMode } from 'lightweight-charts';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
    Zap, Activity, TrendingUp, TrendingDown, Clock, Search,
    Settings, Maximize, Wifi, MoreHorizontal, ArrowUpRight,
    ArrowDownRight, ShieldCheck, PlayCircle, PauseCircle,
    BarChart3, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Types
interface SignalMsg {
    id: string;
    pair: string;
    type: 'BUY' | 'SELL' | 'NEUTRAL';
    price: number;
    time: string;
    tp: number;
    sl: number;
}

const PAIRS = ['EUR/USD', 'GBP/JPY', 'BTC/USD', 'ETH/USD', 'XAU/USD', 'USD/JPY'];
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

const BotTerminal: React.FC<{ active: boolean; onToggle: () => void; userId?: string }> = ({ active, onToggle, userId }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    const [signals, setSignals] = useState<SignalMsg[]>([]);
    const [currentPair, setCurrentPair] = useState('EUR/USD');
    const [timeframe, setTimeframe] = useState('15m');
    const [currentPrice, setCurrentPrice] = useState(1.0850);
    const [priceChange, setPriceChange] = useState(0.12);
    const [rsiValue, setRsiValue] = useState(55);
    const [trend, setTrend] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL'>('BULLISH');

    // Indicators State
    const [indicators, setIndicators] = useState({
        rsi: true,
        ma: true,
        macd: false,
        bollinger: false,
        volume: true
    });
    const [showIndicators, setShowIndicators] = useState(false);

    // Generate initial data
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Chart Options
        const chartOptions = {
            layout: {
                background: { type: ColorType.Solid, color: '#0b0f19' },
                textColor: '#64748b',
            },
            grid: {
                vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
                horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: 'rgba(30, 41, 59, 0.8)',
            },
            timeScale: {
                borderColor: 'rgba(30, 41, 59, 0.8)',
                timeVisible: true,
            },
        };

        let chart: IChartApi | null = null;
        try {
            chart = createChart(chartContainerRef.current, chartOptions);
            chartRef.current = chart;

            // Series
            const candlestickSeries = (chart as any).addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444',
            });
            candlestickSeriesRef.current = candlestickSeries;

            const maSeries = (chart as any).addLineSeries({
                color: '#6366f1',
                lineWidth: 2,
                crosshairMarkerVisible: false,
            });
            maSeriesRef.current = maSeries;

            const volumeSeries = (chart as any).addHistogramSeries({
                priceFormat: { type: 'volume' },
                priceScaleId: '', // Overlay
                scaleMargins: { top: 0.8, bottom: 0 },
            });
            volumeSeriesRef.current = volumeSeries;

            // Mock Data Generation
            const generateData = () => {
                const data = [];
                let price = 1.0850;
                const now = new Date();
                now.setHours(now.getHours() - 24); // Start 24h ago

                for (let i = 0; i < 1000; i++) {
                    const time = Math.floor(now.getTime() / 1000) as Time;
                    const open = price;
                    const change = (Math.random() - 0.5) * 0.002;
                    const close = open + change;
                    const high = Math.max(open, close) + Math.random() * 0.001;
                    const low = Math.min(open, close) - Math.random() * 0.001;
                    const ma = close + (Math.random() - 0.5) * 0.005;

                    data.push({
                        time,
                        open, high, low, close,
                        volume: Math.random() * 100,
                        ma
                    });
                    price = close;
                    now.setMinutes(now.getMinutes() + 15);
                }
                return data;
            };

            const rawData = generateData();
            candlestickSeries.setData(rawData.map(d => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close })));
            maSeries.setData(rawData.map(d => ({ time: d.time, value: d.ma })));
            volumeSeries.setData(rawData.map(d => ({
                time: d.time,
                value: d.volume,
                color: d.close > d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            })));

            chart.timeScale().fitContent();
        } catch (e) {
            console.error("Chart init failed", e);
        }

        // Resize Observer
        const handleResize = () => {
            if (chartContainerRef.current && chart) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
            }
        };

        window.addEventListener('resize', handleResize);
        // Force initial resize
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart) chart.remove();
        };
    }, [currentPair]);

    // Live Update Simulation & Realtime Listener
    useEffect(() => {
        // SUBSCRIPTION TO REALTIME COMMANDS
        let channel: any;
        if (userId) {
            channel = supabase
                .channel(`bot-terminal-${userId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, (payload) => {
                    const tx = payload.new;
                    if (tx.type === 'bot_trade') {
                        // Admin forced trade / Bot trade
                        const isWin = tx.amount > 0; // Simple heuristic, though amount is usually abs
                        const type = tx.details?.includes('WIN') || tx.details?.includes('BUY') ? 'BUY' : 'SELL'; // Parse from details if needed

                        // Better heuristic: look at details string or parse method
                        const tradeType = tx.details?.includes('Force WIN') ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : (Math.random() > 0.5 ? 'BUY' : 'SELL');

                        const newSignal: SignalMsg = {
                            id: tx.id,
                            pair: 'BTC/USD', // Default for forced trades
                            type: tradeType,
                            price: currentPrice,
                            time: new Date().toLocaleTimeString(),
                            tp: currentPrice * 1.02,
                            sl: currentPrice * 0.98
                        };

                        setSignals(prev => [newSignal, ...prev].slice(0, 50));
                        toast.success(`New Signal Received: ${tradeType} BTC/USD`, { icon: '🚀' });

                        // Visual bump
                        setPriceChange(prev => prev + (Math.random() * 0.5));
                    }
                })
                .subscribe();
        }

        const interval = setInterval(() => {
            if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !maSeriesRef.current) return;

            const lastPrice = currentPrice;
            const change = (Math.random() - 0.5) * 0.0005;
            const newPrice = lastPrice + change;
            const now = Math.floor(Date.now() / 1000) as Time;

            // Update Chart (simplistic: standard update, normally would need bar aggregation for real candle)
            // For visual effect, we just update the last bar or add a new one occasionally
            // Here we just add a "tick" update to simulate movement

            setCurrentPrice(newPrice);
            setPriceChange(prev => prev + (change * 100)); // Mock % change
            setRsiValue(prev => Math.max(30, Math.min(70, prev + (Math.random() - 0.5) * 5)));

            const trendVal = change > 0 ? 'BULLISH' : 'BEARISH';
            // Only change trend occasionally to avoid flickering
            if (Math.random() > 0.8) setTrend(trendVal);

            // Random Signals (Local Simulation - kept for liveness if active)
            // INCREASED FREQUENCY for liveness check: > 0.6 instead of 0.92
            if (active && Math.random() > 0.6) {
                const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
                const newSignal: SignalMsg = {
                    id: Date.now().toString(),
                    pair: currentPair,
                    type,
                    price: newPrice,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    tp: newPrice + (type === 'BUY' ? 0.0020 : -0.0020),
                    sl: newPrice + (type === 'BUY' ? -0.0010 : 0.0010),
                };
                setSignals(prev => [newSignal, ...prev].slice(0, 50));
            }

        }, 1000); // FASTER INTERVAL: 1000ms instead of 2000ms

        return () => {
            clearInterval(interval);
            if (channel) supabase.removeChannel(channel);
        };
    }, [currentPrice, active, currentPair, userId]);


    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[85vh] text-slate-300 font-sans">

            {/* LEFT: MAIN CHART AREA */}
            <div className="flex-grow flex flex-col gap-4 min-w-0">

                {/* TOP METRICS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MeticCard
                        label="NETTO_G/V (24h)"
                        value={`+${(priceChange * 12.5).toFixed(2)}%`}
                        trend="up"
                        subValue="+€1,240.50"
                    />
                    <MeticCard
                        label="RSI (14)"
                        value={rsiValue.toFixed(1)}
                        color={rsiValue > 70 ? 'text-rose-400' : rsiValue < 30 ? 'text-emerald-400' : 'text-slate-200'}
                        subValue={rsiValue > 70 ? 'OVERBOUGHT' : rsiValue < 30 ? 'OVERSOLD' : 'NEUTRAL'}
                    />
                    <MeticCard
                        label="TREND (MA-200)"
                        value={trend}
                        color={trend === 'BULLISH' ? 'text-emerald-400' : trend === 'BEARISH' ? 'text-rose-400' : 'text-slate-400'}
                        icon={trend === 'BULLISH' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    />
                    <MeticCard
                        label="VOLATILITÄT"
                        value="HOCH"
                        color="text-amber-400"
                        icon={<Activity size={16} />}
                    />
                </div>

                {/* CHART CONTAINER */}
                <div className="flex-grow bg-[#0b0f19] border border-slate-800 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">

                    {/* Chart Header / Toolbar */}
                    <div className="h-14 border-b border-slate-800 bg-[#0f172a]/50 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg">
                                <img src={`https://ui-avatars.com/api/?name=${currentPair}&background=random`} className="w-6 h-6 rounded-full" alt="pair" />
                                <select
                                    className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
                                    value={currentPair}
                                    onChange={(e) => setCurrentPair(e.target.value)}
                                >
                                    {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="hidden md:flex bg-slate-800/50 rounded-lg p-1">
                                {TIMEFRAMES.map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setTimeframe(tf)}
                                        className={cn(
                                            "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                            timeframe === tf ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                        )}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Indicators Toggle */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowIndicators(!showIndicators)}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                                {showIndicators && (
                                    <div className="absolute top-10 right-0 w-48 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl z-50 flex flex-col gap-2">
                                        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Indikatoren</span>
                                        {Object.keys(indicators).map((ind) => (
                                            <label key={ind} className="flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-800 p-2 rounded-lg">
                                                <span className="uppercase">{ind}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={indicators[ind as keyof typeof indicators]}
                                                    onChange={() => setIndicators(prev => ({ ...prev, [ind]: !prev[ind as keyof typeof indicators] }))}
                                                    className="accent-indigo-500"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", active ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-rose-500/10 border-rose-500/50 text-rose-400")}>
                                <div className={cn("w-2 h-2 rounded-full", active ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                {active ? 'SYSTEM AKTIV' : 'OFFLINE'}
                            </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div ref={chartContainerRef} className="w-full flex-grow relative group cursor-crosshair">
                        {/* Watermark */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[4rem] font-black text-slate-800/20 pointer-events-none select-none">
                            QUANTUM AI
                        </div>

                        {/* Floating Info */}
                        <div className="absolute top-4 left-4 z-10 flex gap-6 pointer-events-none">
                            <div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">O</div>
                                <div className="text-xs font-mono text-emerald-400">{currentPrice.toFixed(5)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">H</div>
                                <div className="text-xs font-mono text-emerald-400">{(currentPrice + 0.0012).toFixed(5)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">L</div>
                                <div className="text-xs font-mono text-rose-400">{(currentPrice - 0.0008).toFixed(5)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">C</div>
                                <div className="text-xs font-mono text-white font-bold">{currentPrice.toFixed(5)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Order Panel (Bottom Overlay) */}
                    <div className="bg-slate-900/90 backdrop-blur border-t border-slate-800 p-3 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                        <div className="flex flex-col">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Betrag (Lots)</label>
                            <input type="number" defaultValue={0.1} step={0.01} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">TP (Ziel)</label>
                            <input type="number" placeholder="Preis" className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500" />
                        </div>
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded py-2 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                            KAUFEN <TrendingUp size={14} />
                        </button>
                        <button className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded py-2 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                            VERKAUFEN <TrendingDown size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: SIDEBAR (SIGNALS) */}
            <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4">

                {/* Connection / Status Card */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latenz</div>
                        <div className="text-emerald-400 font-mono font-bold text-sm">24ms</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">API-Status</div>
                        <div className="text-emerald-400 font-mono font-bold text-sm flex items-center gap-1 justify-end"><Wifi size={12} /> Verbunden</div>
                    </div>
                </div>

                {/* Start/Stop Button */}
                <button
                    onClick={onToggle}
                    className={cn(
                        "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3",
                        active
                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20"
                    )}
                >
                    {active ? (
                        <>
                            <PauseCircle size={20} /> Engine stoppen
                        </>
                    ) : (
                        <>
                            <PlayCircle size={20} /> Engine starten
                        </>
                    )}
                </button>

                {/* Signals Feed */}
                <div className="flex-grow bg-[#0b0f19] border border-slate-800 rounded-2xl flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                            <Zap size={16} className="text-amber-400" /> LIVE-SIGNALE
                        </h3>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </div>

                    <div className="flex-grow overflow-y-auto p-3 space-y-3 custom-scrollbar relative">
                        <AnimatePresence initial={false}>
                            {signals.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-50">
                                    <Activity size={40} className="mb-2" />
                                    <p className="text-xs font-bold uppercase">Warte auf Signale...</p>
                                </div>
                            )}
                            {signals.map((signal) => (
                                <motion.div
                                    key={signal.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl relative overflow-hidden group hover:border-slate-600 transition-colors"
                                >
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", signal.type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500')} />
                                    <div className="flex justify-between items-start mb-1 pl-2">
                                        <span className="font-bold text-slate-200 text-xs">{signal.pair}</span>
                                        <span className="text-[10px] font-mono text-slate-500">{signal.time}</span>
                                    </div>
                                    <div className="pl-2 flex justify-between items-center">
                                        <div className={cn("text-xs font-black uppercase px-2 py-0.5 rounded text-[10px]", signal.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                                            {signal.type} @ {signal.price.toFixed(5)}
                                        </div>
                                    </div>
                                    <div className="pl-2 mt-2 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                                        <div>TP: <span className="text-emerald-400">{signal.tp.toFixed(5)}</span></div>
                                        <div>SL: <span className="text-rose-400">{signal.sl.toFixed(5)}</span></div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

        </div>
    );
};

const MeticCard = ({ label, value, trend, subValue, color, icon }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            {icon && <div className={cn("text-slate-400", color)}>{icon}</div>}
        </div>
        <div className="mt-2">
            <div className={cn("text-xl font-black tracking-tight", color || "text-white")}>{value}</div>
            {subValue && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{subValue}</div>}
        </div>
    </div>
);

export default BotTerminal;
