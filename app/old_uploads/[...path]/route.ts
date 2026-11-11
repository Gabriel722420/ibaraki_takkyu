import { proxyStorageObject } from '@/lib/storage-proxy'

// 旧サイトの /old_uploads/**（約306 PDF）を Supabase Storage(archive バケット,
// キー old_uploads/**) から透過プロキシ。現行URL不変。.pdf には noindex を付与。
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxyStorageObject(req, 'archive', ['old_uploads', ...path])
}
