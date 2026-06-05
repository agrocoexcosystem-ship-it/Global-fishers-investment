import { createClient } from '@supabase/supabase-js';

// Supabase client (fallback to env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments: <email> <fullName> <phone> <balance> <profit> <withdrawal>
const [email, fullName, phone, balStr, profitStr, withdrawalStr] = process.argv.slice(2);
if (!email || !fullName) {
  console.error('Usage: node setup_user.mjs <email> <fullName> <phone> <balance> <profit> <withdrawal>');
  process.exit(1);
}
const balance = parseFloat(balStr?.replace(/,/g, '')) || 0;
const profit = parseFloat(profitStr?.replace(/,/g, '')) || 0;
const withdrawal = parseFloat(withdrawalStr?.replace(/,/g, '')) || 0;

async function main() {
  // Send password‑reset email so the user can set a new password
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {});
  if (resetErr) console.warn('⚠️ Password‑reset request error:', resetErr.message);
  else console.log('✅ Password‑reset email sent.');

  // Upsert profile (onConflict on email)
  const { error: upsertErr } = await supabase.from('profiles').upsert(
    {
      email,
      full_name: fullName,
      phone: phone || '',
      balance,
      profit,
      role: 'user'
    },
    { onConflict: 'email' }
  );
  if (upsertErr) {
    console.error('❌ Profile upsert failed:', upsertErr.message);
    process.exit(1);
  }
  console.log('✅ Profile created/updated.');

  // Get the profile id for linking transactions
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
  if (profErr) {
    console.error('❌ Could not retrieve profile id:', profErr.message);
    process.exit(1);
  }
  const userId = profile.id;

  // Record deposit transaction if balance > 0
  if (balance > 0) {
    const { error: depErr } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount: balance,
      status: 'completed',
      currency: 'EUR'
    });
    if (depErr) console.warn('⚠️ Deposit transaction error:', depErr.message);
    else console.log('💰 Deposit transaction logged.');
  }

  // Record withdrawal transaction if withdrawal > 0
  if (withdrawal > 0) {
    const { error: witErr } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'withdrawal',
      amount: withdrawal,
      status: 'completed',
      currency: 'EUR'
    });
    if (witErr) console.warn('⚠️ Withdrawal transaction error:', witErr.message);
    else console.log('🏧 Withdrawal transaction logged.');
  }

  console.log('🎉 All operations completed for', email);
}

main();
