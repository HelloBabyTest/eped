-- 1. Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  role text check (role in ('pedagog', 'rahbariyat', 'admin')) default 'pedagog',

  constraint full_name_length check (char_length(full_name) >= 3)
);

-- 2. Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 3. Create a function to handle new user signups
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'pedagog')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Create a trigger to call the function on every signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- PERSONAL NOTES & STORAGE SETUP
-- ==========================================

-- 5. Create personal_notes table
create table personal_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text,
  file_url text,
  file_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Set up RLS for personal_notes
alter table personal_notes enable row level security;

create policy "Users can view their own notes." on personal_notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes." on personal_notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes." on personal_notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes." on personal_notes
  for delete using (auth.uid() = user_id);

-- 7. Storage Setup (Run these manually in Supabase Dashboard if needed)
-- Note: Supabase Storage buckets are usually created via UI, but here is the SQL for policies.
-- Create bucket 'teacher_files' first in the dashboard.

-- Policy for uploading files
create policy "Teachers can upload their own files"
on storage.objects for insert
with check (
  bucket_id = 'teacher_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for viewing their own files
create policy "Teachers can view their own files"
on storage.objects for select
using (
  bucket_id = 'teacher_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting their own files
create policy "Teachers can delete their own files"
on storage.objects for delete
using (
  bucket_id = 'teacher_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ==========================================
-- ACADEMIC WORKS SETUP
-- ==========================================

-- 8. Create academic_works table
create table academic_works (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  table_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Set up RLS for academic_works
alter table academic_works enable row level security;

create policy "Users can view their own academic work." on academic_works
  for select using (auth.uid() = user_id);

create policy "Users can insert their own academic work." on academic_works
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own academic work." on academic_works
  for update using (auth.uid() = user_id);
