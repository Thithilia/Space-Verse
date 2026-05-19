drop policy if exists "Public can read published articles" on public.news_articles;
create policy "Public can read published articles"
on public.news_articles
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Admins can read all articles" on public.news_articles;
create policy "Admins can read all articles"
on public.news_articles
for select
to authenticated
using (public.is_news_admin());

drop policy if exists "Admins can insert articles" on public.news_articles;
create policy "Admins can insert articles"
on public.news_articles
for insert
to authenticated
with check (public.is_news_admin());

drop policy if exists "Admins can update articles" on public.news_articles;
create policy "Admins can update articles"
on public.news_articles
for update
to authenticated
using (public.is_news_admin())
with check (public.is_news_admin());

drop policy if exists "Admins can delete articles" on public.news_articles;
create policy "Admins can delete articles"
on public.news_articles
for delete
to authenticated
using (public.is_news_admin());
