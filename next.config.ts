import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // PDF を検索エンジンに索引させない（要項/結果等に個人情報を含むため）。X-Robots-Tag: noindex, noarchive。
  //
  // 配信経路ごとの noindex 担当：
  // - /pdf/**・/wp-content/uploads/**・/documents/** → Route Handler(lib/storage-proxy) が配信時に明示付与。
  // - public/about・public/policy の静的PDF（external_url の相対パスで配信）→ ここで付与。
  // 両者はパスが重ならないため二重付与は起きない（Route Handler 側を正、本設定は静的PDF用）。
  //
  // robots.txt では PDF を Disallow しない：Disallow すると noindex を読めずURLのみ索引の恐れ。クロールは許可。
  async headers() {
    return [
      {
        source: '/:dir(about|policy)/:file(.*\\.[pP][dD][fF])',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, noarchive' }],
      },
    ]
  },
}

export default nextConfig
