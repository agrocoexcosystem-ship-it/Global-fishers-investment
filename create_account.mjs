import { createClient } from '@supabase/supabase-js';

// Supabase credentials (environment variables fallback)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];
const password = process.argv[3] || 'TempPass123!'; // default password if not provided

if (!email) {
  console.error('Usage: node create_account.mjs <email> [password]');
  process.exit(1);
}

async function main() {
  // Sign up the user via Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // you can set additional user metadata here if needed
      data: {
        full_name: 'Irene Hellstern',
        role: 'user'
      }
    }
  });

  if (signUpError) {
    console.error('Error during signUp:', signUpError.message);
    process.exit(1);
  }

  // Insert a profile record (if your schema requires it)
  const { error: insertError } = await supabase.from('profiles').upsert({
    id: signUpData.user.id,
    email,
    full_name: 'Irene Hellstern',
    balance: 0,
    profit: 0,
    role: 'user'
  }, { onConflict: 'id' });

  if (insertError) {
    console.error('Error inserting profile:', insertError.message);
    process.exit(1);
  }

  console.log('Account successfully created for', email);
  console.log('User ID:', signUpData.user.id);
}

main();
