import { createClient } from '@supabase/supabase-js';

// Supabase connection (fallback to env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected args: node reset_account.mjs <email> <newPassword> <balance> <profit> <phone>
const [email, newPassword, balanceStr, profitStr, phone] = process.argv.slice(2);
if (!email || !newPassword) {
  console.error('Usage: node reset_account.mjs <email> <newPassword> <balance> <profit> <phone>');
  process.exit(1);
}
const balance = parseFloat(balanceStr?.replace(/,/g, '')) || 0;
const profit = parseFloat(profitStr?.replace(/,/g, '')) || 0;

async function main() {
  // 1️⃣ Send password reset email (supabase will email a link). For demo we just log.
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
    // redirectTo can be set if you have a front‑end route to handle the magic link
    redirectTo: window?.location?.origin || undefined,
  });
  if (resetErr) {
    console.warn('Password reset request error (may require service role):', resetErr.message);
  } else {
    console.log('✅ Password reset email sent – user should follow the link to set the new password.');
  }

  // 2️⃣ Update profile data (balance, profit, phone)
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      email,
      balance,
      profit,
      phone,
    }, { onConflict: 'email' });
  if (profileErr) {
    console.error('❌ Profile update error:', profileErr.message);
    process.exit(1);
  }
  console.log('✅ Profile financial data updated for', email);
}

main();
