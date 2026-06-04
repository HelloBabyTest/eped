-- 1. Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text,
  role text check (role in ('pedagog', 'rahbariyat', 'admin', 'tahrirlovchi', 'tasdiqlovchi')) default 'pedagog',
  status text check (status in ('pending', 'active', 'rejected')) default 'pending',

  constraint full_name_length check (char_length(full_name) >= 1)
);

-- Ensure columns exist if table was already created
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='status') then
    alter table profiles add column status text check (status in ('pending', 'active', 'rejected')) default 'pending';
  end if;

  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='email') then
    alter table profiles add column email text;
  end if;
end $$;

-- Update role check constraint if it exists
do $$
begin
  alter table profiles drop constraint if exists profiles_role_check;
  alter table profiles drop constraint if exists role_check;
  alter table profiles add constraint profiles_role_check check (role in ('pedagog', 'rahbariyat', 'admin', 'tahrirlovchi', 'tasdiqlovchi'));
exception
  when others then null;
end $$;

-- Function for checking admin role
create or replace function public.is_admin()
returns boolean 
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin_check boolean;
begin
  -- Directly check the role without triggering RLS recursively
  select (role = 'admin') into is_admin_check
  from public.profiles 
  where id = auth.uid();
  
  return coalesce(is_admin_check, false);
end;
$$;

-- Function for checking editor role
create or replace function public.is_editor()
returns boolean 
language plpgsql
security definer
set search_path = public
as $$
declare
  is_editor_check boolean;
begin
  select (role in ('tahrirlovchi', 'tasdiqlovchi', 'admin', 'rahbariyat')) into is_editor_check
  from public.profiles 
  where id = auth.uid();
  
  return coalesce(is_editor_check, false);
end;
$$;

-- 2. Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Clear all existing policies to be sure
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'profiles' and schemaname = 'public' loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

-- Define clean, recursion-free policies for profiles
-- select: Everyone can read profiles
create policy "profiles_read_policy" on profiles for select using (true);

-- insert: Users can only create their own profile
create policy "profiles_create_policy" on profiles for insert with check (auth.uid() = id);

-- update: Users can update their own profile, OR an admin can update any profile
-- We use the security definer function to avoid recursion
create policy "profiles_update_policy" on profiles for update using (
  auth.uid() = id OR public.is_admin()
);

-- delete: Only admins can delete profiles
create policy "profiles_delete_policy" on profiles for delete using (
  public.is_admin()
);

-- 3. Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Foydalanuvchi'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'pedagog'),
    'pending'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    updated_at = now();
  return new;
exception when others then
  return new; -- Auth signup failure protection
end;
$$;

-- 4. Create a trigger to call the function on every signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- PERSONAL NOTES & STORAGE SETUP
-- ==========================================

create table if not exists personal_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text,
  file_url text,
  file_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure file_name column exists if table was already created
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='personal_notes' and column_name='file_name') then
    alter table personal_notes add column file_name text;
  end if;
end $$;

alter table personal_notes enable row level security;

DROP POLICY IF EXISTS "Users can view their own notes." on personal_notes;
DROP POLICY IF EXISTS "Users can insert their own notes." on personal_notes;
DROP POLICY IF EXISTS "Users can update their own notes." on personal_notes;
DROP POLICY IF EXISTS "Users can delete their own notes." on personal_notes;

create policy "Users can view their own notes." on personal_notes for select using (auth.uid() = user_id OR public.is_editor());
create policy "Users can insert their own notes." on personal_notes for insert with check (auth.uid() = user_id OR public.is_editor());
create policy "Users can update their own notes." on personal_notes for update using (auth.uid() = user_id OR public.is_editor());
create policy "Users can delete their own notes." on personal_notes for delete using (auth.uid() = user_id OR public.is_editor());

-- ==========================================
-- ACADEMIC WORKS SETUP
-- ==========================================

create table if not exists academic_works (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  table_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table academic_works enable row level security;

DROP POLICY IF EXISTS "Users can view their own academic work." on academic_works;
DROP POLICY IF EXISTS "Users can insert their own academic work." on academic_works;
DROP POLICY IF EXISTS "Users can update their own academic work." on academic_works;
DROP POLICY IF EXISTS "Users can delete their own academic work." on academic_works;

create policy "Users can view their own academic work." on academic_works for select using (auth.uid() = user_id OR public.is_editor());
create policy "Users can insert their own academic work." on academic_works for insert with check (auth.uid() = user_id OR public.is_editor());
create policy "Users can update their own academic work." on academic_works for update using (auth.uid() = user_id OR public.is_editor());
create policy "Users can delete their own academic work." on academic_works for delete using (auth.uid() = user_id OR public.is_editor());

-- ==========================================
-- SCIENTIFIC WORKS SETUP
-- ==========================================

create table if not exists scientific_works (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  table_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table scientific_works enable row level security;

DROP POLICY IF EXISTS "Users can view their own sci work." on scientific_works;
DROP POLICY IF EXISTS "Users can insert their own sci work." on scientific_works;
DROP POLICY IF EXISTS "Users can update their own sci work." on scientific_works;
DROP POLICY IF EXISTS "Users can delete their own sci work." on scientific_works;
DROP POLICY IF EXISTS "Users can view their own scientific work." on scientific_works;
DROP POLICY IF EXISTS "Users can insert their own scientific work." on scientific_works;
DROP POLICY IF EXISTS "Users can update their own scientific work." on scientific_works;
DROP POLICY IF EXISTS "Users can delete their own scientific work." on scientific_works;

create policy "Users can view their own sci work." on scientific_works for select using (auth.uid() = user_id OR public.is_editor());
create policy "Users can insert their own sci work." on scientific_works for insert with check (auth.uid() = user_id OR public.is_editor());
create policy "Users can update their own sci work." on scientific_works for update using (auth.uid() = user_id OR public.is_editor());
create policy "Users can delete their own sci work." on scientific_works for delete using (auth.uid() = user_id OR public.is_editor());

-- ==========================================
-- METHODICAL WORKS SETUP
-- ==========================================

create table if not exists methodical_works (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  table_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table methodical_works enable row level security;

DROP POLICY IF EXISTS "Users can view their own meth work." on methodical_works;
DROP POLICY IF EXISTS "Users can insert their own meth work." on methodical_works;
DROP POLICY IF EXISTS "Users can update their own meth work." on methodical_works;
DROP POLICY IF EXISTS "Users can delete their own meth work." on methodical_works;
DROP POLICY IF EXISTS "Users can view their own methodical work." on methodical_works;
DROP POLICY IF EXISTS "Users can insert their own methodical work." on methodical_works;
DROP POLICY IF EXISTS "Users can update their own methodical work." on methodical_works;
DROP POLICY IF EXISTS "Users can delete their own methodical work." on methodical_works;

create policy "Users can view their own meth work." on methodical_works for select using (auth.uid() = user_id OR public.is_editor());
create policy "Users can insert their own meth work." on methodical_works for insert with check (auth.uid() = user_id OR public.is_editor());
create policy "Users can update their own meth work." on methodical_works for update using (auth.uid() = user_id OR public.is_editor());
create policy "Users can delete their own meth work." on methodical_works for delete using (auth.uid() = user_id OR public.is_editor());

-- ==========================================
-- ADMIN CHATS SETUP
-- ==========================================

create table if not exists admin_chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  sender text not null, -- 'admin' or 'user'
  status text default 'sent', -- 'sent' or 'read'
  time text, -- storing time string or we could just use created_at, but keeping compat with app
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table admin_chats enable row level security;

DROP POLICY IF EXISTS "Users can view their own chats, admins view all." on admin_chats;
DROP POLICY IF EXISTS "Users and admins can insert chats." on admin_chats;
DROP POLICY IF EXISTS "Users and admins can update chats." on admin_chats;

create policy "Users can view their own chats, admins view all." on admin_chats for select using (auth.uid() = user_id OR public.is_admin());
create policy "Users and admins can insert chats." on admin_chats for insert with check (auth.uid() = user_id OR public.is_admin());
create policy "Users and admins can update chats." on admin_chats for update using (auth.uid() = user_id OR public.is_admin());


create table if not exists mentor_works (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  table_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists university_norms (
  id uuid default gen_random_uuid() primary key,
  norms_data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table university_norms enable row level security;
drop policy if exists "Norms are viewable by all." on university_norms;
drop policy if exists "Norms are editable by editors and admins." on university_norms;
create policy "Norms are viewable by all." on university_norms for select using (true);
create policy "Norms are editable by editors and admins." on university_norms for all using (public.is_editor());

alter table mentor_works enable row level security;

DROP POLICY IF EXISTS "Users can view their own men work." on mentor_works;
DROP POLICY IF EXISTS "Users can insert their own men work." on mentor_works;
DROP POLICY IF EXISTS "Users can update their own men work." on mentor_works;
DROP POLICY IF EXISTS "Users can delete their own men work." on mentor_works;
DROP POLICY IF EXISTS "Users can view their own mentor work." on mentor_works;
DROP POLICY IF EXISTS "Users can insert their own mentor work." on mentor_works;
DROP POLICY IF EXISTS "Users can update their own mentor work." on mentor_works;
DROP POLICY IF EXISTS "Users can delete their own mentor work." on mentor_works;

create policy "Users can view their own men work." on mentor_works for select using (auth.uid() = user_id OR public.is_editor());
create policy "Users can insert their own men work." on mentor_works for insert with check (auth.uid() = user_id OR public.is_editor());
create policy "Users can update their own men work." on mentor_works for update using (auth.uid() = user_id OR public.is_editor());
create policy "Users can delete their own men work." on mentor_works for delete using (auth.uid() = user_id OR public.is_editor());
