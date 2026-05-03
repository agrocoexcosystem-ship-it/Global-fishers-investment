import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dzttuzosppjslpszjtyp.supabase.co';
// Use the anon/public key – read‑only access is allowed
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

async function readAyad() {
  const { data, error } = await supabase
    .from('profiles')
    .select('balance, profit, full_name')
    .eq('email', 'fadelayad21@gmail.com')
    .single();

  if (error) console.error('❌ fetch error', error);
  else console.log('✅ Ayad profile – balance:', data.balance, 'profit:', data.profit);
}

readAyad();
