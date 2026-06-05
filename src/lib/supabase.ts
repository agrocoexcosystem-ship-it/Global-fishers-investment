import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fgjwjittfbiztxojjdls.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cIghQM_9HWoCZj0a-VXEQQ_hlRzlrPm';

if (!supabaseUrl || supabaseUrl === 'undefined') {
  console.error('Supabase URL is missing or invalid!');
}

console.log('Supabase Initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
