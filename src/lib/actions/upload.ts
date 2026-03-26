'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { url: null, error: error.message }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return { url: publicUrl, error: null }
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    return { url: null, error: error.message }
  }

  return { url: data.signedUrl, error: null }
}
