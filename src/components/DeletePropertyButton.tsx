'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProperty } from '@/lib/actions/properties'

export function DeletePropertyButton({
  propertyId,
  propertyTitle,
}: {
  propertyId: string
  propertyTitle: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete "${propertyTitle}"? This cannot be undone.`)) return
    setLoading(true)
    const result = await deleteProperty(propertyId)
    if (result?.error) {
      alert(`Error: ${result.error}`)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1 text-sm text-red-400 font-medium hover:text-red-600 transition-colors disabled:opacity-50 ml-4"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
