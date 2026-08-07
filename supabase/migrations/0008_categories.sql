-- お知らせ分類：WordPress のカテゴリ階層を忠実に再現する categories を新設し、
-- announcements に category_id を紐付ける。divisions/games（大会用）は不変。

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id) on delete set null,
  sort_order int not null default 0,
  wp_term_id int unique, -- 冪等移行の安定キー（WPカテゴリID）
  created_at timestamptz not null default now()
);
create index on categories (parent_id);

alter table categories enable row level security;
create policy pub_read_categories on categories for select using (true);
create policy auth_all_categories on categories
  for all to authenticated using (true) with check (true);

-- お知らせにカテゴリと移行キーを追加
alter table announcements
  add column if not exists category_id uuid references categories(id) on delete set null;
alter table announcements
  add column if not exists wp_post_id int unique; -- 冪等移行の安定キー（WP記事ID）
create index on announcements (category_id);
