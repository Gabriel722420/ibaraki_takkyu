# CLAUDE.md — 茨城県卓球連盟 公式サイト

## プロジェクト概要

一般社団法人茨城県卓球連盟の公式サイト（takkyu.ibaraki.jp）リニューアル。
現行 WordPress を廃し、Vercel + Supabase へ移行する。約10年運用してきた情報基盤の継承が前提。
本番テスト環境：https://test2026.takkyu.ibaraki.jp （Basic認証で保護）。

## 技術スタック

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4 / shadcn/ui（**管理画面のみ**・radix-nova）
- Supabase（Postgres + Auth + Storage、@supabase/ssr）
- デプロイ：Vercel（main へ push で自動、または `vercel --prod`）

## 重要な制約（契約・要件由来）

- 運用フローは不変：各担当者→メール→（管理者が）掲載。管理画面は単一管理者運用。
- 記録の掲載期間：**現運用は全期間公開**（games の retention フィルタは撤廃済み）。settings.record_retention_years と getRetentionYears() は残置＝理事会決定で再導入可（適用ポイントは lib/queries にコメント）。
- 高齢利用者が多い → 公開側は文字サイズ切替（UD・rem連動）＋大きめ余白＋Arial。**公開側デザインは #133e96 基調で不変を厳守**。
- PDF は管理画面から直接アップロード（FTP廃止・documents バケット・物理パス uuid 固定・title が表示名）。5MB超のスキャンPDFはブラウザ内で自動圧縮（pdfjs-dist+jspdf、失敗時は原本）。

## 現状の到達点（実装済み）

- **命名**：tournaments を games に全レイヤーリネーム済み（URL/コード/DB）。
- **公開ページ**：TOP（近日大会／④大会情報更新履歴(30日)／⑤NEWS=新規お知らせ(365日)の縦並び）、/news（一覧＝カテゴリ階層絞り込み＋ページング, /news/[id]）、/games（年度括りの年間一覧＋状態自動判定, /games/[id] は要項/組み合わせ/上位結果/詳細結果/お知らせを集約）、/registration、/about、/policy。共通ヘッダー/フッター（#133e96）。
- **リッチ本文**：news.body / games.summary は Tiptap 製 HTML。表示は lib/sanitize（isomorphic-dompurify）でサニタイズ。本文内画像は images バケット（自動圧縮）。予約投稿（publish_at、クエリで公開判定・cron不要）。
- **DB化された編集**：settings に会長挨拶(about_*)・ポリシー(policy_*)。officers（役員・階層グルーピング表示）、categories（お知らせ分類・parent_id で階層）。
- **WP移行**：REST API 経由で 31カテゴリ＋2049記事を announcements へ全件移行済み（方式1＝1対1）。本文HTMLは **verbatim 保存（パス書き換えなし）**。冪等キー：categories.wp_term_id / announcements.wp_post_id。
  - ⚠ **本文中の絶対URL（https://takkyu.ibaraki.jp/pdf/... , /uploads/... , /old_uploads/... , /wp-content/uploads/...）はそのまま**。実ファイルは **Supabase Storage `archive` バケット（キー＝現行パス）** に置き、**Route Handler（app/pdf・app/uploads・app/old_uploads・app/wp-content/uploads）が透過プロキシ**で現行パス不変配信（FTP廃止）。全PDF 3,847件は pdf/(2,117)＋uploads/(1,424)＋old_uploads/(306)＋wp-content/uploads に分散。ドメイン切替で本文の絶対URLが生きる。
- **認証/基盤**：Basic認証（middleware.ts・依存ゼロ）、GA4（G-6NZR9MQ159）、管理ログイン/ログアウト/パスワード変更。
- **Route Group 分離**：`app/(public)/*`（公開・SiteHeader/Footer）と `app/admin/(panel)/*`（管理・shadcn サイドバー）。`app/admin/login` はグループ外（chrome無し）。ルート layout は `<html>` シェルのみ。
- **管理UI**：shadcn/ui（Table/Dialog/DropdownMenu/Switch/sonner 等）で wp-admin 風（暗色サイドバー #1d2327・現在地のみ #133e96 ハイライト・アイコン）。shadcn は `.admin-shell` スコープに隔離し公開側トークンを侵さない。

## データモデル（supabase/migrations/）

- 0001 初期：divisions / games(旧tournaments) / game_documents(要項・組合せ・結果・連絡) / announcements / resources / settings。
- 0002 rename tournaments→games、0003 about(officers新設+settings)、0004 policy(settings+resources)、0005 policy_contact、0006 images(バケット+image_path)、0007 publish_at(予約投稿)、0008 categories(階層+announcements.category_id)。
- 0009 forms（申込フォーム：forms / form_fields / form_submissions）。
- 0010 result_two_tier（game_doc_type に 上位結果/詳細結果 を追加。レガシー結果は残置）。
- 0011 game_updates（④大会情報更新履歴：手入力メッセージ＋部門タグ＋posted_at＋RLS）。
- 0012 archive（旧サイト静的資産 2.7GB 用 public バケット。キー＝現行パスそのまま pdf/**・uploads/**・old_uploads/**・wp-content/uploads/**）。
- 公開は is_published=true（＋publish_at到来）で RLS 読取可、書込は authenticated のみ。Storage：documents(PDF/25MB)・images(jpg/png/webp/10MB)。
- **掲載期間フィルタ（cron不要・動的）**：retentionCutoff(N)＝JST「今日−N日」を下限に .gte で判定。③詳細結果=365日(created_at)／④更新履歴=30日(posted_at)／⑤NEWS=365日(published_at)。③上位結果・レガシー結果は永続。
- **③大会結果2層化（2027〜）**：詳細＝要項/組み合わせ/上位結果(永続)/詳細結果(365日)/お知らせ(=連絡の表示読替)。DOC_ORDER/DOC_LABEL/RESULT_DETAIL_RETENTION_DAYS は lib/docs.ts。2027線引きは fiscal_year＋運用規約＋UI既定（schemaフラグ無し）。
- **⑤TOP NEWS=新規お知らせのみ**：wp_post_id IS NULL で移行2049件と区別（TOP非露出）。2049件は /news/[wp_post_id] で据え置き（本件対象外）。

## ディレクトリ

- app/(public)/… 公開ページ（page=TOP, news, games, registration, about, policy）
- app/admin/(panel)/… 管理（games, game-updates, news, resources, categories, divisions, officers, about, policy, account, forms）＋ layout(shadcn Sidebar)。game-updates は大会PDFアップ画面(DocumentsEditor)からも半自動起票可。
- app/admin/login … ログイン（ガード対象外）
- components/ui/… shadcn。components/admin/… 管理共通（AdminShell, RowActions, FormKit, StatusBadges 等）
- lib/queries.ts … **サーバー専用**（クライアントから import 禁止）。lib/docs.ts / lib/nav.ts / lib/admin-nav.ts … 純粋物（クライアント可）。lib/sanitize.ts … サーバー専用。
- lib/supabase/{server,client}.ts, lib/admin.ts(requireAdmin→未ログインは /admin/login へ redirect), middleware.ts(Basic認証)

## 規約・注意

- サーバー/クライアント境界：next/headers 依存（lib/queries, lib/sanitize）をクライアントに巻き込まない。境界事故は build で検出。
- SUPABASE_SERVICE_ROLE_KEY はサーバー専用（NEXT_PUBLIC_ 禁止）。.env.local はコミットしない。
- shadcn は管理スコープのみ。**公開側の @theme(#133e96)/Arial/文字サイズ切替を壊さない**（変更時は公開CSSに #133e96/Arial 残存を必ず確認）。
- service_role を使う Node スクリプトは supabase-js の realtime(WebSocket) が Node20 で落ちるため **PostgREST を直接 fetch**（scripts/migrate-wp.mjs 参照）。

## 今後の申し送り（残タスク）

- **最後に実施**：旧サイト静的資産(2.7GB/約7,808件)を住吉PCで `scripts/upload-archive.mjs` により `archive` バケットへ一括アップロード（冪等・再開可能）＋ 独自ドメイン切替。配信は Route Handler プロキシ（実装済み）。
- **全PDF noindex 統一**：archive・documents(新規admin PDF)とも自ドメイン経由(Route Handler, lib/storage-proxy)で `X-Robots-Tag: noindex, noarchive`。静的 about/policy PDF は next.config headers()。documents は Supabase 直URLをやめ `/documents/<file_path>` 経由(resolveDocUrl)。
- WP移行 2049件の **サニタイズ影響チェック**（figure/table 等が lib/sanitize 許可範囲で崩れないか、実データで確認）。
- /registration の実データ投入（登録・資格カテゴリ）。
- **orphan 掃除**：旧 components/admin/ImageUploader（現在未使用）等。※FormKit は現行フォーム基盤として使用中。
- `npm audit` high（pdf/jspdf 系推移依存）の精査。
- **申込フォーム**：第1弾＝ビルダー土台（本タスク）。第2弾＝公開フォーム /apply/[slug] の描画と送信(form_submissions insert・RLS公開insert)。第3弾＝回答管理/CSV出力。

## デプロイ

main へ push → Vercel（自動）／`vercel --prod`。env（URL/anon/service_role/BASIC_AUTH_*）は Vercel に登録済み。DB 変更は `supabase db push`（realtime非対応のため確認プロンプトは `yes |`）。
