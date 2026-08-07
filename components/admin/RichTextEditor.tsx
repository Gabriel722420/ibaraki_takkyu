'use client'
import { useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'
import { toContentHtml } from '@/lib/docs'
import { uploadCompressedImage } from '@/lib/image-upload'

// 固定パレット（自由入力は不可）
const COLORS: { label: string; value: string }[] = [
  { label: '標準', value: '#1a1a1a' },
  { label: '青', value: '#0049a2' },
  { label: '赤', value: '#c0392b' },
  { label: '緑', value: '#2e7d32' },
]

export function RichTextEditor({
  value,
  onChange,
  imagePrefix,
}: {
  value: string | null
  onChange: (html: string) => void
  imagePrefix: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      TextStyle,
      Color,
      Image.configure({ inline: false }),
    ],
    content: toContentHtml(value),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'richtext min-h-[12rem] rounded-b border border-t-0 px-3 py-2 focus:outline-none',
      },
    },
  })

  if (!editor) {
    return (
      <div className="rounded border p-3 text-sm text-gray-500">
        エディタを読み込み中…
      </div>
    )
  }

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
    setUploading(true)
    try {
      const { url } = await uploadCompressedImage(file, imagePrefix)
      editor.chain().focus().setImage({ src: url }).run()
    } catch {
      // 失敗時は何もしない（本文は保持）
    } finally {
      setUploading(false)
    }
  }

  function setLink() {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('リンク先URL（空にすると解除）', prev ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
  }

  return (
    <div>
      <Toolbar
        editor={editor}
        onLink={setLink}
        onImage={() => fileRef.current?.click()}
        uploading={uploading}
      />
      <EditorContent editor={editor} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={pickImage}
      />
    </div>
  )
}

function Toolbar({
  editor,
  onLink,
  onImage,
  uploading,
}: {
  editor: Editor
  onLink: () => void
  onImage: () => void
  uploading: boolean
}) {
  const btn = 'rounded border px-2 py-1 text-sm min-w-[2.25rem] min-h-[2.25rem]'
  const on = 'bg-black text-white'
  const off = 'bg-white text-gray-800'
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t border bg-gray-50 p-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btn} ${editor.isActive('bold') ? on : off} font-bold`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btn} ${editor.isActive('italic') ? on : off} italic`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`${btn} ${editor.isActive('underline') ? on : off} underline`}
      >
        U
      </button>
      <span className="mx-1 text-gray-300">|</span>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`${btn} ${editor.isActive('heading', { level: 2 }) ? on : off}`}
      >
        見出し
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={`${btn} ${editor.isActive('heading', { level: 3 }) ? on : off}`}
      >
        小見出し
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${btn} ${editor.isActive('bulletList') ? on : off}`}
      >
        ・箇条書き
      </button>
      <span className="mx-1 text-gray-300">|</span>
      <button type="button" onClick={onLink} className={`${btn} ${off}`}>
        リンク
      </button>
      <button
        type="button"
        onClick={onImage}
        disabled={uploading}
        className={`${btn} ${off} disabled:opacity-50`}
      >
        {uploading ? '画像処理中…' : '画像'}
      </button>
      <span className="mx-1 text-gray-300">|</span>
      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => editor.chain().focus().setColor(c.value).run()}
          className={`${btn} ${off}`}
          title={`文字色：${c.label}`}
          aria-label={`文字色：${c.label}`}
        >
          <span
            className="inline-block h-4 w-4 rounded-full border align-middle"
            style={{ backgroundColor: c.value }}
          />
        </button>
      ))}
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetColor().run()}
        className={`${btn} ${off}`}
        title="文字色をクリア"
      >
        色クリア
      </button>
    </div>
  )
}
