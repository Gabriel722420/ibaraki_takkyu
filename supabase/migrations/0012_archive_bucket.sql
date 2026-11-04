-- 旧サイトの静的資産（PDF 3,847件・画像530件・2.7GB）を置く public バケット `archive`。
-- キー＝現行パスそのまま（例 pdf/2024/令和6年度要項.pdf / wp-content/uploads/2023/08/x.jpg）＝現行URLと1:1。
-- 自ドメインの Route Handler（/pdf・/wp-content/uploads）が透過プロキシし、URLは一切変えない。
-- 既存 documents/images と同方針：public 読取・authenticated 書込。mime無制限（PDF/画像/他が混在）。
-- file_size_limit=100MB（大判スキャンPDF対策。超過が出たら引き上げ or TUS resumable を使用）。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('archive', 'archive', true, 104857600, null)
on conflict (id) do nothing;

create policy "public read archive" on storage.objects
  for select using (bucket_id = 'archive');
create policy "auth write archive" on storage.objects
  for all to authenticated using (bucket_id = 'archive') with check (bucket_id = 'archive');
