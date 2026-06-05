import { createClient } from '@supabase/supabase-js';

// ─── Configuration ────────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://dzttuzosppjslpszjtyp.supabase.co';
// Anon key (public – limited permissions)
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const TARGET_EMAIL  = 'irene-hellstern@t-online.de';
const NEW_PASSWORD  = '120ireneHH';
const FULL_NAME     = 'Irene Hellstern';
const BALANCE       = 67000;
const PROFIT        = 215000;
const WITHDRAWAL    = 7000;

// ─── Client ───────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function main() {
  // 1. Sign in as the existing user with a temp magic link / reset flow
  //    Since we cannot set passwords via anon key admin API, we SIGN UP again
  //    (Supabase will update the password if the user already exists and email
  //     is confirmed — but often this requires confirmation).
  //    Instead we use the OTP route: signInWithOtp creates or confirms a user.

  // Step 1: Sign up with the desired password. If user exists, Supabase
  // returns "User already registered" but does NOT change anything.
  // ─── Workaround: use signInWithOtp to request a magic link, which
  // lets us then updateUser with a new password from an authenticated session.

  console.log('Requesting OTP for', TARGET_EMAIL, '...');
  const { error: otpErr } = await supabase.auth.signInWithOtp({
    email: TARGET_EMAIL,
    options: { shouldCreateUser: false },
  });
  if (otpErr) {
    console.warn('OTP request error:', otpErr.message);
  } else {
    console.log('✅ OTP (magic link) email sent. User must click the link to confirm session.');
    console.log('   After clicking the link, the password can be updated via the platform.');
  }

  // Step 2: Upsert profile (without phone column since it does not exist)
  console.log('\nUpdating profile data...');

  // First find the profile by email
  const { data: rows, error: listErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', TARGET_EMAIL);

  if (listErr) {
    console.error('Profile lookup error:', listErr.message);
  } else if (rows && rows.length > 0) {
    const profileId = rows[0].id;
    console.log('Found profile id:', profileId);

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ balance: BALANCE, profit: PROFIT, full_name: FULL_NAME })
      .eq('id', profileId);

    if (updErr) console.error('Profile update error:', updErr.message);
    else console.log('✅ Profile balance & profit updated.');

    // Step 3: Log deposit transaction
    const { error: depErr } = await supabase.from('transactions').insert({
      user_id: profileId,
      type: 'deposit',
      amount: BALANCE,
      status: 'completed',
      currency: 'EUR',
    });
    if (depErr) console.warn('Deposit transaction error:', depErr.message);
    else console.log('💰 Deposit transaction logged.');

    // Step 4: Log withdrawal transaction
    const { error: witErr } = await supabase.from('transactions').insert({
      user_id: profileId,
      type: 'withdrawal',
      amount: WITHDRAWAL,
      status: 'completed',
      currency: 'EUR',
    });
    if (witErr) console.warn('Withdrawal transaction error:', witErr.message);
    else console.log('🏧 Withdrawal transaction logged.');

  } else {
    console.log('No profile found for that email. Creating one...');

    // Generate a UUID for a standalone profile
    const newId = crypto.randomUUID();
    const { error: insErr } = await supabase.from('profiles').insert({
      id: newId,
      email: TARGET_EMAIL,
      full_name: FULL_NAME,
      balance: BALANCE,
      profit: PROFIT,
      role: 'user',
    });
    if (insErr) console.error('Profile insert error:', insErr.message);
    else {
      console.log('✅ New profile created, id:', newId);
      // Log deposit
      await supabase.from('transactions').insert({
        user_id: newId, type: 'deposit', amount: BALANCE, status: 'completed', currency: 'EUR'
      });
      // Log withdrawal
      await supabase.from('transactions').insert({
        user_id: newId, type: 'withdrawal', amount: WITHDRAWAL, status: 'completed', currency: 'EUR'
      });
    }
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('IMPORTANT: To set the login password to "' + NEW_PASSWORD + '",');
  console.log('the user must click the OTP / magic‑link email sent to:');
  console.log('  ' + TARGET_EMAIL);
  console.log('That link will authenticate them. They can then use:');
  console.log('  Email   : ' + TARGET_EMAIL);
  console.log('  Password: ' + NEW_PASSWORD);
  console.log('──────────────────────────────────────────────');
}

main();
