# 茨城県卓球連盟 公式サイト（Next.js + Supabase）

## セットアップ

1. 依存インストール
   npm install
2. 環境変数：.env.local.example を .env.local にコピーし、Supabase の値を記入
3. データベース：Supabase プロジェクトを作成し、スキーマを反映
   - Supabase CLI 利用時：
     npx supabase link --project-ref <PROJECT_REF>
     npx supabase db push
   - もしくは supabase/migrations/0001_init_schema.sql を SQL Editor に貼り付けて実行
4. 管理ユーザー：Supabase Auth で「サインアップを無効化」し、管理者アカウントを手動作成
5. 開発起動
   npm run dev

## デプロイ（Vercel）

vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod

## 主要構成

- app/tournaments 大会情報（一覧・詳細＝要項/組合せ/結果/連絡を集約）
- app/admin/.../documents 管理：PDFアップロード＋表示名の変更
- components/TextSizeToggle 文字サイズ切替（UD）
- supabase/migrations スキーマ（RLS・Storage 含む）
