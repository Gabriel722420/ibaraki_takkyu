import { proxyStorageObject } from '@/lib/storage-proxy'

// 旧サイトの /pdf/** を Supabase Storage(archive バケット, キー pdf/**) から透過プロキシ。
// 現行URL不変・リダイレクトなし。.pdf には noindex を付与（lib/storage-proxy）。
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxyStorageObject(req, 'archive', ['pdf', ...path])
}
