import { proxyStorageObject } from '@/lib/storage-proxy'

// 旧サイトの /uploads/**（ルート直下・pdf/ とは別物。約1,424 PDF）を
// Supabase Storage(archive バケット, キー uploads/**) から透過プロキシ。現行URL不変。
// .pdf には noindex を付与（lib/storage-proxy）。
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxyStorageObject(req, 'archive', ['uploads', ...path])
}
