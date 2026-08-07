// テスト環境の閲覧制限用 Basic 認証。
// 外部依存ゼロ（next/server も import しない）で Edge を軽量・安全に保つ。
// BASIC_AUTH_USER / BASIC_AUTH_PASSWORD の両方が設定されている時だけ有効。
// 未設定ならローカル開発を妨げないよう素通り。

export function middleware(request: Request) {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASSWORD

  // 両env未設定なら素通り
  if (!user || !pass) return

  const header = request.headers.get('authorization') ?? ''
  if (header.startsWith('Basic ')) {
    const decoded = atob(header.slice(6)) // "user:pass"
    const sep = decoded.indexOf(':')
    const gotUser = decoded.slice(0, sep)
    const gotPass = decoded.slice(sep + 1)
    if (gotUser === user && gotPass === pass) return // 認証OK → 通す
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Restricted"',
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
