import { requireAgent } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { createAppointment, deleteAppointment } from '@/lib/actions/properties'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function AdminAppointmentsPage({ params }: Props) {
  const { propertyId } = await params
  await requireAgent()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('title, address')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: appointments } = await supabase
    .from('listing_appointments')
    .select('*')
    .eq('property_id', propertyId)
    .order('scheduled_at', { ascending: true })

  async function handleCreate(formData: FormData) {
    'use server'
    await createAppointment(propertyId, formData)
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const appointmentId = formData.get('appointmentId') as string
    await deleteAppointment(propertyId, appointmentId)
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
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Listing Appointments</h1>
        <p className="text-[#64748B] mt-1 text-sm">{property.title}</p>
      </div>

      {/* Add Appointment Form */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4">Schedule Appointment</h2>
        <form action={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1E2D3B]">Date & Time *</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                required
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 focus:border-[#3D4F5C]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1E2D3B]">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Any notes for the client about this appointment..."
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4F5C]/20 focus:border-[#3D4F5C] resize-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#3D4F5C] text-white rounded-lg text-sm font-medium hover:bg-[#2d3d49] transition-colors"
          >
            Schedule Appointment
          </button>
        </form>
      </div>

      {/* Appointments List */}
      {!appointments || appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center">
          <CalendarDays className="h-10 w-10 text-[#E2E8F0] mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">No appointments scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-start justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3D4F5C]/10 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-[#3D4F5C]">
                    {format(new Date(appt.scheduled_at), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-[#3D4F5C] leading-none">
                    {format(new Date(appt.scheduled_at), 'd')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E2D3B]">
                    {format(new Date(appt.scheduled_at), 'EEEE, MMMM d, yyyy')} at{' '}
                    {format(new Date(appt.scheduled_at), 'h:mm a')}
                  </p>
                  {appt.notes && (
                    <p className="text-sm text-[#64748B] mt-1">{appt.notes}</p>
                  )}
                </div>
              </div>
              <form action={handleDelete}>
                <input type="hidden" name="appointmentId" value={appt.id} />
                <button
                  type="submit"
                  className="text-[#64748B] hover:text-red-500 transition-colors p-1"
                  title="Delete appointment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
