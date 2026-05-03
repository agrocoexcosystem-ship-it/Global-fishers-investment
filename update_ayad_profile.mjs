import { createClient } from '@supabase/supabase-js';

// Supabase credentials (fallback to env vars if present)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL ?? 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAyadFadel() {
  try {
    // Find the profile row for Ayad Fadel (case‑insensitive match)
    const { data: profile, error: findErr } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', '%Ayad fadel%')
      .single();

    if (findErr) throw findErr;
    if (!profile?.id) throw new Error('Ayad Fadel profile not found');

    // Update balance to €21,000 and profit to €162,000
    const { data, error } = await supabase
      .from('profiles')
      .update({ balance: 21000, profit: 162000 })
      .eq('id', profile.id);

    if (error) throw error;
    console.log('Ayad Fadel profile successfully updated:', data);
  } catch (err) {
    console.error('Failed to update Ayad Fadel profile:', err);
  }
}

updateAyadFadel();
