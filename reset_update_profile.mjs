import { createClient } from '@supabase/supabase-js';

// Supabase connection (fallback to env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments: <email> <balance> <profit>
const [email, balanceStr, profitStr] = process.argv.slice(2);
if (!email) {
  console.error('Usage: node reset_update_profile.mjs <email> <balance> <profit>');
  process.exit(1);
}
const balance = parseFloat(balanceStr?.replace(/,/g, '')) || 0;
const profit = parseFloat(profitStr?.replace(/,/g, '')) || 0;

async function main() {
  // 1️⃣ Send password‑reset email (so the user can set a new password)
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {});
  if (resetErr) {
    console.warn('⚠️ Password‑reset request error:', resetErr.message);
  } else {
    console.log('✅ Password‑reset email sent – user should set a new password.');
  }

  // 2️⃣ Find the existing profile row by email
  const { data: existing, error: findErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (findErr) {
    console.error('❌ Could not locate profile for that email:', findErr.message);
    process.exit(1);
  }

  const profileId = existing.id;
  console.log('🔎 Found profile id:', profileId);

  // 3️⃣ Update balance and profit
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ balance, profit })
    .eq('id', profileId);

  if (updateErr) {
    console.error('❌ Profile update failed:', updateErr.message);
    process.exit(1);
  }
  console.log('✅ Profile balance & profit updated.');

  // 4️⃣ Log a deposit transaction (if balance > 0)
  if (balance > 0) {
    const { error: depErr } = await supabase.from('transactions').insert({
      user_id: profileId,
      type: 'deposit',
      amount: balance,
      status: 'completed',
      currency: 'EUR',
    });
    if (depErr) console.warn('⚠️ Deposit transaction error:', depErr.message);
    else console.log('💰 Deposit transaction recorded.');
  }

  // 5️⃣ Log the withdrawal (€7 000)
  const withdrawalAmount = 7000;
  const { error: witErr } = await supabase.from('transactions').insert({
    user_id: profileId,
    type: 'withdrawal',
    amount: withdrawalAmount,
    status: 'completed',
    currency: 'EUR',
  });
  if (witErr) console.warn('⚠️ Withdrawal transaction error:', witErr.message);
  else console.log('🏧 Withdrawal transaction recorded.');

  console.log('🎉 All steps completed for', email);
}

main();
