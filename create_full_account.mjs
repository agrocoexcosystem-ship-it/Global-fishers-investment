import { createClient } from '@supabase/supabase-js';

// Supabase connection (fallback to env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected arguments:
//   node create_full_account.mjs <email> <password> <full_name> <phone> <balance> <profit> <withdrawal>
const [email, password, fullName, phone, balanceStr, profitStr, withdrawalStr] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node create_full_account.mjs <email> <password> <full_name> <phone> <balance> <profit> <withdrawal>');
  process.exit(1);
}
const balance = parseFloat(balanceStr.replace(/,/g, '')) || 0;
const profit = parseFloat(profitStr.replace(/,/g, '')) || 0;
const withdrawal = parseFloat(withdrawalStr.replace(/,/g, '')) || 0;

async function main() {
  // 1️⃣ Sign up the user (Supabase Auth)
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || 'User',
        phone: phone || ''
      }
    }
  });

  if (signUpError) {
    console.error('⚠️ Sign‑up error:', signUpError.message);
    process.exit(1);
  }

  const userId = signUp.user.id;
  console.log('✅ Auth user created – ID:', userId);

  // 2️⃣ Upsert profile with financial data & phone (if column exists)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName,
    phone,
    balance,
    profit,
    role: 'user'
  }, { onConflict: 'id' });

  if (profileError) {
    console.error('⚠️ Profile upsert error:', profileError.message);
    process.exit(1);
  }
  console.log('✅ Profile record inserted/updated');

  // 3️⃣ Record initial deposit transaction (if balance > 0)
  if (balance > 0) {
    const { error: depErr } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount: balance,
      status: 'completed',
      currency: 'EUR'
    });
    if (depErr) console.warn('⚠️ Deposit transaction error:', depErr.message);
    else console.log('💰 Deposit transaction logged');
  }

  // 4️⃣ Record withdrawal transaction (if withdrawal > 0)
  if (withdrawal > 0) {
    const { error: witErr } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'withdrawal',
      amount: withdrawal,
      status: 'completed',
      currency: 'EUR'
    });
    if (witErr) console.warn('⚠️ Withdrawal transaction error:', witErr.message);
    else console.log('🏧 Withdrawal transaction logged');
  }

  console.log('🎉 Account setup complete for', email);
}

main();
