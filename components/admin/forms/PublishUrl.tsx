'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy } from 'lucide-react'

// 発行URLの表示＋コピー（実際の /apply/[slug] 描画は第2弾）
export function PublishUrl({
  slug,
  published,
}: {
  slug: string
  published: boolean
}) {
  const [origin, setOrigin] = useState('')
  // クライアントで origin を反映
  if (typeof window !== 'undefined' && origin === '') {
    setOrigin(window.location.origin)
  }
  const url = `${origin}/apply/${slug}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URLをコピーしました')
    } catch {
      toast.error('コピーに失敗しました。')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input readOnly value={url} className="font-mono text-xs" />
        <Button type="button" variant="outline" onClick={copy}>
          <Copy /> コピー
        </Button>
      </div>
      {!published ? (
        <p className="text-xs text-muted-foreground">
          ※ 現在は下書きです。「公開する」を保存すると有効になります（公開ページの描画は第2弾）。
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          ※ 公開URLの実ページ描画・送信は第2弾で実装予定です。
        </p>
      )}
    </div>
  )
}
