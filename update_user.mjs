import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserData() {
  console.log('Fetching profile for fadelayad21@gmail.com...');
  
  // Since we don't have the auth.users table access directly via anon key for other users, 
  // we assume the profiles table has full_name or something we can identify.
  // Actually, the user's screenshot shows the full name is Ayad fadel.
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('full_name', '%Ayad fadel%');

  if (error) {
    console.error('Error fetching profile:', error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.error('Profile not found for Ayad fadel');
    return;
  }

  const profile = profiles[0];
  console.log('Found profile:', profile.id);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      balance: 21000,
      total_profit: 162000
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
  } else {
    console.log('Successfully updated balance to 21,000 and profit to 162,000 for', profile.full_name);
  }
}

updateUserData();
