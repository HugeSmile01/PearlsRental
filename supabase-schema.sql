-- Core Supabase schema for PearlsRental
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null,
  category text not null,
  size text not null,
  color text,
  fabric text,
  occasion text,
  image_urls text[] not null default '{}',
  tags text[] not null default '{}',
  price_per_day numeric(10,2) not null,
  status text not null default 'AVAILABLE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  status text not null default 'RESERVED_UNPAID',
  notes text,
  total_price numeric(10,2) not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_date_range check (start_date <= end_date)
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.bookings enable row level security;

create policy "profiles_select_self" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id);

create policy "products_select_all" on public.products
for select using (true);

create policy "products_admin_write" on public.products
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "bookings_select_own_or_admin" on public.bookings
for select using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "bookings_insert_own" on public.bookings
for insert with check (auth.uid() = user_id);

create policy "bookings_update_own_or_admin" on public.bookings
for update using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
