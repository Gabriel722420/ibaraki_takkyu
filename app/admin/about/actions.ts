'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function updateAboutSettings(input: {
  greeting: string
  sign: string
  image: string
}) {
  await requireAdmin()
  const supabase = await createClient()
  const rows = [
    { key: 'about_greeting', value: input.greeting },
    { key: 'about_greeting_sign', value: input.sign },
    { key: 'about_greeting_image', value: input.image.trim() },
  ]
  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' })
  if (error) throw error
  revalidatePath('/admin/about')
  revalidatePath('/about')
}
