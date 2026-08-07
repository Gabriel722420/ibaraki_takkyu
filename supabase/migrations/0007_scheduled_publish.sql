-- 予約投稿：announcements/games に publish_at を追加。
-- 公開判定はクエリ側で is_published AND (publish_at IS NULL OR publish_at <= now())。cron 不要。
alter table announcements add column if not exists publish_at timestamptz;
alter table games         add column if not exists publish_at timestamptz;
