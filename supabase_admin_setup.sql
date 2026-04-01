-- ==========================================
-- ADMIN PANEL SETUP FOR SUPABASE
-- ==========================================

-- 1. Create a helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
declare
  user_role text;
begin
  select role into user_role from public.profiles where id = auth.uid();
  return user_role = 'admin';
end;
$$ language plpgsql security definer;

-- 2. Update RLS policies for profiles
create policy "Admins can view all profiles" on profiles for select using (public.is_admin());
create policy "Admins can update all profiles" on profiles for update using (public.is_admin());
create policy "Admins can delete all profiles" on profiles for delete using (public.is_admin());

-- 3. Update RLS policies for personal_notes
create policy "Admins can view all notes" on personal_notes for select using (public.is_admin());
create policy "Admins can update all notes" on personal_notes for update using (public.is_admin());
create policy "Admins can delete all notes" on personal_notes for delete using (public.is_admin());

-- 4. Update RLS policies for academic_works
create policy "Admins can view all academic works" on academic_works for select using (public.is_admin());
create policy "Admins can update all academic works" on academic_works for update using (public.is_admin());
create policy "Admins can delete all academic works" on academic_works for delete using (public.is_admin());

-- 5. Update RLS policies for storage.objects (teacher_files bucket)
create policy "Admins can view all files" on storage.objects for select using (bucket_id = 'teacher_files' AND public.is_admin());
create policy "Admins can insert all files" on storage.objects for insert with check (bucket_id = 'teacher_files' AND public.is_admin());
create policy "Admins can update all files" on storage.objects for update using (bucket_id = 'teacher_files' AND public.is_admin());
create policy "Admins can delete all files" on storage.objects for delete using (bucket_id = 'teacher_files' AND public.is_admin());

-- 6. Add admin user email lookup function (optional, for admin panel to see emails)
-- Since auth.users is not accessible from public schema directly, we can create a secure view or function
create or replace view public.users_admin_view as
select
  p.id,
  p.full_name,
  p.role,
  p.updated_at,
  u.email,
  u.created_at as joined_at
from public.profiles p
join auth.users u on p.id = u.id;

-- Grant access to the view only for admins
grant select on public.users_admin_view to authenticated;

-- RLS for the view (views don't have RLS by default, but we can secure the underlying tables or use a function)
-- Actually, joining auth.users requires superuser privileges in Supabase.
-- A better way is a security definer function:
create or replace function public.get_all_users_for_admin()
returns table (
  id uuid,
  full_name text,
  role text,
  email varchar,
  created_at timestamp with time zone
) as $$
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.role,
    u.email,
    u.created_at
  from public.profiles p
  join auth.users u on p.id = u.id;
end;
$$ language plpgsql security definer;
