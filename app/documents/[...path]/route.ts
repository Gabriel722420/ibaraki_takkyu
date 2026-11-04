import { proxyStorageObject } from '@/lib/storage-proxy'

// 新規admin PDF（documents バケット・uuidキー）を「自ドメイン経由」で配信し ⑥ noindex を適用。
// 従来は Supabase 直URLで配信していたため noindex が効かない穴があった（結果PDF等は個人情報を含む）。
// resolveDocUrl が /documents/<file_path> を返し、ここが documents バケットから透過プロキシする。
// ?download=表示名.pdf は search として upstream に透過（Supabase が Content-Disposition 付与）。
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxyStorageObject(req, 'documents', path)
}
