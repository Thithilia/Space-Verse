create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  name text not null,
  homepage_url text not null,
  feed_url text not null,
  source_type text not null default 'rss' check (source_type in ('rss', 'arxiv')),
  default_field text not null default 'general',
  enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_raw_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.news_sources(id) on delete cascade,
  canonical_url text not null,
  title text not null,
  summary text,
  author text,
  published_at timestamptz,
  image_url text,
  content_hash text not null unique,
  raw_payload jsonb not null default '{}'::jsonb,
  draft_status text not null default 'pending' check (draft_status in ('pending', 'drafted', 'skipped', 'error')),
  draft_error text,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (source_id, canonical_url)
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  raw_item_id uuid unique references public.news_raw_items(id) on delete set null,
  source_id uuid references public.news_sources(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'rejected')),
  slug text not null unique,
  static_slug text,
  title_vi text not null,
  summary_vi text not null,
  why_it_matters_vi text not null,
  body_vi text not null,
  source_name text not null,
  source_url text not null,
  source_published_at timestamptz,
  field text not null default 'general',
  tags text[] not null default '{}'::text[],
  image_url text,
  image_credit text,
  image_source_url text,
  featured_static boolean not null default false,
  static_export_status text not null default 'none' check (static_export_status in ('none', 'pending', 'needs_github_config', 'pr_opened', 'committed', 'error')),
  static_export_error text,
  published_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_articles_status_published_idx
  on public.news_articles (status, source_published_at desc);

create index if not exists news_raw_items_draft_status_idx
  on public.news_raw_items (draft_status, published_at desc);

create or replace function public.is_news_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.news_sources enable row level security;
alter table public.news_raw_items enable row level security;
alter table public.news_articles enable row level security;

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
on public.admin_profiles
for select
to authenticated
using (public.is_news_admin());

drop policy if exists "Public can read enabled news sources" on public.news_sources;
create policy "Public can read enabled news sources"
on public.news_sources
for select
to anon, authenticated
using (enabled = true or public.is_news_admin());

drop policy if exists "Admins can manage news sources" on public.news_sources;
create policy "Admins can manage news sources"
on public.news_sources
for all
to authenticated
using (public.is_news_admin())
with check (public.is_news_admin());

drop policy if exists "Admins can read raw news items" on public.news_raw_items;
create policy "Admins can read raw news items"
on public.news_raw_items
for select
to authenticated
using (public.is_news_admin());

drop policy if exists "Admins can manage raw news items" on public.news_raw_items;
create policy "Admins can manage raw news items"
on public.news_raw_items
for all
to authenticated
using (public.is_news_admin())
with check (public.is_news_admin());

drop policy if exists "Public can read published articles" on public.news_articles;
create policy "Public can read published articles"
on public.news_articles
for select
to anon, authenticated
using (status = 'published' or public.is_news_admin());

drop policy if exists "Admins can manage articles" on public.news_articles;
create policy "Admins can manage articles"
on public.news_articles
for all
to authenticated
using (public.is_news_admin())
with check (public.is_news_admin());

insert into public.news_sources (source_key, name, homepage_url, feed_url, source_type, default_field, enabled, notes)
values
  ('esa-top-news', 'ESA', 'https://www.esa.int/Services/RSS_Feeds', 'https://www.esa.int/rssfeed/TopNews', 'rss', 'general', true, 'Official ESA top news RSS feed.'),
  ('jpl-news', 'NASA Jet Propulsion Laboratory', 'https://www.jpl.nasa.gov/rss/', 'https://www.jpl.nasa.gov/feeds/news/', 'rss', 'general', true, 'Official JPL news feed.'),
  ('nasa-science-news', 'NASA Science', 'https://science.nasa.gov/blogs/science-news/', 'https://science.nasa.gov/blogs/science-news/feed/', 'rss', 'general', true, 'NASA Science news feed.'),
  ('nasa-earth-observatory-image', 'NASA Earth Observatory', 'https://science.nasa.gov/earth/earth-observatory/subscribe/feeds/', 'https://earthobservatory.nasa.gov/feeds/image-of-the-day.rss', 'rss', 'remote_sensing', true, 'Official Earth Observatory Image of the Day feed.'),
  ('nasa-photojournal-universe', 'NASA Photojournal', 'https://science.nasa.gov/photojournal/rss-feeds/', 'https://science.nasa.gov/feed/photojournal/gallery/universe/', 'rss', 'astrophysics', true, 'NASA Photojournal universe feed.'),
  ('arxiv-astro-ph', 'arXiv astro-ph', 'https://arxiv.org/archive/astro-ph', 'https://export.arxiv.org/rss/astro-ph', 'rss', 'astrophysics', true, 'arXiv RSS feed for astrophysics preprints.'),
  ('arxiv-space-ph', 'arXiv physics.space-ph', 'https://arxiv.org/list/physics.space-ph/recent', 'https://export.arxiv.org/rss/physics.space-ph', 'rss', 'space_physics', true, 'arXiv RSS feed for space physics preprints.'),
  ('webb-news', 'James Webb Space Telescope', 'https://webbtelescope.org/news', 'https://webbtelescope.org/news.rss', 'rss', 'astrophysics', false, 'Disabled until feed/licensing is verified.'),
  ('hubble-news', 'HubbleSite', 'https://hubblesite.org/news', 'https://hubblesite.org/rss/news', 'rss', 'astrophysics', false, 'Disabled until feed/licensing is verified.'),
  ('chandra-news', 'Chandra X-ray Observatory', 'https://chandra.harvard.edu/press/', 'https://chandra.harvard.edu/press/rss.xml', 'rss', 'astrophysics', false, 'Disabled until feed/licensing is verified.')
on conflict (source_key) do update set
  name = excluded.name,
  homepage_url = excluded.homepage_url,
  feed_url = excluded.feed_url,
  source_type = excluded.source_type,
  default_field = excluded.default_field,
  enabled = excluded.enabled,
  notes = excluded.notes,
  updated_at = now();
