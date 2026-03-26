import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { createDealTask, deleteDealTask, updateDealTaskStatus, createTimelineEvent, deleteTimelineEvent } from '@/lib/actions/deal'
import { DealTaskList } from '@/components/property/DealTaskList'
import { Timeline } from '@/components/property/Timeline'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function AdminDealPage({ params }: Props) {
  const { propertyId } = await params
  await requireAgent()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('title')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: dealTasks } = await supabase
    .from('deal_tasks')
    .select('*, deal_task_files(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true })

  const { data: timelineEvents } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('property_id', propertyId)
    .order('date', { ascending: true })

  async function handleCreateTask(formData: FormData) {
    'use server'
    await createDealTask(propertyId, formData)
  }

  async function handleDeleteTask(formData: FormData) {
    'use server'
    const taskId = formData.get('taskId') as string
    await deleteDealTask(propertyId, taskId)
  }

  async function handleCreateTimelineEvent(formData: FormData) {
    'use server'
    await createTimelineEvent(propertyId, formData)
  }

  async function handleDeleteTimelineEvent(formData: FormData) {
    'use server'
    const eventId = formData.get('eventId') as string
    await deleteTimelineEvent(propertyId, eventId)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/admin/properties/${propertyId}`}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E2D3B] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Deal Tasks & Timeline</h1>
        <p className="text-[#64748B] mt-1 text-sm">{property.title}</p>
      </div>

      {/* Add Deal Task */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Add Deal Task</h2>
        <form action={handleCreateTask} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Task Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g., Provide home inspection"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Responsible Party *</label>
              <select
                name="party"
                defaultValue="seller"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              >
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
                <option value="agent">Agent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Due Date</label>
              <input
                type="datetime-local"
                name="dueDate"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Status</label>
              <select
                name="status"
                defaultValue="not_started"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1E2D3B]">Description</label>
            <input
              type="text"
              name="description"
              placeholder="Optional details"
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[#1E2D3B] cursor-pointer">
              <input type="hidden" name="isConditional" value="false" />
              <input
                type="checkbox"
                name="isConditional"
                value="true"
                className="rounded border-[#E2E8F0]"
              />
              Conditional task
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Deal Tasks */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Deal Tasks</h2>
        <DealTaskList tasks={dealTasks || []} />
      </div>

      {/* Add Timeline Event */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Add Timeline Event</h2>
        <form action={handleCreateTimelineEvent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Event Label *</label>
              <input
                type="text"
                name="label"
                required
                placeholder="e.g., Offer Accepted"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Date *</label>
              <input
                type="datetime-local"
                name="date"
                required
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-medium text-[#1E2D3B]">Category</label>
              <select
                name="category"
                defaultValue="milestone"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20"
              >
                <option value="milestone">Milestone</option>
                <option value="task">Task</option>
                <option value="document">Document</option>
                <option value="showing">Showing</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-6 px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>

      {/* Timeline */}
      {(timelineEvents?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Timeline</h2>
          <Timeline events={timelineEvents || []} />
        </div>
      )}
    </div>
  )
}
