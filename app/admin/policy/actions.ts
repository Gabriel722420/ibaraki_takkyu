'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function updatePolicySettings(input: {
  copyright: string
  trademark: string
  disclaimer: string
  contact: string
}) {
  await requireAdmin()
  const supabase = await createClient()
  const rows = [
    { key: 'policy_copyright', value: input.copyright },
    { key: 'policy_trademark', value: input.trademark },
    { key: 'policy_disclaimer', value: input.disclaimer },
    { key: 'policy_contact', value: input.contact },
  ]
  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' })
  if (error) throw error
  revalidatePath('/admin/policy')
  revalidatePath('/policy')
}
