-- ④ TOP「大会情報更新履歴」。担当者が手入力する更新メッセージ（神奈川県卓球協会の「更新履歴」準拠）。
-- 日付（posted_at）＋部門タグ（division_id）＋本文（body）。導線先の大会は game_id（任意）。
-- TOP表示は「掲載から30日」で自動非表示＝アプリ側 .gte('posted_at', 今日-30)（cron不要・動的）。
-- 予約投稿は既存作法（is_published AND (publish_at IS NULL OR publish_at <= now())）に合わせ任意対応。
create table game_updates (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,        -- 導線先の大会（任意）
  division_id uuid references divisions(id) on delete set null, -- 部門タグ（神奈川の色分け相当）
  body text not null,                                          -- 更新メッセージ本文
  posted_at date not null default current_date,                -- 掲載日（30日フィルタの起点）
  is_published boolean not null default true,
  publish_at timestamptz,                                      -- 予約投稿（任意）
  created_at timestamptz not null default now()
);
create index on game_updates (posted_at desc);

-- RLS：公開は is_published のみで読取可（30日/予約ゲートはクエリ側。announcements/games と同方針）。
alter table game_updates enable row level security;
create policy pub_read_gupd on game_updates for select using (is_published);
create policy auth_all_gupd on game_updates
  for all to authenticated using (true) with check (true);
