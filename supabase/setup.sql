-- ════════════════════════════════════════════════════════════════════════════
--  DANGAL GYM — ONE-PASTE SETUP
--  Supabase Dashboard → SQL Editor → New query → paste this whole file → Run.
--  Safe to run more than once (tables are created if missing; sample data is only added to empty tables).
--
--  After it succeeds:
--   1. Authentication → Users → "Add user" → your email + a strong password (tick "Auto Confirm User").
--   2. Run the OWNER snippet at the very bottom of this file (with your email) in a new query.
-- ════════════════════════════════════════════════════════════════════════════

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


-- ─────────── sample content (real prices; placeholder trainers/testimonials/gallery) ───────────
-- ════════════════════════════════════════════════════════════════════════════
--  DANGAL GYM — seed data. Membership prices are REAL (gym's current price list).
--  Trainers, testimonials and gallery are PLACEHOLDERS — replace via the admin panel.
-- ════════════════════════════════════════════════════════════════════════════

do $seed$ begin if not exists (select 1 from public.plans) then
insert into public.plans (name, duration, price, original_price, features, highlight, badge, sort_order) values
 ('Monthly',     '1 month',   4000,  null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], false, null, 1),
 ('Quarterly',   '3 months',  8000,  null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], false, null, 2),
 ('Half Yearly', '6 months',  12000, null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], false, null, 3),
 ('Yearly',      '12 months', 18000, null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], true, 'Best choice', 4);
end if; end $seed$;

do $seed$ begin if not exists (select 1 from public.trainers) then
insert into public.trainers (name, role, bio, specialties, experience_years, image_url, sort_order) values
 ('Coach Imran Khan', 'Head Coach · Strength & Conditioning', 'Former state-level wrestler turned strength coach. Believes the basics, done perfectly, build legends.', array['Strength','Wrestling conditioning','Fat loss'], 12, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e', 1),
 ('Coach Ayesha Fatima', 'Women''s Fitness & Nutrition Coach', 'Certified nutritionist who builds strong, sustainable physiques with a no-crash-diet philosophy.', array['Women''s fitness','Nutrition','Posture'], 8, 'https://images.unsplash.com/photo-1594381898411-846e7d193883', 2),
 ('Coach Rakesh Reddy', 'Bodybuilding & Hypertrophy', 'Competitive bodybuilder specialising in muscle gain, contest prep and injury-proof lifting.', array['Hypertrophy','Contest prep','Mobility'], 10, 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5', 3),
 ('Coach Sana Mirza', 'Kids & Senior Fitness Specialist', 'Makes movement joyful for kids and safe for seniors, with a calm, patient coaching style.', array['Kids fitness','Senior fitness','Mobility'], 6, 'https://images.unsplash.com/photo-1574680096145-d05b474e2155', 4);
end if; end $seed$;

do $seed$ begin if not exists (select 1 from public.testimonials) then
insert into public.testimonials (name, program, quote, rating, result, sort_order) values
 ('Mohammed Arif', 'I AM THE FITTEST MAN', 'I lost 14 kg in 5 months and gained more strength than I ever had in college. The coaches actually care.', 5, '−14 kg in 5 months', 1),
 ('Sneha Reddy', 'I AM THE FITTEST WOMAN', 'The women''s batch made me comfortable from day one. My posture, energy and confidence are completely different.', 5, 'Stronger & confident', 2),
 ('Suresh Kumar (52)', 'I AM THE FITTEST ELDER (40+)', 'At 52 I thought my gym days were over. The trainers designed a plan around my knees and I feel 10 years younger.', 5, 'Pain-free & active', 3),
 ('Farah (mother of Zaid, 11)', 'I AM THE FITTEST KID', 'My son loves going. He is more disciplined, more active and finally off the screen.', 5, 'Active & disciplined', 4);
end if; end $seed$;

do $seed$ begin if not exists (select 1 from public.gallery) then
insert into public.gallery (title, category, image_url, sort_order) values
 ('Strength floor', 'Facility', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', 1),
 ('Heavy day', 'Training', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', 2),
 ('Conditioning zone', 'Facility', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e', 3),
 ('Racks & plates', 'Facility', 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1', 4),
 ('Women''s batch', 'Community', 'https://images.unsplash.com/photo-1546483875-ad9014c88eba', 5),
 ('Dumbbell row', 'Facility', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61', 6),
 ('Mobility class', 'Community', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 7),
 ('Barbell club', 'Training', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', 8);
end if; end $seed$;

do $seed$ begin if not exists (select 1 from public.banners) then
insert into public.banners (message, cta_label, cta_href, is_active) values
 ('New batch launch — join this month and get your first week free.', 'Claim free trial', '/contact#trial', true);
end if; end $seed$;

-- Sample hero video (YouTube). Replace in Admin → Videos with the gym's own footage.
-- insert into public.videos (title, source, src, placement, is_active) values ('Dangal promo', 'youtube', '<YOUTUBE_ID>', 'both', true);

-- ─── Make yourself the OWNER ───
-- 1. Supabase Dashboard → Authentication → Users → "Add user" (email + strong password).
-- 2. Then run (replace the email):
-- update public.profiles set role = 'owner', is_active = true, full_name = 'Owner'
--   where id = (select id from auth.users where email = 'owner@dangalgym.com');


-- ════════════════════════════════════════════════════════════════════════════
--  STEP 2 — make yourself the OWNER.  Replace the email, then run THIS PART ONLY (select it, then Run).
-- ════════════════════════════════════════════════════════════════════════════
-- update public.profiles set role = 'owner', is_active = true, full_name = 'Owner'
--   where id = (select id from auth.users where email = 'YOUR-EMAIL@example.com');
