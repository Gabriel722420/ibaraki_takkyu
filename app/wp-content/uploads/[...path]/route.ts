import { proxyStorageObject } from '@/lib/storage-proxy'

// 旧サイトの /wp-content/uploads/** を Supabase Storage(archive バケット,
// キー wp-content/uploads/**) から透過プロキシ。現行URL不変・リダイレクトなし。
// 画像が主だが .pdf が混在する場合は noindex を付与（lib/storage-proxy）。
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxyStorageObject(req, 'archive', ['wp-content', 'uploads', ...path])
}
