import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { LayoutDashboard, Calendar, ClipboardList, Activity } from 'lucide-react'
import { ActivityFeed } from '@/components/property/ActivityFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { propertyId } = await params
  await requireAuth()
  const supabase = await createClient()

  // Ensure property exists
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) notFound()

  // Fetch Activity Logs
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch Appointments
  const { data: appointments } = await supabase
    .from('property_appointments')
    .select('*')
    .eq('property_id', propertyId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  // Fetch Tasks
  const { data: tasks } = await supabase
    .from('property_tasks')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'pending')
    .order('due_date', { ascending: true })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-[#1E2D3B] flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-[#6DBF3A]" />
          Dashboard
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Overview of your upcoming appointments, tasks, and property activity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Appointments and Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-[#1E2D3B]">
                <Calendar className="h-5 w-5 text-[#6DBF3A]" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-lg border">
                      <div>
                        <p className="font-medium text-[#1E2D3B]">{apt.title}</p>
                        <p className="text-sm text-[#64748B]">{apt.appointment_type}</p>
                      </div>
                      <div className="text-sm text-right">
                        <p className="font-semibold text-[#1E2D3B]">{format(new Date(apt.scheduled_at), 'EEEE, MMM d')}</p>
                        <p className="text-[#6DBF3A] font-medium">{format(new Date(apt.scheduled_at), 'h:mm a')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[#64748B] border-2 border-dashed rounded-lg">
                  <p className="text-sm">No upcoming appointments scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-[#1E2D3B]">
                <ClipboardList className="h-5 w-5 text-[#6DBF3A]" />
                Your Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-50/50 p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full border-2 border-gray-300" />
                        <div>
                          <p className="font-medium text-[#1E2D3B]">{task.title}</p>
                          {task.description && <p className="text-sm text-[#64748B] mt-1">{task.description}</p>}
                        </div>
                      </div>
                      {task.due_date && (
                        <div className="text-sm text-right bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium whitespace-nowrap self-start sm:self-auto shrink-0 border border-amber-200">
                          Due {format(new Date(task.due_date), 'MMM d')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[#64748B] border-2 border-dashed rounded-lg bg-gray-50/30">
                  <p className="text-sm">You are all caught up! No pending tasks right now.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="h-full border-t-4 border-t-[#6DBF3A]">
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-[#1E2D3B]">
                <Activity className="h-5 w-5 text-[#6DBF3A]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <ActivityFeed logs={logs || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
