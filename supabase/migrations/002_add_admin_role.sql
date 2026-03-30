-- Add admin flag to profiles
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Admin RLS policies: admins can read all flags, tickets, and profiles for moderation
-- (Regular RLS already allows profile reads for everyone)

-- Allow admins to view ALL flags (not just their own)
create policy "Admins can view all flags"
  on public.flags for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to view ALL support tickets
create policy "Admins can view all tickets"
  on public.support_tickets for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to update support tickets (resolve them)
create policy "Admins can update tickets"
  on public.support_tickets for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to update any profile (issue warnings, suspend)
create policy "Admins can update any profile"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to update any item (restore flagged items, remove items)
create policy "Admins can update any item"
  on public.items for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Allow admins to delete any item
create policy "Admins can delete any item"
  on public.items for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
