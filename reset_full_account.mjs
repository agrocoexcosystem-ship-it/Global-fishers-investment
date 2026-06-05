import { createClient } from '@supabase/supabase-js';

// Supabase connection (fallback to env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Usage: node reset_full_account.mjs <email> <balance> <profit> <phone>
const [email, balanceStr, profitStr, phone] = process.argv.slice(2);
if (!email) {
  console.error('Usage: node reset_full_account.mjs <email> <balance> <profit> <phone>');
  process.exit(1);
}
const balance = parseFloat(balanceStr?.replace(/,/g, '')) || 0;
const profit = parseFloat(profitStr?.replace(/,/g, '')) || 0;

async function main() {
  // 1️⃣ Send password‑reset email (Supabase will deliver a magic‑link to the address)
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
    // No redirect needed – the user will follow the emailed link
  });
  if (resetErr) {
    console.warn('⚠️ Password‑reset request error (may require service role):', resetErr.message);
  } else {
    console.log('✅ Password‑reset email sent – user should use the link to set a new password.');
  }

  // 2️⃣ Upsert profile with the requested financial data and phone
  const { error: profileErr } = await supabase.from('profiles').upsert({
    email,
    balance,
    profit,
    phone,
    // Optional: you can also set full_name if needed
  }, { onConflict: 'email' });
  if (profileErr) {
    console.error('❌ Profile upsert error:', profileErr.message);
    process.exit(1);
  }
  console.log('✅ Profile updated with balance, profit and phone for', email);

  // 3️⃣ Record an initial deposit transaction (if balance > 0)
  if (balance > 0) {
    const { error: depErr } = await supabase.from('transactions').insert({
      user_id: null, // will be filled by a trigger or later logic; using email lookup next
      type: 'deposit',
      amount: balance,
      status: 'completed',
      currency: 'EUR',
      // Attach email as a reference if your schema allows it
    });
    if (depErr) console.warn('⚠️ Deposit transaction error:', depErr.message);
    else console.log('💰 Deposit transaction logged');
  }

  // 4️⃣ Record a withdrawal transaction (if profit includes withdrawal amount; here we log 7 000)
  const withdrawalAmount = 7000; // fixed as per request
  if (withdrawalAmount > 0) {
    const { error: witErr } = await supabase.from('transactions').insert({
      user_id: null,
      type: 'withdrawal',
      amount: withdrawalAmount,
      status: 'completed',
      currency: 'EUR'
    });
    if (witErr) console.warn('⚠️ Withdrawal transaction error:', witErr.message);
    else console.log('🏧 Withdrawal transaction logged');
  }
}

main();
