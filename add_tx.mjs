import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addProfitTransaction() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', '%Ayad fadel%');
  
  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id;
    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'Profit Credit',
      amount: 162000,
      status: 'completed',
      created_at: new Date().toISOString()
    });
    if (error) console.error(error);
    else console.log('Successfully added profit transaction for', userId);
  }
}
addProfitTransaction();
