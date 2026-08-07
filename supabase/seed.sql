-- 動作確認用シード（初期環境の疎通テスト用。本番投入前に削除可）
-- 固定 UUID なので、投入後すぐ管理画面URLを叩ける:
--   /admin/games/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/documents

insert into divisions (id, name, slug, sort_order) values
  ('11111111-1111-1111-1111-111111111111','一般','ippan',10),
  ('22222222-2222-2222-2222-222222222222','ジュニア','junior',20)
on conflict (id) do nothing;

insert into games (id, division_id, fiscal_year, title, event_date, venue, summary, is_published) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '11111111-1111-1111-1111-111111111111',
   2026,'第70回 茨城県卓球選手権大会（サンプル）','2026-09-15','水戸市総合体育館',
   '初期環境の疎通確認用サンプルです。',true)
on conflict (id) do nothing;
