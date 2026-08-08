'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Field, SaveBar, inputClass } from '@/components/admin/FormKit'

const MIN_LEN = 8

export function PasswordChangeForm() {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = pw.length >= MIN_LEN && confirm.length >= MIN_LEN

  async function save() {
    setError(null)
    setDone(false)
    if (pw.length < MIN_LEN) {
      setError(`パスワードは${MIN_LEN}文字以上にしてください。`)
      return
    }
    if (pw !== confirm) {
      setError('確認用パスワードが一致しません。')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: pw })
      if (error) throw error
      setDone(true)
      setPw('')
      setConfirm('')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'パスワードの変更に失敗しました。',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Field label="新しいパスワード（8文字以上）">
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <Field label="新しいパスワード（確認・再入力）">
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <SaveBar
        onSave={save}
        canSave={canSave}
        saving={saving}
        done={done}
        error={error}
        editing
        cancelHref="/admin"
      />
    </div>
  )
}
