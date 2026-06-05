-- 1. Create the 'profiles' table to store user financial data and roles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  balance decimal default 0.0,
  profit decimal default 0.0,
  invested decimal default 0.0,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the 'transactions' table to track deposits, withdrawals, and staking
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  amount decimal not null,
  status text default 'pending',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Secure the database using Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);

-- 4. Create an automated trigger to generate a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, balance, profit, invested, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 0.0, 0.0, 0.0, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
