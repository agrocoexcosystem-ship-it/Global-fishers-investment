const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dzttuzosppjslpszjtyp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w'
);

async function main() {
    // Login as Ayad Fadel
    const { data: login, error: loginErr } = await supabase.auth.signInWithPassword({
        email: 'fadelayad21@gmail.com',
        password: 'Ala0711%\u00A9'  // Ala0711%©
    });

    if (loginErr) {
        console.log('LOGIN FAILED:', loginErr.message);
        return;
    }

    console.log('Logged in successfully! User ID:', login.user.id);

    // Get current profile
    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, email, username, balance, profit')
        .eq('id', login.user.id)
        .single();

    console.log('Current profile:', JSON.stringify(profile, null, 2));
    if (profErr) console.log('Profile read error:', profErr.message);

    // Update: balance = 21500 (Main Capital), profit = 162000 (Accumulated Profit)
    const { error: updateErr } = await supabase
        .from('profiles')
        .update({ balance: 21500, profit: 162000 })
        .eq('id', login.user.id);

    if (updateErr) {
        console.log('UPDATE FAILED:', updateErr.message);
    } else {
        console.log('UPDATE SUCCESSFUL!');
        console.log('  Main Capital (balance): $21,500');
        console.log('  Accumulated Profit (profit): $162,000');
        // Verify
        const { data: verified } = await supabase
            .from('profiles')
            .select('id, email, username, balance, profit')
            .eq('id', login.user.id)
            .single();
        console.log('Verified profile:', JSON.stringify(verified, null, 2));
    }
}

main().catch(e => console.error(e));
