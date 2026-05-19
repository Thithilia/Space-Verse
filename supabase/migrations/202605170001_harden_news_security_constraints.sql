alter table public.news_sources
  drop constraint if exists news_sources_homepage_url_http,
  add constraint news_sources_homepage_url_http
  check (homepage_url ~* '^https?://');

alter table public.news_sources
  drop constraint if exists news_sources_feed_url_http,
  add constraint news_sources_feed_url_http
  check (feed_url ~* '^https?://');

alter table public.news_raw_items
  drop constraint if exists news_raw_items_canonical_url_http,
  add constraint news_raw_items_canonical_url_http
  check (canonical_url ~* '^https?://');

alter table public.news_raw_items
  drop constraint if exists news_raw_items_image_url_http,
  add constraint news_raw_items_image_url_http
  check (image_url is null or image_url ~* '^https?://');

alter table public.news_articles
  drop constraint if exists news_articles_source_url_http,
  add constraint news_articles_source_url_http
  check (source_url ~* '^https?://');

alter table public.news_articles
  drop constraint if exists news_articles_image_url_http,
  add constraint news_articles_image_url_http
  check (image_url is null or image_url ~* '^https?://');

alter table public.news_articles
  drop constraint if exists news_articles_image_source_url_http,
  add constraint news_articles_image_source_url_http
  check (image_source_url is null or image_source_url ~* '^https?://');

alter table public.news_articles
  drop constraint if exists news_articles_static_slug_safe,
  add constraint news_articles_static_slug_safe
  check (static_slug is null or static_slug ~ '^[a-z0-9-]+$');
