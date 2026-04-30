import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAyadFadel() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('full_name', '%Ayad fadel%');
  
  if (error) {
    console.error(error);
  } else {
    console.log('Found profiles:', JSON.stringify(data, null, 2));
  }
}
checkAyadFadel();
