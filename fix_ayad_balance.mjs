import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAyadBalance() {
  const userId = '02333e34-327c-4765-9811-5b4b6942e828';
  // Update balance to 21000 (EUR)
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ balance: 21000 })
    .eq('id', userId)
    .single();

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    return;
  }
  console.log('✅ Balance updated:', updateData);

  // Refetch to verify
  const { data: freshData, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('❌ Refetch failed:', fetchError);
    return;
  }
  console.log('🔎 Refetched profile:', freshData);
}

fixAyadBalance();
