import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAyadData() {
  console.log('Updating Ayad Fadel profile...');
  const { data: profiles, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', '%Ayad fadel%');
  
  if (findError) {
    console.error('Error finding profile:', findError);
    return;
  }

  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        balance: 21000,
        profit: 162000
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    } else {
      console.log('Successfully updated profile for Ayad Fadel (ID:', userId, ')');
      console.log('Balance: 21000, Profit: 162000');
    }
  } else {
    console.log('Profile for Ayad Fadel not found.');
  }
}

updateAyadData();
