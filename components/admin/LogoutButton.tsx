'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="rounded border px-4 py-2 text-sm disabled:opacity-50"
    >
      {busy ? 'ログアウト中…' : 'ログアウト'}
    </button>
  )
}
