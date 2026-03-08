-- KidSwap Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  first_name text not null default '',
  avatar text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  points integer not null default 5,
  total_earned integer not null default 5,
  total_spent integer not null default 0,
  items_listed integer not null default 0,
  items_claimed integer not null default 0,
  star_claims_used integer not null default 0,
  star_claim_limit integer not null default 1,
  bonus_star_claims integer not null default 0,
  last_star_claim_reset timestamptz not null default now(),
  has_completed_onboarding boolean not null default false,
  joined_at timestamptz not null default now(),
  flags_received integer not null default 0,
  warnings integer not null default 0,
  is_suspended boolean not null default false,
  quality_warnings integer not null default 0,
  shipping_warnings integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. ITEMS
-- ============================================================
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'other',
  condition text not null default 'good',
  point_value integer not null default 1,
  image_urls text[] not null default '{}',
  seller_id uuid not null references public.profiles(id) on delete cascade,
  seller_name text not null default '',
  status text not null default 'available',
  is_star boolean not null default false,
  is_local_pickup_only boolean not null default false,
  age_range text,
  size text,
  tier text not null default 'bundle',
  bundle_items jsonb, -- array of {id, name, points}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. CLAIMS
-- ============================================================
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimer_id uuid not null references public.profiles(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  shipping_fee numeric(5,2),
  status text not null default 'pending',
  deadline timestamptz not null,
  quality_rating integer,
  individual_ratings jsonb, -- array of {itemName, rating}
  quality_comment text,
  claimer_done boolean not null default false,
  lister_done boolean not null default false,
  shipping_reimbursed boolean,
  exchange_respectful boolean,
  lister_comment text,
  seller_first_name text,
  seller_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. FLAGS
-- ============================================================
create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. SUPPORT TICKETS
-- ============================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  type text not null default 'low-quality',
  description text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. STORAGE BUCKET for item photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.flags enable row level security;
alter table public.support_tickets enable row level security;

-- PROFILES: users can read all profiles, update their own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ITEMS: anyone can read available items, owners can insert/update/delete
create policy "Items are viewable by everyone"
  on public.items for select using (true);
create policy "Authenticated users can insert items"
  on public.items for insert with check (auth.uid() = seller_id);
create policy "Owners can update their items"
  on public.items for update using (auth.uid() = seller_id);
create policy "Owners can delete their items"
  on public.items for delete using (auth.uid() = seller_id);

-- CLAIMS: viewable by claimer or item seller
create policy "Claims viewable by involved parties"
  on public.claims for select using (
    auth.uid() = claimer_id or
    auth.uid() in (select seller_id from public.items where id = item_id)
  );
create policy "Authenticated users can insert claims"
  on public.claims for insert with check (auth.uid() = claimer_id);
create policy "Involved parties can update claims"
  on public.claims for update using (
    auth.uid() = claimer_id or
    auth.uid() in (select seller_id from public.items where id = item_id)
  );

-- FLAGS: anyone authenticated can create, viewable by reporter
create policy "Users can view own flags"
  on public.flags for select using (auth.uid() = reporter_id);
create policy "Authenticated users can create flags"
  on public.flags for insert with check (auth.uid() = reporter_id);

-- SUPPORT TICKETS: viewable by claim participants
create policy "Tickets viewable by claim participants"
  on public.support_tickets for select using (
    auth.uid() in (
      select claimer_id from public.claims where id = claim_id
      union
      select i.seller_id from public.items i
      join public.claims c on c.item_id = i.id
      where c.id = claim_id
    )
  );
create policy "Authenticated users can create tickets"
  on public.support_tickets for insert with check (true);

-- STORAGE: authenticated users can upload to item-photos bucket
create policy "Anyone can view item photos"
  on storage.objects for select using (bucket_id = 'item-photos');
create policy "Authenticated users can upload photos"
  on storage.objects for insert with check (bucket_id = 'item-photos' and auth.role() = 'authenticated');
create policy "Users can delete their own photos"
  on storage.objects for delete using (bucket_id = 'item-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 8. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists so migration is re-runnable
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 9. INDEXES for performance
-- ============================================================
create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_seller on public.items(seller_id);
create index if not exists idx_items_category on public.items(category);
create index if not exists idx_items_tier on public.items(tier);
create index if not exists idx_claims_claimer on public.claims(claimer_id);
create index if not exists idx_claims_item on public.claims(item_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_flags_item on public.flags(item_id);
