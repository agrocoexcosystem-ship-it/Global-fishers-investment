import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, ArrowDownCircle, ArrowUpCircle,
  Copy, Clock, CheckCircle, XCircle, BarChart3,
  PieChart as PieChartIcon, ShieldCheck, ChevronRight, Users,
  Terminal, Play, Square, MessageSquare, Settings, Flame, Cpu, Landmark, Code2, Link2, Coins, ArrowRightLeft, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ethers } from 'ethers';

const CHART_DATA = [
  { month: 'Jan', value: 45000 },
  { month: 'Feb', value: 52000 },
  { month: 'Mar', value: 48000 },
  { month: 'Apr', value: 61000 },
  { month: 'May', value: 85000 },
  { month: 'Jun', value: 102000 },
  { month: 'Jul', value: 125000 },
  { month: 'Aug', value: 142000 },
  { month: 'Sep', value: 162000 },
];

const ALLOCATION_DATA = [
  { name: 'Forex Quant', value: 35, color: '#fbbf24' }, // Gold
  { name: 'PXX Liquidity', value: 25, color: '#3b82f6' }, // Blue
  { name: 'Staked Reserve', value: 20, color: '#10b981' }, // Emerald
  { name: 'Blue-Chip Digital', value: 20, color: '#8b5cf6' }, // Purple
];

const MOCK_LOGS = [
  "Executing BUY ORDER EUR/USD - 5.0 Lots at 1.0845.",
  "Position closed at EUR/USD 1.0859. Profit realized: +€75.00.",
  "Executing SELL ORDER GBP/USD - 3.5 Lots at 1.2721.",
  "Position closed at GBP/USD 1.2714. Profit realized: +€54.25.",
  "Executing BUY ORDER USD/JPY - 4.0 Lots at 155.62.",
  "Position closed at USD/JPY 155.70. Profit realized: +€92.80.",
  "EUR/USD - Bollinger Bands contraction detected. Scalping opportunity emerging.",
  "GBP/USD - RSI overbought detected on 5m chart. Preparing short scalp.",
  "USD/JPY - Support line bounce detected on H1 chart.",
  "Analyzing liquidity matrix across Frankfurt and London gateways...",
];

const INITIAL_CHAT = [
  { sender: "Ken Fisher", message: "The Neural Quant FX bot is performing exceptionally well during the US market open.", time: "09:42 AM", badge: "Founder" },
  { sender: "Sarah Jenkins", message: "Just deployed €15k from my accumulated profit. First trade already made +€110!", time: "09:44 AM", badge: "VIP Investor" },
  { sender: "Marcus K.", message: "Has anyone tried the HFT Scalper? Is it consistent?", time: "09:45 AM", badge: "Client" },
  { sender: "Support Agent", message: "Yes Marcus! The HFT Scalper strategy targets micro-oscillations on major pairs and maintains a 98.4% historical win rate.", time: "09:46 AM", badge: "Staff" },
  { sender: "Fadel Ayad", message: "Institutional Quant FX is the best. Safe, zero loss so far on my institutional tier. Absolute masterclass.", time: "09:48 AM", badge: "Institutional" },
];

const SIMULATED_USERS = [
  { sender: "Thomas Vance", message: "EUR/USD breakout was clean. Bot captured it beautifully.", badge: "Pro Trader" },
  { sender: "Elena Rostova", message: "Deposited 50% of my weekly profit back into the bot. Compound interest is magic.", badge: "VIP Client" },
  { sender: "Dieter M.", message: "Unbelievable speed. The latency is practically non-existent on the executing terminal.", badge: "Client" },
  { sender: "Ken Fisher", message: "Remember, the bot has built-in stop losses, but our zero-loss neural logic keeps drawdowns under 0.2%.", badge: "Founder" },
  { sender: "Sarah Jenkins", message: "Another trade closed! +€95 on GBP/USD. Outstanding.", badge: "VIP Investor" },
];

const SOL_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PXX is ERC20, Ownable {

    uint256 public tokenPrice = 0.001 ether; // price per token in ETH
    address public treasury;

    constructor(address _treasury) ERC20("Platinum Xtreme Xchange", "PXX") {
        treasury = _treasury;
        _mint(msg.sender, 1000000000 * 10 ** decimals()); // 1B supply
    }

    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");

        uint256 amountToBuy = (msg.value / tokenPrice) * 10 ** decimals();

        require(balanceOf(owner()) >= amountToBuy, "Not enough tokens left");

        _transfer(owner(), msg.sender, amountToBuy);

        payable(treasury).transfer(msg.value);
    }

    function setPrice(uint256 _newPrice) external onlyOwner {
        tokenPrice = _newPrice;
    }
}`;

const PXX_ABI = [
  "constructor(address _treasury)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function buyTokens() payable",
  "function tokenPrice() view returns (uint256)",
  "function treasury() view returns (address)",
  "function setPrice(uint256 _newPrice)"
];

interface Profile {
  full_name: string;
  balance: number;
  profit: number;
  role: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  currency?: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Tabs: overview, wallet (XChange), staking, bot-terminal, governance, contract
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'staking' | 'bot-terminal' | 'governance' | 'contract'>('overview');

  const [depositAmount, setDepositAmount] = useState('');

  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [loading, setLoading] = useState(true);

  // Web3 States
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0.0');
  const [pxxAddressInput, setPxxAddressInput] = useState('0x5FbDB2315678afecb367f032d93F642f64180aa3'); // Hardhat local address
  const [web3PxxBalance, setWeb3PxxBalance] = useState('12500.00'); // Initial mock balance, updates dynamically
  const [, setIsWeb3Loading] = useState(false);

  // Buy PXX token inputs
  const [ethToBuy, setEthToBuy] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isProcessingTx, setIsProcessingTx] = useState(false);

  // Staking States
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeTerm, setStakeTerm] = useState<'30' | '90' | '180'>('90');
  const [stakedBalance, setStakedBalance] = useState(5000);
  const [liveStakingRewards, setLiveStakingRewards] = useState(320.45);
  const [activeStakes, setActiveStakes] = useState([
    { id: 1, amount: 3000, term: 90, apy: 18.5, date: '2026-05-15', status: 'Active' },
    { id: 2, amount: 2000, term: 30, apy: 12.0, date: '2026-06-01', status: 'Active' }
  ]);

  // Governance proposals
  const [proposals, setProposals] = useState([
    { id: 'PXX-01', title: 'Transition treasury management to Arbitrum Layer-2', desc: 'Deploy 40% of our ecosystem treasury to Arbitrum liquidity pools to lower gas costs and increase trade speeds.', votesYes: 452000, votesNo: 120000, status: 'Active', voterChoice: null as string | null },
    { id: 'PXX-02', title: 'Increase base staking rewards from 18.5% to 21.0% APY', desc: 'Adjust parameters in the staking distributor to reward long-term community members and bootstrap token liquidity.', votesYes: 820500, votesNo: 45000, status: 'Active', voterChoice: null as string | null },
    { id: 'PXX-03', title: 'Integrate Chainlink CCIP for cross-chain PXX transfers', desc: 'Enable native cross-chain mint/burn mechanics using Chainlink\'s secure interoperability protocol.', votesYes: 910000, votesNo: 5000, status: 'Completed', voterChoice: 'Yes' as string | null }
  ]);

  // Bot Terminal States
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [botCapital, setBotCapital] = useState('');
  const [botSource, setBotSource] = useState<'balance' | 'profit'>('balance');
  const [botStrategy, setBotStrategy] = useState('institutional');
  const [botLoss, setBotLoss] = useState(0);
  const [botProfit, setBotProfit] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [botLogs, setBotLogs] = useState<string[]>([
    "[SYSTEM] System ready. Select strategy and capital source to deploy."
  ]);
  const [liveChartData, setLiveChartData] = useState<{ time: string, price: number }[]>([
    { time: '10:00', price: 1.0840 },
    { time: '10:01', price: 1.0842 },
    { time: '10:02', price: 1.0839 },
    { time: '10:03', price: 1.0841 },
    { time: '10:04', price: 1.0845 },
  ]);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');

  const WALLET_ADDRESSES: Record<string, string> = {
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    USDT: 'TN2Y6hYKZqXr1LqKTGcUmFZePBmMKbHMWi',
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchProfile();
      fetchTransactions();
    }
  }, [user, authLoading]);

  // Live Trading Engine Simulator
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isBotRunning) {
      setBotLogs(prev => [
        ...prev,
        `[SYSTEM] Bot deployed using ${botSource === 'balance' ? 'Account Balance' : 'Accumulated Profit'}.`,
        `[SYSTEM] Strategy: ${botStrategy.toUpperCase()}`,
        `[CONNECT] Connecting to Frankfurt LD4 High-Frequency FX Gateway...`,
        `[CONNECT] Connection secured. Current latency: 0.8ms.`
      ]);

      let step = 0;
      interval = setInterval(() => {
        const profitGained = Math.random() * 30 + 15;
        setBotProfit(prev => prev + profitGained);
        setTotalTrades(prev => prev + 1);

        const logTemplate = MOCK_LOGS[step % MOCK_LOGS.length];
        setBotLogs(prev => {
          const next = [...prev, `[${new Date().toLocaleTimeString()}] ${logTemplate}`];
          if (next.length > 50) next.shift();
          return next;
        });

        setLiveChartData(prev => {
          const lastPrice = prev[prev.length - 1].price;
          const delta = (Math.random() - 0.48) * 0.0008;
          const nextPrice = parseFloat((lastPrice + delta).toFixed(5));
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const nextData = [...prev, { time: nowStr, price: nextPrice }];
          if (nextData.length > 15) nextData.shift();
          return nextData;
        });

        step++;
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBotRunning, botSource, botStrategy]);

  // Chat Simulator Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const randomUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatMessages(prev => [
          ...prev,
          {
            sender: randomUser.sender,
            message: randomUser.message,
            time: nowStr,
            badge: randomUser.badge
          }
        ]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Staking live rewards ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveStakingRewards(prev => {
        const activeStakedAmount = stakedBalance;
        // APY based on selected term: 30d (12%), 90d (18.5%), 180d (25%). Let's estimate 18.5% average
        const rewardPerSec = (activeStakedAmount * 0.185) / (365 * 24 * 3600);
        return prev + rewardPerSec;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stakedBalance]);

  // Web3 Connection handler
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        setIsWeb3Loading(true);
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        const web3Signer = await browserProvider.getSigner();
        const address = accounts[0];
        
        setProvider(browserProvider);
        setSigner(web3Signer);
        setWalletAddress(address);
        setWalletConnected(true);
        
        // Fetch ETH balance
        const balanceBigInt = await browserProvider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceBigInt);
        setEthBalance(parseFloat(balanceEth).toFixed(4));
        
        // Fetch PXX balance from contract
        await fetchPxxContractBalance(address, browserProvider);
        
        toast.success("Web3 Wallet Connected!");
      } catch (err: any) {
        console.error("Wallet connection error:", err);
        toast.error("Failed to connect wallet: " + (err.message || err));
      } finally {
        setIsWeb3Loading(false);
      }
    } else {
      // Fallback Demo Mode
      setIsWeb3Loading(true);
      setTimeout(() => {
        setWalletAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        setEthBalance("12.4500");
        setWalletConnected(true);
        setWeb3PxxBalance("12,500.00");
        setIsWeb3Loading(false);
        toast.success("Connected via Demo Wallet Simulator");
      }, 1000);
    }
  };

  const fetchPxxContractBalance = async (address: string, currentProvider: any) => {
    if (!pxxAddressInput || !ethers.isAddress(pxxAddressInput)) return;
    try {
      const contract = new ethers.Contract(pxxAddressInput, PXX_ABI, currentProvider);
      const bal = await contract.balanceOf(address);
      const decimals = await contract.decimals().catch(() => 18);
      const formatted = ethers.formatUnits(bal, decimals);
      setWeb3PxxBalance(parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 2 }));
    } catch (err) {
      console.warn("Failed to fetch balance from real contract, keeping simulated state:", err);
    }
  };

  // Buy PXX Tokens
  const buyPxxTokens = async () => {
    if (!ethToBuy || parseFloat(ethToBuy) <= 0) {
      toast.error("Enter a valid ETH amount");
      return;
    }
    
    setIsProcessingTx(true);
    setTxStatus("Initiating wallet transaction...");
    setTxHash("");
    
    if (walletConnected && provider && signer && pxxAddressInput && ethers.isAddress(pxxAddressInput) && (window as any).ethereum) {
      try {
        const contract = new ethers.Contract(pxxAddressInput, PXX_ABI, signer);
        const tx = await contract.buyTokens({
          value: ethers.parseEther(ethToBuy)
        });
        
        setTxStatus("Confirming block inclusion...");
        setTxHash(tx.hash);
        
        await tx.wait();
        
        toast.success("Tokens purchased on-chain successfully!");
        setTxStatus("Tokens Purchased!");
        
        // Refresh balance
        const balanceBigInt = await provider.getBalance(walletAddress);
        setEthBalance(parseFloat(ethers.formatEther(balanceBigInt)).toFixed(4));
        await fetchPxxContractBalance(walletAddress, provider);
        setEthToBuy('');
      } catch (err: any) {
        console.error("Purchase error:", err);
        toast.error("Transaction failed: " + (err.reason || err.message || err));
        setTxStatus("Failed: " + (err.reason || err.message || "Error"));
      } finally {
        setIsProcessingTx(false);
      }
    } else {
      // Demo Simulator Mode
      setTimeout(() => {
        setTxStatus("Confirming on blockchain (Simulated)...");
        setTimeout(() => {
          setWeb3PxxBalance(prev => {
            const current = parseFloat(prev.replace(/,/g, '')) || 0;
            const purchased = parseFloat(ethToBuy) / 0.001; // 1 PXX = 0.001 ETH
            return (current + purchased).toLocaleString('en-US', { minimumFractionDigits: 2 });
          });
          
          setEthBalance(prev => {
            const current = parseFloat(prev) || 0;
            return (current - parseFloat(ethToBuy)).toFixed(4);
          });
          
          setTxHash("0x8e5b4f8d6d5c6b9e2a7f5d6c9b3a0e1f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f");
          setTxStatus("Tokens Purchased!");
          toast.success(`Demo Mode: Purchased ${(parseFloat(ethToBuy) / 0.001).toLocaleString()} PXX!`);
          setIsProcessingTx(false);
          setEthToBuy('');
        }, 2000);
      }, 1000);
    }
  };

  // Staking handler
  const handleStake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount to stake");
      return;
    }
    const amount = parseFloat(stakeAmount);
    const pxxBalNum = parseFloat(web3PxxBalance.replace(/,/g, ''));
    if (amount > pxxBalNum) {
      toast.error("Insufficient PXX balance");
      return;
    }

    // Subtract from balance, add to staked
    setWeb3PxxBalance(() => (pxxBalNum - amount).toLocaleString('en-US', { minimumFractionDigits: 2 }));
    setStakedBalance(prev => prev + amount);
    
    // Add to active stakes list
    const termDays = parseInt(stakeTerm);
    const apy = termDays === 30 ? 12.0 : termDays === 90 ? 18.5 : 25.0;
    const newStake = {
      id: Date.now(),
      amount,
      term: termDays,
      apy,
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setActiveStakes(prev => [newStake, ...prev]);
    setStakeAmount('');
    toast.success(`Successfully staked ${amount.toLocaleString()} PXX!`);
  };

  // DAO voting handler
  const handleVote = (propId: string, choice: 'Yes' | 'No') => {
    setProposals(prev => prev.map(p => {
      if (p.id === propId) {
        if (p.voterChoice) {
          toast.error("You have already voted on this proposal");
          return p;
        }
        const weight = parseFloat(web3PxxBalance.replace(/,/g, '')) || 1000;
        toast.success(`Voted ${choice} with ${weight.toLocaleString()} voting power!`);
        return {
          ...p,
          voterChoice: choice,
          votesYes: choice === 'Yes' ? p.votesYes + weight : p.votesYes,
          votesNo: choice === 'No' ? p.votesNo + weight : p.votesNo
        };
      }
      return p;
    }));
  };

  // Faucet handler
  const mintFaucet = () => {
    if (!walletConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    setWeb3PxxBalance(prev => {
      const current = parseFloat(prev.replace(/,/g, '')) || 0;
      return (current + 5000).toLocaleString('en-US', { minimumFractionDigits: 2 });
    });
    toast.success("Minted 5,000 PXX mock tokens to your wallet!");
  };

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      
      const isAyad = user?.email?.trim().toLowerCase() === 'fadelayad21@gmail.com' || 
                     user?.user_metadata?.full_name?.toLowerCase().includes('ayad fadel');
      const isIrene = user?.email?.trim().toLowerCase() === 'irene-hellstern@t-online.de' ||
                     user?.user_metadata?.full_name?.toLowerCase().includes('irene hellstern');

      if (error) {
        console.error('Profile fetch error:', error);
        if (isAyad || isIrene) throw new Error('Supabase fetch error');
        setProfile(null);
      } else if (data) {
        if (isAyad) {
          setProfile({
            ...data,
            balance: 21000,
            profit: 162000,
            full_name: data.full_name || 'Ayad Fadel'
          });
        } else if (isIrene) {
          setProfile({
            ...data,
            balance: 67000,
            profit: 215000,
            full_name: data.full_name || 'Irene Hellstern'
          });
        } else {
          setProfile(data);
        }
      } else if (isAyad || isIrene) {
        throw new Error('No profile data found');
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn('Error fetching profile, using fallback:', err);
      const isAyad = user?.email?.trim().toLowerCase() === 'fadelayad21@gmail.com' || 
                     user?.user_metadata?.full_name?.toLowerCase().includes('ayad fadel');
      const isIrene = user?.email?.trim().toLowerCase() === 'irene-hellstern@t-online.de' ||
                     user?.user_metadata?.full_name?.toLowerCase().includes('irene hellstern');
      if (isAyad) {
        setProfile({
          full_name: user?.user_metadata?.full_name || 'Ayad Fadel',
          balance: 21000,
          profit: 162000,
          role: 'user'
        });
      } else if (isIrene) {
        setProfile({
          full_name: user?.user_metadata?.full_name || 'Irene Hellstern',
          balance: 67000,
          profit: 215000,
          role: 'user'
        });
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) console.error('Transactions fetch error:', error);
      if (data) setTransactions(data);
    } catch (err) {
      console.warn('Failed to fetch transactions:', err);
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Enter a valid deposit amount');
      return;
    }
    try {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'deposit',
        amount: parseFloat(depositAmount),
        status: 'pending',
        currency: selectedCrypto,
      });
      toast.success('Deposit request submitted! Send crypto to the address below.');
      setDepositAmount('');
      fetchTransactions();
    } catch {
      toast.error('Failed to submit deposit');
    }
  };



  const handleDeployBot = () => {
    if (isBotRunning) {
      setIsBotRunning(false);
      const net = botProfit - botLoss;
      setProfile(prev => {
        if (!prev) return null;
        const newBalance = botSource === 'balance' ? prev.balance + botProfit : prev.balance;
        const newProfit = botSource === 'profit' ? prev.profit + net : prev.profit + net;
        return { ...prev, balance: newBalance, profit: newProfit };
      });
      toast.success(`Quant bot stopped. Net profit €${(botProfit - botLoss).toFixed(2)} credited!`);
      setBotProfit(0);
      setBotLoss(0);
      setBotCapital('');
    } else {
      if (!botCapital || parseFloat(botCapital) <= 0) {
        toast.error('Please enter a valid capital amount.');
        return;
      }
      const cap = parseFloat(botCapital);
      if (botSource === 'balance' && cap > (profile?.balance ?? 0)) {
        toast.error('Insufficient funds in Account Balance.');
        return;
      }
      if (botSource === 'profit' && cap > (profile?.profit ?? 0)) {
        toast.error('Insufficient funds in Accumulated Profit.');
        return;
      }

      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          balance: botSource === 'balance' ? prev.balance - cap : prev.balance,
          profit: botSource === 'profit' ? prev.profit - cap : prev.profit,
        };
      });

      setIsBotRunning(true);
      toast.success('PXX Algorithmic Quant Terminal deployed successfully!');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      {
        sender: profile?.full_name || 'Investor',
        message: chatInput,
        time: nowStr,
        badge: 'You'
      }
    ]);
    setChatInput('');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pxxTotal = parseFloat(web3PxxBalance.replace(/,/g, '')) + stakedBalance + liveStakingRewards;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar Panel */}
      <div className="w-full md:w-64 bg-slate-900/60 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col shrink-0 relative z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Coins size={22} className="text-slate-950 font-bold" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">PXX</h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Xtreme Xchange</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: Landmark },
            { id: 'wallet', label: 'Wallet & Buy', icon: Wallet },
            { id: 'staking', label: 'Staking Pool', icon: Flame },
            { id: 'bot-terminal', label: 'Quant Terminal', icon: Cpu },
            { id: 'governance', label: 'Governance', icon: Users },
            { id: 'contract', label: 'Smart Contract', icon: Code2 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                  ${active 
                    ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/5 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'}`}
              >
                <Icon size={16} className={active ? 'text-amber-400' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Network</p>
              <p className="text-xs font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                SEPOLIA TESTNET
              </p>
            </div>
            <Link2 size={14} className="text-slate-500" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3.5 mb-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                WELCOME, <span className="text-gradient-gold italic font-serif uppercase">{(profile?.full_name || 'Investor')}</span>
              </h1>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] text-amber-400 font-bold uppercase tracking-widest">Elite Portfolio</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
              {profile?.full_name?.toLowerCase().includes('ayad') ? 'GF-99284 • PRESTIGE PARTNER' : 'PLATINUM MEMBERSHIP ACCESS'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {walletConnected ? (
              <div className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-500 uppercase font-mono leading-none">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</p>
                  <p className="text-xs font-black text-white font-mono mt-0.5">{ethBalance} ETH</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-amber-500/20"
              >
                Connect Wallet
              </button>
            )}

            <div className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl hidden sm:block">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Security Feed</p>
              <p className="text-xs font-black text-emerald-400 tracking-tighter mt-0.5 flex items-center gap-1.5">
                <ShieldCheck size={12} /> SECURED
              </p>
            </div>
          </div>
        </div>

        {/* Global Market Ticker Banner */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 mb-8 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LIVE DATA FEED</span>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="text-slate-400">PXX / USDT</span>
              <span className="text-amber-400 font-mono">$0.8500</span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+2.40%</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="text-slate-400">ETH / USDT</span>
              <span className="text-white font-mono">$3,450.25</span>
              <span className="text-red-400 font-mono text-[10px] font-bold bg-red-500/10 px-1.5 py-0.5 rounded">-0.15%</span>
            </div>
          </div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">GATEWAY: NY-PROD-01.PXX</p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              icon: Landmark,
              label: 'Total Managed Portfolio',
              value: `€${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              sub: `Profit Account: €${(profile?.profit ?? 0).toLocaleString()}`,
              color: 'text-amber-400'
            },
            {
              icon: Wallet,
              label: 'Web3 Wallet PXX',
              value: `${parseFloat(web3PxxBalance.replace(/,/g, '')).toLocaleString()} PXX`,
              sub: walletConnected ? 'On-Chain Ledger Balanced' : 'Demo State (Connect Wallet)',
              color: 'text-yellow-400'
            },
            {
              icon: Flame,
              label: 'Staking Rewards (Live)',
              value: `${liveStakingRewards.toFixed(4)} PXX`,
              sub: `Principal Staked: ${stakedBalance.toLocaleString()} PXX`,
              color: 'text-orange-400',
              live: true
            },
            {
              icon: Coins,
              label: 'Total Ecosystem Assets',
              value: `${pxxTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })} PXX`,
              sub: `Estimated: $${(pxxTotal * 0.85).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`,
              color: 'text-blue-400'
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                  <stat.icon size={20} className={stat.live ? 'animate-pulse' : ''} />
                </div>
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <div className="text-2xl md:text-3xl font-black font-sans tracking-tighter text-white font-mono">{stat.value}</div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium tracking-wide">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Performance Chart */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 font-sans">
                      <BarChart3 size={20} className="text-amber-400" /> Portfolio Performance & Asset Projection
                    </h2>
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">QUANT APY PROJECTION</span>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v/1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px' }}
                          itemStyle={{ color: '#fbbf24' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Allocation Card */}
                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
                    <h2 className="text-base font-bold mb-6 flex items-center gap-2">
                      <PieChartIcon className="text-amber-400" size={18} /> Asset Allocation
                    </h2>
                    <div className="h-[180px] w-full mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ALLOCATION_DATA}
                            innerRadius={50}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {ALLOCATION_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5">
                      {ALLOCATION_DATA.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-400 font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-white">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Program Plans */}
                  <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                        <Landmark className="text-amber-400" size={18} /> Account Plan Tier Status
                      </h2>
                      <p className="text-xs text-slate-400 leading-relaxed mb-6">
                        Your account leverages PXX’s premier digital asset framework. Elevate your allocation to unlock higher-tier simulation staking incentives, strategic DAO governance weights, and quant scalper leverage.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {[
                          { name: 'Starter Plan', price: '$250', desc: 'Basic access & testnet rewards', active: false },
                          { name: 'Growth Plan', price: '$5,000+', desc: 'Full simulated ecosystem APY', active: !profile?.full_name?.toLowerCase().includes('irene') },
                          { name: 'Platinum Plan', price: '$100,000+', desc: 'VIP DAO weight & concierge', active: !!profile?.full_name?.toLowerCase().includes('irene') },
                        ].map((plan, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl border text-center relative overflow-hidden flex flex-col justify-between h-36
                            ${plan.active 
                              ? 'border-amber-500/50 bg-amber-500/5' 
                              : 'border-slate-800 bg-slate-950/40 opacity-70'}`}
                          >
                            {plan.active && (
                              <div className="absolute top-2 right-2">
                                <span className="w-2 h-2 bg-amber-400 rounded-full flex animate-ping"></span>
                              </div>
                            )}
                            <div>
                              <h3 className="text-xs font-bold text-white">{plan.name}</h3>
                              <p className="text-xs font-black text-amber-400 font-mono mt-1">{plan.price}</p>
                            </div>
                            <p className="text-[9px] text-slate-500 leading-tight font-medium mt-2">{plan.desc}</p>
                            <span className={`text-[8px] font-bold uppercase tracking-wider py-1 rounded mt-2 block
                              ${plan.active ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                              {plan.active ? 'Active Plan' : 'Select'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('wallet')}
                      className="w-full py-3.5 bg-slate-800 border border-slate-700 hover:bg-slate-700/60 transition rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Configure Portfolio Allocation <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <Clock size={18} className="text-amber-400" />
                    <h2 className="text-base font-bold">Recent Transaction Logs</h2>
                  </div>
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-xs">No transactions logged for this profile.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {transactions.map(tx => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-900/30 transition text-xs">
                          <div className="flex items-center gap-3">
                            {tx.type === 'deposit' ? (
                              <ArrowDownCircle size={18} className="text-amber-400" />
                            ) : (
                              <ArrowUpCircle size={18} className="text-blue-400" />
                            )}
                            <div>
                              <div className="font-bold capitalize">{tx.type}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(tx.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold font-mono">€{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                              tx.status === 'approved' || tx.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {tx.status === 'approved' || tx.status === 'completed' ? <CheckCircle size={10} /> :
                               tx.status === 'pending' ? <Clock size={10} /> :
                               <XCircle size={10} />}
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WALLET / XCHANGE TAB */}
            {activeTab === 'wallet' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Swap / Purchase Form */}
                <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <ArrowRightLeft className="text-amber-400" size={20} /> PXX Token Utility XChange
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Acquire PXX Tokens directly from the exchange contract using Ethereum (ETH). If no Web3 provider is detected, the transaction will automatically run in realistic simulator mode.
                  </p>

                  <div className="space-y-6">
                    {/* Contract Address Config */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">PXX ERC20 Smart Contract Address</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pxxAddressInput}
                          onChange={e => setPxxAddressInput(e.target.value)}
                          placeholder="0x..."
                          className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
                        />
                        {walletConnected && (
                          <button
                            onClick={() => fetchPxxContractBalance(walletAddress, provider)}
                            className="px-4 py-3 bg-slate-800 text-xs font-bold uppercase rounded-xl border border-slate-700 hover:bg-slate-700 transition"
                          >
                            Reload
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Swap Interface Card */}
                    <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-4">
                      {/* ETH Input */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pay Amount</span>
                          <span className="text-[10px] text-slate-500">Balance: {ethBalance} ETH</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={ethToBuy}
                            onChange={e => setEthToBuy(e.target.value)}
                            placeholder="0.0"
                            min="0.001"
                            step="0.01"
                            className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white text-lg font-bold font-mono placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">ETH</span>
                        </div>
                      </div>

                      {/* Convert Divider Icon */}
                      <div className="flex justify-center -my-2 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-amber-400 shadow-md">
                          <ArrowRightLeft size={14} className="rotate-90" />
                        </div>
                      </div>

                      {/* PXX Receive Estimate */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receive Amount (Estimated)</span>
                          <span className="text-[10px] text-slate-500 font-mono">Rate: 1 PXX = 0.001 ETH</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={ethToBuy ? (parseFloat(ethToBuy) / 0.001).toLocaleString() : '0.00'}
                            disabled
                            className="w-full px-5 py-4 bg-slate-900/60 border border-slate-800 rounded-xl text-amber-400 text-lg font-bold font-mono"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">PXX</span>
                        </div>
                      </div>
                    </div>

                    {/* Swap Action Buttons */}
                    <div className="flex gap-4">
                      {!walletConnected && (
                        <button
                          onClick={connectWallet}
                          className="flex-1 py-4 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition"
                        >
                          Connect Web3 Wallet
                        </button>
                      )}

                      <button
                        onClick={buyPxxTokens}
                        disabled={isProcessingTx || !ethToBuy}
                        className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg
                          ${isProcessingTx || !ethToBuy
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:scale-[1.01] active:scale-95 shadow-amber-500/10'}`}
                      >
                        {isProcessingTx ? 'Processing Swap...' : 'Execute Buy Contract Call'}
                      </button>
                    </div>

                    {/* Transaction Status Box */}
                    {txStatus && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${
                            txStatus.includes('Purchased') ? 'bg-emerald-500' : txStatus.includes('Failed') ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
                          }`}></div>
                          <span className="text-xs font-black uppercase text-slate-300">{txStatus}</span>
                        </div>
                        {txHash && (
                          <div className="text-[10px] text-slate-500 font-mono break-all flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-850">
                            <span>Hash:</span>
                            <span className="text-amber-500/80">{txHash}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(txHash);
                                toast.success("TX Hash copied!");
                              }}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Wallet Info Column */}
                <div className="space-y-8">
                  {/* Web3 Faucet */}
                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
                    <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                      <Coins className="text-amber-400 animate-bounce" size={18} /> PXX Dev Faucet
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      Running on testnet or sandbox? Instantly mint 5,000 mock PXX tokens to test exchange utility and staking pools.
                    </p>
                    <button
                      onClick={mintFaucet}
                      className="w-full py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition rounded-xl text-xs font-bold uppercase tracking-widest"
                    >
                      Mint 5,000 PXX
                    </button>
                  </div>

                  {/* Off-Chain Deposit panel */}
                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
                    <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                      <ArrowDownCircle className="text-amber-400" size={18} /> Fiat Asset Deposit (Off-Chain)
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cryptocurrency Network</label>
                        <div className="flex gap-1.5">
                          {Object.keys(WALLET_ADDRESSES).map(c => (
                            <button
                              key={c}
                              onClick={() => setSelectedCrypto(c)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
                                ${selectedCrypto === c ? 'bg-amber-500/25 border border-amber-500/40 text-amber-400' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Deposit Amount (EUR)</label>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          placeholder="€0.00"
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-850">
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Network Wallet Destination Address</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-[10px] text-amber-400/90 break-all font-mono">{WALLET_ADDRESSES[selectedCrypto]}</code>
                          <button onClick={() => { navigator.clipboard.writeText(WALLET_ADDRESSES[selectedCrypto]); toast.success('Address copied!'); }} className="p-1.5 text-slate-400 hover:text-white transition">
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleDeposit}
                        className="w-full py-3 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition"
                      >
                        Submit Deposit Notice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAKING POOL TAB */}
            {activeTab === 'staking' && (
              <div className="space-y-8">
                {/* Stats panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border border-amber-500/20">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Staked Principal</p>
                    <p className="text-3xl font-black text-white font-mono">{stakedBalance.toLocaleString()} PXX</p>
                    <p className="text-xs text-amber-400/80 mt-1 font-semibold">Active lock duration: Varied APY</p>
                  </div>
                  
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-600/5 border border-orange-500/20">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Accrued Rewards (Ticking)</p>
                    <p className="text-3xl font-black text-orange-400 font-mono">{liveStakingRewards.toFixed(6)} PXX</p>
                    <p className="text-xs text-orange-300/60 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></span> Live Accruing Second-by-Second
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Average Staking Yield</p>
                    <p className="text-3xl font-black text-white font-mono">18.5% APY</p>
                    <p className="text-xs text-slate-500 mt-1">Ecosystem pool total locked: 1.2M PXX</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Staking Form */}
                  <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                      <Flame className="text-amber-400" size={20} /> Deploy Tokens into Staking Pool
                    </h2>

                    <form onSubmit={handleStake} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Select Staking Lock Duration</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { term: '30', label: '30 Days', apy: '12.0% APY' },
                            { term: '90', label: '90 Days', apy: '18.5% APY' },
                            { term: '180', label: '180 Days', apy: '25.0% APY' }
                          ].map(t => (
                            <button
                              key={t.term}
                              type="button"
                              onClick={() => setStakeTerm(t.term as any)}
                              className={`p-4 rounded-2xl border text-center transition-all flex flex-col justify-center items-center gap-1
                                ${stakeTerm === t.term 
                                  ? 'border-amber-500/50 bg-amber-500/5 text-white' 
                                  : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-800'}`}
                            >
                              <span className="text-sm font-black">{t.label}</span>
                              <span className="text-[10px] text-amber-400 font-bold font-mono">{t.apy}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Staking Amount (PXX)</label>
                          <span className="text-xs text-slate-400 font-medium font-mono">Available: {parseFloat(web3PxxBalance.replace(/,/g, '')).toLocaleString()} PXX</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={stakeAmount}
                            onChange={e => setStakeAmount(e.target.value)}
                            placeholder="0.00"
                            min="10"
                            className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-lg font-bold font-mono placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => setStakeAmount(Math.floor(parseFloat(web3PxxBalance.replace(/,/g, '')) || 0).toString())}
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] uppercase rounded-lg hover:text-white transition"
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition shadow-lg shadow-amber-500/10"
                      >
                        Confirm Staking Lock deployment
                      </button>
                    </form>
                  </div>

                  {/* Active Stakes locks */}
                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
                    <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                      <Clock className="text-amber-400" size={18} /> Active Lock Ledgers
                    </h3>
                    
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
                      {activeStakes.map(s => (
                        <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white font-mono">{s.amount.toLocaleString()} PXX</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">Staked on: {s.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-[9px] font-mono rounded">
                              {s.apy}% APY
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-bold font-mono">{s.term} Days lock</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QUANT BOT TERMINAL TAB */}
            {activeTab === 'bot-terminal' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Bot Control Card */}
                  <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-amber-400">
                        <Settings size={20} className={isBotRunning ? 'animate-spin-slow text-amber-400' : 'text-slate-400'} /> Quant Engine config
                      </h2>

                      {/* Fund Source Selection */}
                      <div className="mb-6">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Capital Funding Source</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => !isBotRunning && setBotSource('balance')}
                            disabled={isBotRunning}
                            className={`p-4 rounded-2xl border text-left transition ${
                              botSource === 'balance'
                                ? 'border-amber-500/50 bg-amber-500/5 text-white'
                                : 'border-slate-805 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Balance</div>
                            <div className="text-lg font-black mt-1 text-white font-mono">€{(profile?.balance ?? 0).toLocaleString()}</div>
                          </button>

                          <button
                            onClick={() => !isBotRunning && setBotSource('profit')}
                            disabled={isBotRunning}
                            className={`p-4 rounded-2xl border text-left transition ${
                              botSource === 'profit'
                                ? 'border-amber-500/50 bg-amber-500/5 text-white'
                                : 'border-slate-805 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Profit</div>
                            <div className="text-lg font-black mt-1 text-white font-mono">€{(profile?.profit ?? 0).toLocaleString()}</div>
                          </button>
                        </div>
                      </div>

                      {/* Strategy Selection */}
                      <div className="mb-6">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Algorithmic Strategy</label>
                        <select
                          value={botStrategy}
                          onChange={e => setBotStrategy(e.target.value)}
                          disabled={isBotRunning}
                          className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="institutional">PXX Neural HFT (Zero-Loss)</option>
                          <option value="hft">Orderbook Micro-Scalper (High Volatility)</option>
                          <option value="grid">Grid Oscillating Quant (Conservative)</option>
                        </select>
                      </div>

                      {/* Capital Input */}
                      <div className="mb-8">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Allocation Capital (EUR)</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
                          <input
                            type="number"
                            value={botCapital}
                            onChange={e => setBotCapital(e.target.value)}
                            disabled={isBotRunning}
                            placeholder="Enter amount to deploy"
                            className="w-full pl-10 pr-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-800 focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        {!isBotRunning && (
                          <div className="flex gap-2 mt-3">
                            {[0.25, 0.5, 0.75, 1.0].map((pct, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  const base = botSource === 'balance' ? (profile?.balance ?? 0) : (profile?.profit ?? 0);
                                  setBotCapital(Math.floor(base * pct).toString());
                                }}
                                className="flex-1 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-500 hover:border-slate-700 hover:text-white transition"
                              >
                                {pct * 100}%
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deploy Button */}
                    <button
                      onClick={handleDeployBot}
                      className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl
                        ${isBotRunning 
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'}`}
                    >
                      {isBotRunning ? (
                        <>
                          <Square size={14} fill="white" /> Terminate Quant Terminal
                        </>
                      ) : (
                        <>
                          <Play size={14} fill="currentColor" /> Deploy Neural Bot
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bot Live Forex Chart */}
                  <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold flex items-center gap-2 font-sans text-amber-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span> Live Quant Feed (M1)
                        </h2>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active profit</div>
                            <div className="text-lg font-black text-amber-400 font-mono">
                              +€{botProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Trades</div>
                            <div className="text-lg font-black text-white font-mono">{totalTrades}</div>
                          </div>
                        </div>
                      </div>

                      <div className="h-[230px] w-full mb-4 font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={liveChartData}>
                            <defs>
                              <linearGradient id="colorValueLive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                            <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(4)} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                              labelStyle={{ color: '#64748b' }}
                              itemStyle={{ color: '#fbbf24' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorValueLive)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
                      <span>Gateway: Frankfurt LD4 High-Frequency Pool</span>
                      <span>Execution Rate: 0.8ms</span>
                      <span>Safety: Failsafe Active</span>
                    </div>
                  </div>
                </div>

                {/* Logs & Chat Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Bot System Logs */}
                  <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col h-[320px]">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-300">
                      <Terminal size={14} /> Quant Engine Feed Logs
                    </h3>
                    <div className="flex-1 bg-slate-950/90 border border-slate-850 rounded-2xl p-5 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-2 no-scrollbar">
                      {botLogs.map((log, i) => (
                        <div key={i} className={
                          log.includes('[SYSTEM]') ? 'text-amber-400 font-bold' :
                          log.includes('[CONNECT]') ? 'text-blue-400' :
                          log.includes('realized') ? 'text-emerald-400 font-bold' : 'text-slate-400'
                        }>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lounge chat */}
                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col h-[320px]">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-300">
                      <MessageSquare size={14} /> Investor Lounge Chat
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 no-scrollbar">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          <div className="w-7 h-7 rounded-full bg-slate-805 border border-slate-800 flex items-center justify-center font-bold text-amber-400 shrink-0 uppercase">
                            {msg.sender[0]}
                          </div>
                          <div className="flex-1 bg-slate-950/60 border border-slate-850 rounded-2xl p-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                {msg.sender}
                                {msg.badge && (
                                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${
                                    msg.badge === 'You' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' :
                                    msg.badge === 'Founder' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/10' :
                                    'bg-slate-800 text-slate-400'
                                  }`}>
                                    {msg.badge}
                                  </span>
                                )}
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono">{msg.time}</span>
                            </div>
                            <p className="text-slate-400 font-medium leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Contribute to chat lounge..."
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-700 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* GOVERNANCE TAB */}
            {activeTab === 'governance' && (
              <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
                  <div className="max-w-3xl">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                      <Landmark className="text-amber-400" size={20} /> PXX DAO Governance Console
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      Decentralized governance dictates platform parameters. Cast your consensus on core ecosystem development proposals using your PXX holdings as voting power. 1 PXX = 1 Vote weight.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {proposals.map(prop => {
                      const totalVotes = prop.votesYes + prop.votesNo;
                      const pctYes = totalVotes > 0 ? (prop.votesYes / totalVotes) * 100 : 0;
                      const pctNo = totalVotes > 0 ? (prop.votesNo / totalVotes) * 100 : 0;
                      const isActive = prop.status === 'Active';

                      return (
                        <div key={prop.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">{prop.id}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  isActive ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {prop.status}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-white mt-2.5">{prop.title}</h3>
                            </div>
                            
                            {/* Voting Buttons */}
                            {isActive && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleVote(prop.id, 'Yes')}
                                  disabled={!!prop.voterChoice}
                                  className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition
                                    ${prop.voterChoice === 'Yes'
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'}`}
                                >
                                  Vote Yes
                                </button>
                                <button
                                  onClick={() => handleVote(prop.id, 'No')}
                                  disabled={!!prop.voterChoice}
                                  className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition
                                    ${prop.voterChoice === 'No'
                                      ? 'bg-red-500/20 border-red-500 text-red-400'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'}`}
                                >
                                  Vote No
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed font-medium">{prop.desc}</p>

                          {/* Progress bar */}
                          <div className="space-y-2 pt-2 border-t border-slate-850">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                              <span>Consensus Yes: {pctYes.toFixed(1)}% ({prop.votesYes.toLocaleString()})</span>
                              <span>Consensus No: {pctNo.toFixed(1)}% ({prop.votesNo.toLocaleString()})</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" style={{ width: `${pctYes}%` }}></div>
                              <div className="h-full bg-slate-700" style={{ width: `${pctNo}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SMART CONTRACT CONSOLE TAB */}
            {activeTab === 'contract' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Solidity Code */}
                  <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold flex items-center gap-2">
                        <Code2 className="text-amber-400" size={18} /> PXX.sol Solidity Source Code
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(SOL_CONTRACT_CODE);
                          toast.success("Contract code copied to clipboard!");
                        }}
                        className="p-2 bg-slate-950 border border-slate-800 hover:text-amber-400 transition text-slate-400 rounded-xl"
                        title="Copy Source Code"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <div className="flex-1 bg-slate-950/80 border border-slate-850 rounded-2xl p-5 font-mono text-[10px] leading-relaxed text-slate-400 overflow-y-auto space-y-2 no-scrollbar">
                      <pre className="text-left select-all whitespace-pre-wrap">{SOL_CONTRACT_CODE}</pre>
                    </div>
                  </div>

                  {/* Right Column: Interaction Sandbox */}
                  <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Settings className="text-amber-400" size={18} /> Contract Read Sandbox
                    </h3>
                    
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Token Identifier</span>
                        <span className="font-bold text-white font-mono mt-1 block">Platinum Xtreme Xchange (PXX)</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Contract Decimals</span>
                        <span className="font-bold text-white font-mono mt-1 block">18 Decimals</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Token Supply</span>
                        <span className="font-bold text-white font-mono mt-1 block">1,000,000,000 PXX</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Contract Token Price</span>
                        <span className="font-bold text-amber-400 font-mono mt-1 block">0.001 ETH ($3.45 USD equivalent)</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Treasury Recipient Address</span>
                        <span className="text-[10px] text-white font-mono mt-1 block truncate">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={16} />
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        To interact with this contract on-chain, deploy the code to a network like Sepolia, paste the resulting address into the Wallet configuration inputs, and connect your Metamask wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
