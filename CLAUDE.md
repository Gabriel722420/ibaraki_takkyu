# CLAUDE.md — 茨城県卓球連盟 公式サイト

## プロジェクト概要

一般社団法人茨城県卓球連盟の公式サイト（takkyu.ibaraki.jp）リニューアル。
現行 WordPress を廃し、Vercel + Supabase へ移行する。約10年運用してきた情報基盤の継承が前提。

## 技術スタック

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- Supabase（Postgres + Auth + Storage、@supabase/ssr）
- デプロイ：Vercel

## 重要な制約（契約・要件由来）

- 基本範囲：情報設計/グロナビ再構成、大会情報の構造化、部門別年間予定、レスポンシブ、更新機構、全件移行、テスト。
- v1 で作らないもの（追加検討・別見積）：大会申込フォーム、担当者ごとのログイン/権限管理。
- 運用フローは不変：各担当者→メール→（管理者が）掲載。管理画面は単一管理者運用。
- 記録の掲載期間（5年/3年）は理事会協議事項。settings.record_retention_years の値だけで切替（物理削除せず非表示）。
- 高齢利用者が多い → 文字サイズ切替（UD）を常設。rem スケールで全体連動。
- PDF は管理画面から直接アップロード（FTP 廃止）。表示名・DL名はアップ後も変更可（物理パスは uuid 固定・不変、title が表示名）。

## データモデル（supabase/migrations/0001_init_schema.sql）

divisions（部門）/ tournaments（大会）/ tournament_documents（要項・組合せ・結果・連絡）/ announcements（お知らせ）/ resources（登録・資格資料）/ settings（掲載期間等）。
公開は is_published=true のみ RLS で読取可、書込は authenticated のみ。Storage バケット documents（public 読取・PDF のみ・25MB）。

## ディレクトリ

- app/tournaments … 大会一覧・詳細（doc をタイプ順に集約表示）
- app/admin/tournaments/[id]/documents … PDF 追加・表示名変更・削除
- components/{SiteHeader,TextSizeToggle,PdfUploader}
- lib/queries.ts … サーバー専用（next/headers 依存）。**クライアントから import 禁止**
- lib/docs.ts … 純粋関数・定数（DOC_ORDER, resolveDocUrl）。クライアントはこちらを使う
- lib/supabase/{server,client}.ts, lib/admin.ts, middleware.ts

## 規約・注意

- サーバー/クライアント境界：next/headers を含むモジュールをクライアントに巻き込まない（lib/queries はサーバーのみ）。境界事故は build で検出される。
- SUPABASE_SERVICE_ROLE_KEY はサーバー専用。NEXT_PUBLIC_ を付けない。.env.local はコミットしない。
- 認証：Supabase でサインアップ無効化＋管理者アカウント手動作成。将来の担当者ログインは is_admin 方式で拡張。

## 状態

- 完了：スキーマ、大会一覧/詳細、PDF管理（アップ+リネーム）、文字サイズ切替、ヘッダー/グロナビ、本番ビルド通過。
- 次：大会・お知らせ・資料の CRUD（管理画面を完成させ手挿し不要に）→ WP 全件移行スクリプト → TOP/おしらせ/登録資格/連盟情報の中身。

## デプロイ

main へ push → Vercel。env（URL/anon/service_role）を Vercel に登録。DB 変更は supabase db push。
