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
      className="rounded border border-white/50 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 disabled:opacity-50"
    >
      {busy ? 'ログアウト中…' : 'ログアウト'}
    </button>
  )
}
