// クライアント専用：画像を自動圧縮して images バケットへアップロードし、公開URLを返す。
// RichTextEditor の本文内画像挿入で使用（サーバーから import しないこと）。
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { resolveImageUrl } from '@/lib/docs'

export async function uploadCompressedImage(
  file: File,
  prefix: string,
): Promise<{ path: string; url: string }> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1600,
    initialQuality: 0.8,
    maxSizeMB: 2,
    useWebWorker: true,
  })
  const supabase = createClient()
  const ext = (compressed.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('images')
    .upload(path, compressed, {
      contentType: compressed.type,
      upsert: false,
    })
  if (error) throw error
  return { path, url: resolveImageUrl(path)! }
}
