-- ── 拡張 ─────────────────────────────
create extension if not exists pgcrypto;

-- ── 部門マスタ ───────────────────────
create table divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── 大会 ─────────────────────────────
create table tournaments (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete set null,
  fiscal_year int not null,
  title text not null,
  event_date date,
  venue text,
  summary text,
  is_published boolean not null default false,
  archived_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on tournaments (fiscal_year, division_id);
create index on tournaments (event_date);

-- ── 大会付属資料 (要項/組合せ/結果/連絡を1大会に集約) ──
create type tournament_doc_type as enum ('要項','組合せ','結果','連絡');
create table tournament_documents (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  doc_type tournament_doc_type not null,
  title text not null,
  file_path text,
  external_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index on tournament_documents (tournament_id, doc_type);

-- ── お知らせ ─────────────────────────
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  published_at timestamptz not null default now(),
  is_published boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on announcements (published_at desc);

-- ── 資料 (登録・資格情報など) ─────────
create table resources (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  file_path text,
  external_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── サイト設定 (掲載期間ポリシー等) ───
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into settings (key, value) values
  ('record_retention_years', '5'::jsonb);

-- ── updated_at 自動更新 ──────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger trg_tournaments_updated  before update on tournaments
  for each row execute function set_updated_at();
create trigger trg_announcements_updated before update on announcements
  for each row execute function set_updated_at();

-- ── RLS ──────────────────────────────
alter table divisions            enable row level security;
alter table tournaments          enable row level security;
alter table tournament_documents enable row level security;
alter table announcements        enable row level security;
alter table resources            enable row level security;
alter table settings             enable row level security;

create policy pub_read_divisions on divisions   for select using (true);
create policy pub_read_tourn on tournaments      for select using (is_published);
create policy pub_read_tdoc on tournament_documents for select using (is_published);
create policy pub_read_ann on announcements      for select using (is_published);
create policy pub_read_res on resources          for select using (is_published);
create policy pub_read_set on settings           for select using (true);

create policy auth_all_divisions on divisions   for all to authenticated using (true) with check (true);
create policy auth_all_tourn on tournaments      for all to authenticated using (true) with check (true);
create policy auth_all_tdoc on tournament_documents for all to authenticated using (true) with check (true);
create policy auth_all_ann on announcements      for all to authenticated using (true) with check (true);
create policy auth_all_res on resources          for all to authenticated using (true) with check (true);
create policy auth_all_set on settings           for all to authenticated using (true) with check (true);

-- ── Storage: 資料(PDF)バケット ───────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents','documents', true, 26214400, array['application/pdf'])
on conflict (id) do nothing;

create policy "public read documents" on storage.objects
  for select using (bucket_id = 'documents');
create policy "auth write documents" on storage.objects
  for all to authenticated using (bucket_id = 'documents') with check (bucket_id = 'documents');
