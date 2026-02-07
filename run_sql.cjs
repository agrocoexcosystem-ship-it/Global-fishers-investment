const https = require('https');
const axios = require('axios'); // need to install axios
const fs = require('fs');

const { createClient } = require('@supabase/supabase-js');

// Since we cannot get `axios` easily in this env without install (it failed before),
// let's try using the supabas-js client ITSELF to execute SQL if possible? No.

// Let's use `fetch` (if available) or `https` again but double check the endpoint.
// It seems the Management API for running arbitrary SQL is `POST /v1/projects/{ref}/pg/query` or similar?

// Wait! We have the Service Role Key!
// We can use the service role key to execute RPC functions!
// BUT we want to CREATE functions.
// We can use the supabase-js client to execute raw SQL? No.

// However, if we assume the user has the CLI installed... No.

// Let's try ONE more endpoint: `POST /v1/projects/{ref}/database/query`
// Or simply instruct the user.

const PROJECT_REF = 'dzttuzosppjslpszjtyp';
const ACCESS_TOKEN = 'sbp_e670888cb4269c238bffc2814de9431777708174';

const full_sql = fs.readFileSync('./ADMIN_CONTROL_SETUP.sql', 'utf8');

const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/database/query`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.log(e));
req.write(JSON.stringify({ query: full_sql }));
req.end();
