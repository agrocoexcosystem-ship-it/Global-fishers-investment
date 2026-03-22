import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', '%fadel%');
  
  if (data && data.length > 0) {
    const p = data[0];
    console.log(`\nName: ${p.username}\nBalance: $${p.balance}\nDeposited: $${p.total_deposited}\nWithdrawn: $${p.total_withdrawn}\nProfit: $${p.total_profit}\n`);
  } else {
    // If username column fails, try fetching all
    const { data: allData } = await supabase.from('profiles').select('*');
    const user = allData?.find(u => JSON.stringify(u).toLowerCase().includes('fadel'));
    if (user) {
      console.log(`\nFound Record:`, user, `\nBalance: $${user.balance}\nDeposited: $${user.total_deposited}\nWithdrawn: $${user.total_withdrawn}\nProfit: $${user.total_profit}\n`);
    } else {
      console.log("Not found.");
    }
  }
}
check();
