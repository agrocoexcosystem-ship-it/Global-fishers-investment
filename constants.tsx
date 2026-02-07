
import React from 'react';
import { InvestmentPlan } from './types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter Tier',
    minDeposit: 250,
    maxDeposit: 5000,
    dailyReturn: 1.5,
    durationDays: 30,
    totalProfit: 45,
    features: ['24/7 Support', 'Fast Withdrawal', 'Risk Management'],
    color: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'bronze',
    name: 'Bronze Growth',
    minDeposit: 5001,
    maxDeposit: 20000,
    dailyReturn: 2.0,
    durationDays: 45,
    totalProfit: 90,
    features: ['Dedicated Manager', 'Market Analysis', 'Priority Support'],
    color: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'silver',
    name: 'Silver Elite',
    minDeposit: 20001,
    maxDeposit: 50000,
    dailyReturn: 2.5,
    durationDays: 60,
    totalProfit: 150,
    features: ['Portfolio Rebalancing', 'Weekly Insights', 'Tax Efficiency'],
    color: 'teal',
    imageUrl: 'https://images.unsplash.com/photo-1518458028434-518f233bc91b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'gold',
    name: 'Gold Wealth',
    minDeposit: 50001,
    maxDeposit: 150000,
    dailyReturn: 3.2,
    durationDays: 90,
    totalProfit: 288,
    features: ['Kenneth Fisher Strategy', 'Institutional Access', 'Private Equity'],
    color: 'yellow',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'platinum',
    name: 'Platinum Plus',
    minDeposit: 150001,
    maxDeposit: 300000,
    dailyReturn: 3.8,
    durationDays: 120,
    totalProfit: 456,
    features: ['Asset Backed Safety', 'Zero Fee Transfers', 'Concierge Service'],
    color: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ad5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'diamond',
    name: 'Diamond Legacy',
    minDeposit: 300001,
    maxDeposit: 600000,
    dailyReturn: 4.5,
    durationDays: 180,
    totalProfit: 810,
    features: ['Hedge Fund Strategies', 'Legacy Planning', 'Custom Portfolio'],
    color: 'indigo',
    imageUrl: 'https://images.unsplash.com/photo-1551970634-747846a548cb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'infinite',
    name: 'Global Fisher Infinite',
    minDeposit: 600001,
    maxDeposit: 1000000,
    dailyReturn: 5.5,
    durationDays: 365,
    totalProfit: 2007,
    features: ['Full Governance', 'Direct Market Access', 'Board Representation'],
    color: 'black',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
  }
];

export const Logo = () => (
  <div className="flex items-center gap-2 group cursor-pointer">
    <div className="logo-3d relative w-10 h-10 flex items-center justify-center">
      <div className="triangle-3d" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-white">
        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
          <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
        </svg>
      </div>
    </div>
    <span className="font-bold text-xl tracking-tighter text-emerald-600">GLOBAL <span className="text-slate-800">FISHERS</span></span>
  </div>
);
