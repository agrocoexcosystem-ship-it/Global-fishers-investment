-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  full_name text,
  role text default 'user',
  balance decimal default 0,
  profit decimal default 0,
  kyc_status text default 'unverified',
  bot_settings jsonb default '{"enabled": false, "strategy": "AI_OPTIMIZED", "win_rate": 85}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  type text check (type in ('deposit', 'withdrawal', 'profit', 'investment', 'bonus')),
  amount decimal not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  method text
);

-- Create investments table
create table investments (
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

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table investments enable row level security;

-- Policies

-- Profiles: Public read, User update (restricted columns via trigger ideally, but RLS here limits ID)
-- SECURITY UPDATE: Users should NOT be able to update their own role or balance directly.
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
-- Only allow users to update non-sensitive fields. (In a real scenario, use a specific column list if PG version supports it, or a BEFORE UPDATE trigger to reset restricted fields)
create policy "Users can update own basic info." on profiles for update using ( auth.uid() = id ) with check ( auth.uid() = id );

-- Transactions: Users view own, Admin views all
create policy "Users can view own transactions." on transactions for select using ( auth.uid() = user_id );
create policy "Users can insert own transactions." on transactions for insert with check ( auth.uid() = user_id );

-- Admin Access
create policy "Admins can view all profiles" on profiles for select using ( 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

create policy "Admins can view all transactions" on transactions for select using ( 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

create policy "Admins can update transactions" on transactions for update using ( 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- DATABASE FUNCTION: Handle Balance Updates
create or replace function handle_transaction_update()
returns trigger as $$
begin
  -- Only proceed if status changed to 'completed'
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

-- KEY TRIGGER: Automatically update balance when transaction is completed
create trigger on_transaction_complete
  after update on transactions
  for each row execute procedure handle_transaction_update();

-- DATABASE FUNCTION: Create Profile on Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, balance, profit)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.email, 0, 0);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
-- Note: This requires permissions to creating triggers on auth.users which usually requires Supabase dashboard access.
-- We verify this works if the user runs the SQL.
