-- ③ 大会結果の2層化（2027大会〜）。
-- game_doc_type に「上位結果（永続）」「詳細結果（掲載365日で非表示）」を追加する。
-- レガシー「結果」（2026以前・WP移行分）はそのまま残置し、分類し直さない。
-- 表示順（DOC_ORDER）・保持日数（RESULT_DETAIL_RETENTION_DAYS=365）・「連絡→お知らせ」の
-- 表示ラベルはアプリ側（lib/docs.ts）で制御する。2027線引きは games.fiscal_year と運用規約＋UI既定で誘導。
--
-- ⚠ 注意: ALTER TYPE ... ADD VALUE は追加した値を「同一トランザクション内」で即利用できない。
--   本マイグレーションは値の追加のみを行い、これらの値を用いるデータ投入は別途（管理画面）で行うこと。
alter type game_doc_type add value if not exists '上位結果';
alter type game_doc_type add value if not exists '詳細結果';
