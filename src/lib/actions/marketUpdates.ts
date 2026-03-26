'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAgent } from '@/lib/auth'
import { marketUpdateSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'

export async function createMarketUpdate(formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    attachmentUrl: (formData.get('attachmentUrl') as string) || '',
  }

  const parsed = marketUpdateSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase.from('market_updates').insert({
    title: parsed.data.title,
    body: parsed.data.body,
    attachment_url: parsed.data.attachmentUrl || null,
    published_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/market-updates')
  return { success: true }
}

export async function deleteMarketUpdate(updateId: string) {
  await requireAgent()
  const supabase = await createClient()
  const { error } = await supabase.from('market_updates').delete().eq('id', updateId)
  if (error) return { error: error.message }
  revalidatePath('/admin/market-updates')
  return { success: true }
}
