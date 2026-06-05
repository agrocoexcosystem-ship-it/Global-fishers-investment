import { createClient } from '@supabase/supabase-js';

// Supabase credentials (use env vars if available)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];
if (!email) {
  console.error('Usage: node check_account.mjs <email>');
  process.exit(1);
}

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error.message);
    process.exit(1);
  }

  if (!data) {
    console.log(`No account found for email: ${email}`);
  } else {
    console.log('Account found:');
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
