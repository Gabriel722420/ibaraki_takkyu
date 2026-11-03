import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // すべての PDF を検索エンジンに索引させない（大会要項/結果に参加者氏名等の個人情報を含むため）。
  // 方式：各 PDF レスポンスに X-Robots-Tag: noindex を付与（＋noarchive でキャッシュも抑止）。
  // 拡張子ベースで全階層（/pdf/**・/wp-content/uploads/** 等）を網羅。大文字 .PDF も対象。
  // これはパスベースのため本番ドメイン切替後（takkyu.ibaraki.jp）でも同一に効く。
  // robots.txt では PDF を Disallow しない：Disallow すると Googlebot がクロールできず
  // noindex を読めない（URLのみ索引の恐れ）。確実な非索引化のためクロールは許可する。
  async headers() {
    return [
      {
        source: '/:path(.*\\.[pP][dD][fF])',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, noarchive' }],
      },
    ]
  },
}

export default nextConfig
