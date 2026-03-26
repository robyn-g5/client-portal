import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function ListingAppointmentPage({ params }: Props) {
  const { propertyId } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  const { data: appointments } = await supabase
    .from('listing_appointments')
    .select('*')
    .eq('property_id', propertyId)
    .order('scheduled_at', { ascending: true })

  const upcomingAppointments = (appointments || []).filter(
    (a) => new Date(a.scheduled_at) >= new Date()
  )
  const pastAppointments = (appointments || []).filter(
    (a) => new Date(a.scheduled_at) < new Date()
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Listing Appointment</h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Your scheduled appointments with your iMuskoka Properties agent
        </p>
      </div>

      {/* Upcoming Appointments */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#6DBF3A]" />
          Upcoming Appointments
        </h2>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
            <Calendar className="h-10 w-10 text-[#E2E8F0] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No upcoming appointments scheduled.</p>
            <p className="text-[#64748B] text-xs mt-1">Your agent will schedule a listing appointment soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[#3D4F5C]/10 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-[#3D4F5C]">
                    {format(new Date(appt.scheduled_at), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-[#3D4F5C] leading-none">
                    {format(new Date(appt.scheduled_at), 'd')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                    <span className="text-sm font-medium text-[#1E2D3B]">
                      {format(new Date(appt.scheduled_at), 'EEEE, MMMM d, yyyy')} at{' '}
                      {format(new Date(appt.scheduled_at), 'h:mm a')}
                    </span>
                  </div>
                  {appt.notes && (
                    <p className="mt-2 text-sm text-[#64748B]">{appt.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* What to Expect */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1E2D3B] mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#6DBF3A]" />
          What to Expect
        </h2>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <p className="text-sm text-[#64748B] mb-4">
            During your listing appointment, your iMuskoka Properties agent will:
          </p>
          <ul className="space-y-3">
            {[
              'Walk through your property to assess its current condition and unique features',
              'Review comparable sales in your area to determine optimal pricing strategy',
              'Discuss our comprehensive marketing plan including photography, MLS listing, and digital promotion',
              'Review the Seller Representation Agreement and explain your options',
              'Collect required documentation (FINTRAC, RECO Guide)',
              'Answer any questions you have about the selling process',
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-[#1E2D3B]">
                <CheckCircle2 className="h-4 w-4 text-[#6DBF3A] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-[#1E2D3B] mb-4 text-[#64748B]">
            Past Appointments
          </h2>
          <div className="space-y-3">
            {pastAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white/50 rounded-xl border border-[#E2E8F0] p-5 flex items-start gap-4 opacity-70"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">
                    {format(new Date(appt.scheduled_at), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-gray-600 leading-none">
                    {format(new Date(appt.scheduled_at), 'd')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                    <span className="text-sm text-[#64748B]">
                      {format(new Date(appt.scheduled_at), 'EEEE, MMMM d, yyyy')} at{' '}
                      {format(new Date(appt.scheduled_at), 'h:mm a')}
                    </span>
                  </div>
                  {appt.notes && (
                    <p className="mt-1 text-sm text-[#64748B]">{appt.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
