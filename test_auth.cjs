const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                env[parts[0].trim()] = parts.slice(1).join('=').trim();
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

async function main() {
    const env = loadEnv();
    const url = env['VITE_SUPABASE_URL'];
    const key = env['VITE_SUPABASE_ANON_KEY'];

    if (!url || !key) {
        console.error("Missing Supabase credentials in .env");
        return;
    }

    console.log(`Connecting to ${url}...`);

    try {
        // Dynamic import for ESM module support if needed, or require
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(url, key);

        const testEmail = `test_${Date.now()}@example.com`;
        const testPass = 'Password123!';

        console.log(`Attempting to Sign Up user: ${testEmail}`);

        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPass
        });

        if (error) {
            console.error("Sign Up Error:", error.message);
        } else {
            console.log("Sign Up Successful!");
            console.log("User ID:", data.user?.id);
            console.log("Session:", data.session ? "Active" : "None (Check Email for Confirmation link)");
        }

    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            console.error("Error: @supabase/supabase-js not found. Please run 'npm install'.");
        } else {
            console.error(e);
        }
    }
}

main();
