const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.resolve(__dirname, '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const output = {};
    content.split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) output[k.trim()] = v.trim();
    });
    return output;
}

async function runTests() {
    console.log("Starting Integration Tests...");
    const env = getEnv();
    const supabaseUrl = env['VITE_SUPABASE_URL'];
    const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error("FAIL: Missing Credentials");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const email = `automated_test_${Date.now()}@test.com`;
    const password = 'TestPassword123!';

    // 1. Sign Up
    console.log(`\n[Test 1] Signing Up ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: 'Test Bot' } }
    });

    if (authError) {
        console.error("FAIL: Sign Up Error ->", authError.message);
        // Supabase often requires email confirmation. If so, we might be blocked here unless we disabled it.
        // If "fake" email is blocked, we can't proceed.
        return;
    }

    console.log("PASS: Sign Up API call successful.");
    const userId = authData.user?.id;
    if (!userId) {
        console.log("WARN: No User ID returned. Email confirmation might be required.");
        return;
    }

    // 2. Check Profile Creation (Trigger Test)
    // Wait a moment for trigger
    await new Promise(r => setTimeout(r, 2000));
    console.log(`\n[Test 2] Checking Profile for ${userId}...`);
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error("FAIL: Profile fetch error ->", profileError.message);
    } else {
        console.log("PASS: Profile found ->", profile.username);
        console.log("      Balance:", profile.balance);
    }

    // 3. Insert Transaction (Deposit)
    console.log(`\n[Test 3] Inserting Deposit Transaction...`);
    const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            type: 'deposit',
            amount: 500,
            status: 'pending',
            method: 'BTC'
        })
        .select()
        .single();

    if (txError) {
        console.error("FAIL: Transaction insert ->", txError.message);
    } else {
        console.log("PASS: Transaction inserted -> ID:", tx.id, "Status:", tx.status);
    }

    // 4. Simulate Admin Approval (This might fail due to RLS if we are not admin)
    // We are logged in as the user (authData.session). Users cannot approve own transactions.
    // So we expect this to FAIL or be impossible properly.
    // However, for the sake of checking RLS, let's TRY to approve it as the user.
    console.log(`\n[Test 4] RLS Check: Attempting to approve own transaction (Should Fail)...`);

    // We need to sign in again to get the session purely to be sure? 
    // Actually authData.session is used if we set it on the client
    // But supabase client here is anonymous unless we set session.

    let userClient = supabase;
    if (authData.session) {
        // Create client acting as user
        // Actually, supabase-js handles state, but better to be explicit or use setSession
        await supabase.auth.setSession(authData.session);
    } else {
        console.log("WARN: No active session, cannot test RLS as user.");
    }

    const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', tx?.id || '000');

    if (updateError) {
        console.log("PASS: Update Rejected as expected (RLS working) ->", updateError.message); // Doesn't actually return error often, just count 0
    } else {
        // If no error, check if it actually updated
        const { data: checkTx } = await supabase.from('transactions').select('status').eq('id', tx?.id || '000').single();
        if (checkTx?.status === 'completed') {
            console.error("FAIL: SECURITY RISK! User was able to approve own transaction!");
        } else {
            console.log("PASS: Update silently ignored (RLS working).");
        }
    }

    console.log("\nTests Completed.");
}

runTests();
