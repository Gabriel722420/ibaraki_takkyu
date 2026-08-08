import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'

// 未ログインは /admin/login へリダイレクト（redirect は never を返すため、
// 呼び出し側は返り値 user を非nullとして扱える）。
// ※ /admin/login 自身はこの関数を呼ばない（ガード対象外）。
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return user
}
