
export interface InvestmentPlan {
  id: string;
  name: string;
  minDeposit: number;
  maxDeposit: number;
  dailyReturn: number;
  durationDays: number;
  totalProfit: number;
  features: string[];
  color: string;
  imageUrl?: string;
}

export interface ActiveInvestment {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  dailyReturn: number;
  startDate: string;
  profitEarned: number;
  daysActive: number;
  totalDuration: number;
}

export interface BotTrade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  pnl: number;
  timestamp: string;
  pips?: number;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  balance: number;
  profit: number;
  created_at: string;
  kyc_status?: 'pending' | 'verified' | 'rejected' | 'unverified' | 'suspended';
  bot_settings?: {
    enabled: boolean;
    strategy: 'AI_OPTIMIZED' | 'AGGRESSIVE' | 'SAFE';
    win_rate: number; // 0-100
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'bonus' | 'bot_trade';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'approved' | 'rejected';
  created_at: string;
  method?: string;
  details?: string;
  rejection_reason?: string;
  profiles?: {
    username?: string;
    email?: string;
  };
}

export interface DBInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  daily_return: number;
  start_date: string;
  end_date: string;
  status: string;
  total_profit: number;
  profiles?: {
    email: string;
    username: string;
  };
}
