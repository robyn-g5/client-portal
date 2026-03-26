import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ClipboardList, Trash2, GripVertical } from 'lucide-react'

async function addTemplateItem(formData: FormData) {
  'use server'
  const { createClient: createSupabaseClient } = await import('@/lib/supabase/server')
  const { requireAgent: checkAgent } = await import('@/lib/auth')
  await checkAgent()
  const supabase = await createSupabaseClient()

  const templateId = formData.get('templateId') as string
  const label = formData.get('label') as string
  const description = formData.get('description') as string | null
  const isRequired = formData.get('isRequired') === 'true'
  const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

  if (!label) return

  await supabase.from('checklist_template_items').insert({
    template_id: templateId,
    label,
    description: description || null,
    is_required: isRequired,
    sort_order: sortOrder,
  })

  revalidatePath('/admin/templates')
}

async function deleteTemplateItem(formData: FormData) {
  'use server'
  const { createClient: createSupabaseClient } = await import('@/lib/supabase/server')
  const { requireAgent: checkAgent } = await import('@/lib/auth')
  await checkAgent()
  const supabase = await createSupabaseClient()

  const itemId = formData.get('itemId') as string
  await supabase.from('checklist_template_items').delete().eq('id', itemId)
  revalidatePath('/admin/templates')
}

export default async function AdminTemplatesPage() {
  await requireAgent()
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('checklist_templates')
    .select('*, checklist_template_items(*)')
    .order('created_at', { ascending: true })

  const defaultTemplate = templates?.find(
    (t) => t.id === '00000000-0000-0000-0000-000000000001'
  )

  const items = (defaultTemplate?.checklist_template_items || []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-[#6DBF3A]" />
          Checklist Templates
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Manage the default property prep checklist template. New properties are seeded with these items.
        </p>
      </div>

      {/* Default Template */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#1E2D3B]">Standard Property Prep</h2>
            <p className="text-xs text-[#64748B] mt-0.5">{items.length} items</p>
          </div>
          <span className="px-2.5 py-1 bg-[#3D4F5C]/10 text-[#3D4F5C] rounded-full text-xs font-medium">
            Default Template
          </span>
        </div>

        <div className="space-y-2 mb-6">
          {items.map((item: {
            id: string
            label: string
            description: string | null
            is_required: boolean
            sort_order: number
          }) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0]"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <GripVertical className="h-4 w-4 text-[#E2E8F0] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm text-[#1E2D3B] font-medium">{item.label}</span>
                  {item.is_required && (
                    <span className="ml-2 text-xs text-red-500">Required</span>
                  )}
                  {item.description && (
                    <p className="text-xs text-[#64748B] truncate">{item.description}</p>
                  )}
                </div>
              </div>
              <form action={deleteTemplateItem}>
                <input type="hidden" name="itemId" value={item.id} />
                <button type="submit" className="text-[#64748B] hover:text-red-500 transition-colors ml-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>

        {/* Add Item */}
        <div className="border-t border-[#E2E8F0] pt-4">
          <h3 className="text-sm font-semibold text-[#1E2D3B] mb-3">Add Template Item</h3>
          <form action={addTemplateItem} className="space-y-3">
            <input
              type="hidden"
              name="templateId"
              value={defaultTemplate?.id || '00000000-0000-0000-0000-000000000001'}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64748B]">Label *</label>
                <input
                  type="text"
                  name="label"
                  required
                  placeholder="e.g., Waterfront Permit"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64748B]">Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  placeholder={String(items.length + 1)}
                  defaultValue={items.length + 1}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#64748B]">Description</label>
              <input
                type="text"
                name="description"
                placeholder="Optional description for clients"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[#1E2D3B] cursor-pointer">
                <input type="hidden" name="isRequired" value="false" />
                <input
                  type="checkbox"
                  name="isRequired"
                  value="true"
                  defaultChecked
                  className="rounded border-[#E2E8F0]"
                />
                Required
              </label>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <p className="text-sm text-amber-700">
          <strong>Note:</strong> Changes to this template only apply to new properties created going forward.
          Existing properties retain their own copies of prep items.
        </p>
      </div>
    </div>
  )
}
