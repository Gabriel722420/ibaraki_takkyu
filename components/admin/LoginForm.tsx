'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Field, inputClass } from '@/components/admin/FormKit'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = email.trim().length > 0 && password.length > 0

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        // 詳細は出しすぎない
        setError('メールアドレスまたはパスワードが違います。')
        setBusy(false)
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('ログインに失敗しました。時間をおいて再度お試しください。')
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <Field label="メールアドレス">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          className={inputClass}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
      </Field>

      <Field label="パスワード">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className={inputClass}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={busy || !canSubmit}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {busy ? 'ログイン中…' : 'ログイン'}
      </button>
    </div>
  )
}
