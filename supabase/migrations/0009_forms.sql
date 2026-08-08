-- 大会参加申込フォーム（第1弾＝ビルダー土台）。
-- forms: フォーム本体 / form_fields: 項目 / form_submissions: 回答（第2弾で使用）。

create type form_field_type as enum (
  'text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date', 'email'
);

create table forms (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete set null, -- 単独フォームも許容(null可)
  title text not null,
  description text,
  slug text unique not null,                 -- 発行URL用 /apply/[slug]
  status text not null default 'draft',       -- draft / published
  open_at timestamptz,
  close_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on forms (game_id);

create table form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  field_type form_field_type not null default 'text',
  label text not null default '項目',
  placeholder text,
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb, -- select/radio/checkbox の選択肢（文字列配列）
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index on form_fields (form_id, sort_order);

create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);
create index on form_submissions (form_id, submitted_at desc);

-- updated_at 自動更新（既存 set_updated_at 関数を再利用）
create trigger trg_forms_updated before update on forms
  for each row execute function set_updated_at();

-- ── RLS ──
alter table forms            enable row level security;
alter table form_fields      enable row level security;
alter table form_submissions enable row level security;

-- 管理（authenticated）は全操作可
create policy auth_all_forms on forms
  for all to authenticated using (true) with check (true);
create policy auth_all_form_fields on form_fields
  for all to authenticated using (true) with check (true);
create policy auth_all_form_submissions on form_submissions
  for all to authenticated using (true) with check (true);

-- 公開（第2弾で使用）：published のフォーム/項目のみ select 可（期間判定はクエリ側）
create policy pub_read_forms on forms
  for select using (status = 'published');
create policy pub_read_form_fields on form_fields
  for select using (
    exists (select 1 from forms f where f.id = form_id and f.status = 'published')
  );
-- form_submissions への公開 insert は第2弾で設計（今は管理のみ）
