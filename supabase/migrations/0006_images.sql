-- 本文用の画像 Storage バケットと、announcements/games への添付画像カラムを追加。
-- 既存方針踏襲：public 読取・authenticated 書込・許可mimeは画像のみ。

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');
create policy "auth write images" on storage.objects
  for all to authenticated using (bucket_id = 'images') with check (bucket_id = 'images');

-- 添付画像（1枚）。物理パスは uuid 固定、public バケット。
alter table announcements add column if not exists image_path text;
alter table games         add column if not exists image_path text;
