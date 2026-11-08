-- ════════════════════════════════════════════════════════════════════════════
--  DANGAL GYM — database schema (Supabase / Postgres)
--  Run in Supabase SQL editor (or `supabase db push`). Idempotent where practical.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────── Roles & profiles ─────────────
do $$ begin create type public.app_role as enum ('owner', 'staff'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Helper used by RLS policies (security definer avoids recursive RLS on profiles)
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active)
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active and role = 'owner')
$$;

-- Admin access additionally requires a 2FA-verified session (AAL2)
create or replace function public.is_aal2() returns boolean
language sql stable as $$ select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2' $$;

-- ───────────── Content tables ─────────────
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration text not null,
  price integer not null check (price >= 0),
  original_price integer check (original_price >= 0),
  features text[] not null default '{}',
  highlight boolean not null default false,
  badge text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text not null default '',
  specialties text[] not null default '{}',
  experience_years integer not null default 0,
  image_url text,
  instagram text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program text,
  quote text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  result text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Facility',
  image_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  cta_label text,
  cta_href text,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ───────────── Video projection ─────────────
do $$ begin create type public.video_source as enum ('upload', 'youtube', 'vimeo', 'mux'); exception when duplicate_object then null; end $$;
do $$ begin create type public.video_placement as enum ('hero', 'section', 'both'); exception when duplicate_object then null; end $$;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source public.video_source not null,
  src text not null,                       -- public URL (upload) | YouTube/Vimeo id | Mux playback id
  storage_path text,                       -- object path in the `media` bucket for uploads
  poster_url text,
  tags text[] not null default '{}',
  placement public.video_placement not null default 'hero',
  is_published boolean not null default true,  -- false = library only, never shown publicly
  is_active boolean not null default false,
  in_playlist boolean not null default false,
  playlist_order integer not null default 0,
  starts_at timestamptz,                   -- schedule window (optional)
  ends_at timestamptz,
  schedule_label text,
  headline text,                           -- optional hero headline override
  subline text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint schedule_window check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index if not exists videos_active_idx on public.videos (is_active) where is_active;

create table if not exists public.video_settings (
  id integer primary key default 1 check (id = 1),
  playlist_enabled boolean not null default false,
  rotate_seconds integer not null default 20 check (rotate_seconds between 5 and 600)
);
insert into public.video_settings (id) values (1) on conflict do nothing;

-- Activation history powers one-click "revert to previous video"
create table if not exists public.video_activations (
  id bigserial primary key,
  video_id uuid references public.videos(id) on delete cascade,
  placement public.video_placement not null,
  activated_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ───────────── Leads ─────────────
do $$ begin create type public.lead_status as enum ('new', 'contacted', 'trial_booked', 'converted', 'lost'); exception when duplicate_object then null; end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) <= 20),
  email text check (char_length(email) <= 120),
  interest text,
  preferred_time text,
  message text check (char_length(message) <= 1000),
  kind text not null default 'enquiry' check (kind in ('enquiry', 'free_trial')),
  source text,
  status public.lead_status not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- ───────────── Audit log ─────────────
create table if not exists public.audit_log (
  id bigserial primary key,
  actor uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  created_at timestamptz not null default now()
);

-- ───────────── Row Level Security ─────────────
alter table public.profiles          enable row level security;
alter table public.plans             enable row level security;
alter table public.trainers          enable row level security;
alter table public.testimonials      enable row level security;
alter table public.gallery           enable row level security;
alter table public.banners           enable row level security;
alter table public.videos            enable row level security;
alter table public.video_settings    enable row level security;
alter table public.video_activations enable row level security;
alter table public.leads             enable row level security;
alter table public.audit_log         enable row level security;

-- Public (anon) can only READ published content. No public writes anywhere —
-- the enquiry form inserts server-side with the service role after validation.
drop policy if exists "public read plans" on public.plans;
create policy "public read plans" on public.plans for select using (is_active or (public.is_staff() and public.is_aal2()));
drop policy if exists "public read trainers" on public.trainers;
create policy "public read trainers" on public.trainers for select using (is_active or (public.is_staff() and public.is_aal2()));
drop policy if exists "public read testimonials" on public.testimonials;
create policy "public read testimonials" on public.testimonials for select using (is_active or (public.is_staff() and public.is_aal2()));
drop policy if exists "public read gallery" on public.gallery;
create policy "public read gallery" on public.gallery for select using (is_active or (public.is_staff() and public.is_aal2()));
drop policy if exists "public read banners" on public.banners;
create policy "public read banners" on public.banners for select using (is_active or (public.is_staff() and public.is_aal2()));
drop policy if exists "public read videos" on public.videos;
create policy "public read videos" on public.videos for select using (is_published or (public.is_staff() and public.is_aal2()));
drop policy if exists "public read video settings" on public.video_settings;
create policy "public read video settings" on public.video_settings for select using (true);

-- Staff/owner reads of private tables (writes go through server actions with role checks)
drop policy if exists "staff read leads" on public.leads;
create policy "staff read leads" on public.leads for select using (public.is_staff() and public.is_aal2());
drop policy if exists "staff update leads" on public.leads;
create policy "staff update leads" on public.leads for update using (public.is_staff() and public.is_aal2());
drop policy if exists "owner read activations" on public.video_activations;
create policy "owner read activations" on public.video_activations for select using (public.is_owner() and public.is_aal2());
drop policy if exists "owner read audit" on public.audit_log;
create policy "owner read audit" on public.audit_log for select using (public.is_owner() and public.is_aal2());

-- Profiles: a user reads their own row; owner reads all.
drop policy if exists "self read profile" on public.profiles;
create policy "self read profile" on public.profiles for select using (id = auth.uid() or public.is_owner());

-- ───────────── Storage bucket (videos & images) ─────────────
-- Server-side enforcement of type and size happens HERE (bucket limits) and again in the app.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 104857600,  -- 100 MB
        array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public can read objects in `media`; uploads only via server-issued signed upload URLs (service role).
drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects for select using (bucket_id = 'media');

-- ───────────── Housekeeping ─────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ declare t text; begin
  foreach t in array array['plans','trainers','testimonials','gallery','banners','leads'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Auto-create a profile row for new auth users (inactive staff until the owner enables them)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, is_active)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 'staff', false)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
