// ブラウザ内 PDF 圧縮（スキャンPDF＝画像主体を対象）。
// 5MB超のみ実行。各ページを canvas に描画→JPEG化して jsPDF で再生成。
// 失敗時・効果が無い場合は原本を返す（アップロードを壊さない）。
// ※ client 専用（document/canvas 使用）。サーバーから import しないこと。

const THRESHOLD = 5 * 1024 * 1024 // 5MB
const TARGET_LONG_EDGE_PX = 1400 // 目標長辺（px）
const JPEG_QUALITY = 0.7

export async function maybeCompressPdf(
  file: File,
  onStatus?: (s: string) => void,
): Promise<File> {
  if (file.type !== 'application/pdf' || file.size <= THRESHOLD) return file

  try {
    onStatus?.('PDFを圧縮しています…')
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).href
    const { jsPDF } = await import('jspdf')

    const data = await file.arrayBuffer()
    const doc = await pdfjs.getDocument({ data }).promise

    let out: InstanceType<typeof jsPDF> | null = null
    for (let i = 1; i <= doc.numPages; i++) {
      onStatus?.(`圧縮中… (${i}/${doc.numPages}ページ)`)
      const page = await doc.getPage(i)
      const base = page.getViewport({ scale: 1 }) // pt 単位のページサイズ
      const longEdge = Math.max(base.width, base.height)
      const scale = Math.min(3, Math.max(0.5, TARGET_LONG_EDGE_PX / longEdge))
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff' // JPEG は透過不可のため白背景
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvas, canvasContext: ctx, viewport }).promise

      const jpeg = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      const orientation = base.width >= base.height ? 'l' : 'p'
      if (!out) {
        out = new jsPDF({
          orientation,
          unit: 'pt',
          format: [base.width, base.height],
        })
      } else {
        out.addPage([base.width, base.height], orientation)
      }
      out.addImage(jpeg, 'JPEG', 0, 0, base.width, base.height)
    }

    if (!out) return file
    const blob = out.output('blob') as Blob
    if (blob.size >= file.size) return file // 効果なし→原本
    onStatus?.('圧縮しました')
    return new File([blob], file.name, { type: 'application/pdf' })
  } catch {
    onStatus?.('圧縮できなかったため原本をアップロードします')
    return file
  }
}
