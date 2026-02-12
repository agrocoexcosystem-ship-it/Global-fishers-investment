
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
  role: 'user' | 'admin' | 'support' | 'finance' | 'super_admin';
  admin_role?: 'user' | 'admin' | 'support' | 'finance' | 'super_admin';
  balance: number;
  profit: number;
  created_at: string;
  kyc_status?: 'pending' | 'verified' | 'rejected' | 'unverified' | 'suspended';
  risk_score?: number;
  is_frozen?: boolean;
  two_factor_enabled?: boolean;
  last_login_ip?: string;
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

// --- NEW ADMIN TYPES ---

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_resource: string;
  details: any;
  ip_address?: string;
  created_at: string;
  profiles?: Profile; // Joined admin profile
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  response_log?: { sender: string; message: string; date: string }[];
}

export interface FraudAlert {
  id: string;
  user_id: string;
  trigger_rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
  profiles?: Profile;
}

export interface AdminNote {
  id: string;
  target_user_id: string;
  admin_id: string;
  note: string;
  is_private: boolean;
  created_at: string;
  admin_profile?: Profile;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger_event: string;
  conditions: any;
  actions: any;
  is_active: boolean;
  created_at: string;
}

export interface KYCRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
  reviewed_by?: string;
  created_at: string;
  profiles?: Profile;
}
