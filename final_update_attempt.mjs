import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAyad() {
    console.log('Attempting update for Ayad Fadel...');
    const userId = '02333e34-327c-4765-9811-5b4b6942e828';
    
    const { data, error } = await supabase
        .from('profiles')
        .update({
            balance: 21000,
            profit: 162000
        })
        .eq('id', userId)
        .select();

    if (error) {
        console.error('❌ Update failed:', error);
    } else if (data && data.length > 0) {
        console.log('✅ Update successful! New data:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('⚠️ Request sent, but no rows updated. RLS might be active.');
    }
}

updateAyad();
