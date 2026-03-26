'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAgent } from '@/lib/auth'
import { cmaSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'

export async function createCMA(propertyId: string, formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    pdfUrl: formData.get('pdfUrl') as string,
  }

  const parsed = cmaSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase.from('cmas').insert({
    property_id: propertyId,
    title: parsed.data.title,
    body: parsed.data.body,
    pdf_url: parsed.data.pdfUrl,
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.from('activity_logs').insert({
    property_id: propertyId,
    message: `CMA "${parsed.data.title}" added`,
  })

  revalidatePath(`/admin/properties/${propertyId}/cma`)
  revalidatePath(`/properties/${propertyId}/cma`)
  return { success: true }
}

export async function updateCMA(cmaId: string, propertyId: string, formData: FormData) {
  await requireAgent()
  const supabase = await createClient()

  const rawData = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    pdfUrl: formData.get('pdfUrl') as string,
  }

  const parsed = cmaSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabase
    .from('cmas')
    .update({
      title: parsed.data.title,
      body: parsed.data.body,
      pdf_url: parsed.data.pdfUrl,
    })
    .eq('id', cmaId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/cma`)
  revalidatePath(`/properties/${propertyId}/cma`)
  return { success: true }
}

export async function deleteCMA(cmaId: string, propertyId: string) {
  await requireAgent()
  const supabase = await createClient()

  const { error } = await supabase.from('cmas').delete().eq('id', cmaId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/properties/${propertyId}/cma`)
  revalidatePath(`/properties/${propertyId}/cma`)
  return { success: true }
}

export async function getCMAs(propertyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cmas')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}
