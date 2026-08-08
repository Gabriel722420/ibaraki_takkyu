import type { FormFieldType } from '@/lib/types'

// フィールド種別の表示ラベルと、選択肢を持つ種別の判定（純粋・クライアント可）
export const FIELD_TYPE_LABEL: Record<FormFieldType, string> = {
  text: '1行テキスト',
  textarea: '複数行テキスト',
  select: 'プルダウン',
  radio: 'ラジオ（単一選択）',
  checkbox: 'チェックボックス（複数選択）',
  number: '数値',
  date: '日付',
  email: 'メール',
}

export const FIELD_TYPES = Object.keys(FIELD_TYPE_LABEL) as FormFieldType[]

export function hasOptions(t: FormFieldType): boolean {
  return t === 'select' || t === 'radio' || t === 'checkbox'
}
