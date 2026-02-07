const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const ACCESS_TOKEN = 'sbp_6ce3a809a5df36f2b5c9b776cc6edf0dd900bd07';
const PROJECT_REF = 'dzttuzosppjslpszjtyp';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

const SQL_SCHEMA = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  full_name text,
  role text default 'user',
  balance decimal default 0,
  profit decimal default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. TRANSACTIONS
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  type text check (type in ('deposit', 'withdrawal', 'profit', 'investment', 'bonus')),
  amount decimal not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  method text,
  details text
);

-- 3. INVESTMENTS
create table if not exists investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  plan_id text,
  amount decimal not null,
  daily_return decimal,
  start_date timestamp with time zone default timezone('utc'::text, now()),
  end_date timestamp with time zone,
  status text default 'active',
  total_profit decimal default 0
);

-- 4. RLS
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table investments enable row level security;

-- Policies
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );

drop policy if exists "Users can update own basic info." on profiles;
create policy "Users can update own basic info." on profiles for update using ( auth.uid() = id ) with check ( auth.uid() = id );

drop policy if exists "Users can view own transactions." on transactions;
create policy "Users can view own transactions." on transactions for select using ( auth.uid() = user_id );

drop policy if exists "Users can insert own transactions." on transactions;
create policy "Users can insert own transactions." on transactions for insert with check ( auth.uid() = user_id );

drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles" on profiles for select using ( 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

drop policy if exists "Admins can view all transactions" on transactions;
create policy "Admins can view all transactions" on transactions for select using ( 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);


drop policy if exists "Admins can update transactions" on transactions;
create policy "Admins can update transactions" on transactions for update using ( 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- NEW ADMIN POLICIES
drop policy if exists "Admins can update all profiles" on profiles;
create policy "Admins can update all profiles" on profiles for update using ( 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

drop policy if exists "Admins can insert transactions" on transactions;
create policy "Admins can insert transactions" on transactions for insert with check (
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);


-- 5. FUNCTION & TRIGGERS
create or replace function handle_transaction_update()
returns trigger as $$
begin
  if new.status = 'completed' and old.status <> 'completed' then
    if new.type = 'deposit' then
      update profiles set balance = balance + new.amount where id = new.user_id;
    elsif new.type = 'withdrawal' then
      update profiles set balance = balance - new.amount where id = new.user_id;
    elsif new.type = 'profit' then
      update profiles set profit = profit + new.amount where id = new.user_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_transaction_complete on transactions;
create trigger on_transaction_complete
  after update on transactions
  for each row execute procedure handle_transaction_update();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
`;

async function main() {
  console.log("🚀 Starting SUPER AUTO SETUP...");

  try {
    console.log("🔑 Fetching Keys...");
    const keysResponse = await axios.get(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });
    const serviceKey = keysResponse.data.find(k => k.name === 'service_role').api_key;
    console.log("✅ Service Role Key acquired.");

    console.log("🛠️ Applying Database Schema...");
    try {
      await axios.post(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        { query: SQL_SCHEMA },
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' } }
      );
      console.log("✅ SQL Applied Successfully!");
    } catch (sqlErr) {
      console.error("⚠️ SQL Execution Failed via API. Checking details...");
      // Some API versions use different endpoints. Trying fallback:
      try {
        await axios.post(`https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`,
          { query: SQL_SCHEMA },
          { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' } }
        );
        console.log("✅ SQL Applied via fallback endpoint!");
      } catch (e2) {
        console.error("   Failed to apply SQL. You may need to run supabase_schema.sql manually in Dashboard.");
      }
    }

    console.log("⚙️ Relaxing Auth Rate Limits...");
    try {
      await axios.patch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
        rate_limit_email_sent: 1000,
        confirm_email_change_enabled: false,
        mailer_autoconfirm: true
      }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
      console.log("✅ Auth Config Updated.");
    } catch (e) {
      console.warn("⚠️ Auth Config Update warning:", e.message);
    }

    const supabase = createClient(SUPABASE_URL, serviceKey);
    const adminEmail = 'obiesieprosper@gmail.com';
    const adminPass = '120Godinme';

    console.log(`👤 Creating/Updating Admin User: ${adminEmail}`);
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let existing = users.find(u => u.email === adminEmail);
    let userId = existing?.id;

    if (existing) {
      await supabase.auth.admin.updateUserById(userId, { password: adminPass, email_confirm: true });
      console.log("   Updated password for existing admin.");
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPass,
        email_confirm: true,
        user_metadata: { full_name: 'Super Admin' }
      });
      if (error) throw error;
      userId = data.user.id;
      console.log("   Created new admin user.");
    }

    console.log("🛡️ Enforcing Admin Role...");
    // Wait a small bit for any triggers
    await new Promise(r => setTimeout(r, 1000));

    await supabase.from('profiles').upsert({
      id: userId,
      email: adminEmail,
      full_name: 'Super Admin',
      role: 'admin',
      balance: 1000000,
      profit: 50000
    });
    console.log("✅ Admin Role Set.");
    console.log("🎉 SETUP COMPLETE.");

  } catch (e) {
    console.error("\n❌ ERROR:", e.message);
    if (e.response) console.error("   API Detail:", e.response.status, JSON.stringify(e.response.data));
  }
}

main();
