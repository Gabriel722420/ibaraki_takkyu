import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { FormField } from '@/lib/types'

// 組み立て中フォームの簡易プレビュー（送信機能なし・第2弾で実装）
export function FormPreview({
  title,
  description,
  fields,
}: {
  title: string
  description: string | null
  fields: FormField[]
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-base font-bold">{title || '（無題）'}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-4 space-y-4">
        {fields.map((f) => (
          <div key={f.id} className="grid gap-1.5">
            <label className="text-sm font-medium">
              {f.label}
              {f.required && <span className="ml-0.5 text-destructive">*</span>}
            </label>
            <PreviewControl field={f} />
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">項目がありません。</p>
        )}
      </div>
    </div>
  )
}

function PreviewControl({ field }: { field: FormField }) {
  const ph = field.placeholder ?? ''
  switch (field.field_type) {
    case 'textarea':
      return <Textarea rows={3} placeholder={ph} disabled />
    case 'select':
      return (
        <select
          disabled
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option>選択してください</option>
          {field.options.map((o, i) => (
            <option key={i}>{o}</option>
          ))}
        </select>
      )
    case 'radio':
      return (
        <div className="space-y-1">
          {field.options.map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <input type="radio" disabled /> {o}
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className="space-y-1">
          {field.options.map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled /> {o}
            </label>
          ))}
        </div>
      )
    case 'number':
      return <Input type="number" placeholder={ph} disabled />
    case 'date':
      return <Input type="date" disabled />
    case 'email':
      return <Input type="email" placeholder={ph} disabled />
    default:
      return <Input placeholder={ph} disabled />
  }
}
