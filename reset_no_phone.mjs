import { createClient } from '@supabase/supabase-js';

// Supabase connection (fallback to env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Usage: node reset_no_phone.mjs <email> <balance> <profit>
const [email, balanceStr, profitStr] = process.argv.slice(2);
if (!email) {
  console.error('Usage: node reset_no_phone.mjs <email> <balance> <profit>');
  process.exit(1);
}
const balance = parseFloat(balanceStr?.replace(/,/g, '')) || 0;
const profit = parseFloat(profitStr?.replace(/,/g, '')) || 0;

async function main() {
  // 1️⃣ Ensure a password‑reset email is sent (so the user can set a password)
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {});
  if (resetErr) {
    console.warn('Password‑reset request error (may need service role):', resetErr.message);
  } else {
    console.log('✅ Password‑reset email sent – user should follow the link to set a new password.');
  }

  // 2️⃣ Upsert profile with balance & profit (no phone column)
  const { error: profileErr } = await supabase.from('profiles').upsert(
    { email, balance, profit },
    { onConflict: 'email' }
  );
  if (profileErr) {
    console.error('❌ Profile upsert error:', profileErr.message);
    process.exit(1);
  }
  console.log('✅ Profile updated with balance and profit for', email);

  // 3️⃣ Log an initial deposit transaction (if balance > 0)
  if (balance > 0) {
    const { error: depErr } = await supabase.from('transactions').insert({
      user_id: null, // you may replace with the actual user ID later
      type: 'deposit',
      amount: balance,
      status: 'completed',
      currency: 'EUR'
    });
    if (depErr) console.warn('⚠️ Deposit transaction error:', depErr.message);
    else console.log('💰 Deposit transaction logged');
  }

  // 4️⃣ Log a withdrawal transaction (fixed €7,000 as requested)
  const withdrawal = 7000;
  if (withdrawal > 0) {
    const { error: witErr } = await supabase.from('transactions').insert({
      user_id: null,
      type: 'withdrawal',
      amount: withdrawal,
      status: 'completed',
      currency: 'EUR'
    });
    if (witErr) console.warn('⚠️ Withdrawal transaction error:', witErr.message);
    else console.log('🏧 Withdrawal transaction logged');
  }
}

main();
