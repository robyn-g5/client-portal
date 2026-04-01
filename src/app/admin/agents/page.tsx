import { requireSuperAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { approveAgent, rejectAgent } from '@/lib/actions/auth'
import { format } from 'date-fns'
import { UserCheck, UserX, Clock, Users } from 'lucide-react'

export default async function AgentsPage() {
  await requireSuperAdmin()

  const admin = createAdminClient()

  const { data: agents } = await admin
    .from('client_profiles')
    .select('*')
    .eq('role', 'agent')
    .order('created_at', { ascending: false })

  const pending = agents?.filter((a) => !a.is_approved) ?? []
  const approved = agents?.filter((a) => a.is_approved) ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1E2D3B]">Agent accounts</h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Approve or reject agents requesting access to the portal.
        </p>
      </div>

      {/* Pending agents */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-semibold text-[#1E2D3B]">
            Pending approval{pending.length > 0 && ` (${pending.length})`}
          </h2>
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-10 text-center">
            <p className="text-sm text-[#64748B]">No pending requests</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
            {pending.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-[#1E2D3B]">{agent.full_name}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Requested {format(new Date(agent.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form
                    action={async () => {
                      'use server'
                      await approveAgent(agent.user_id)
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#6DBF3A] hover:bg-[#5aaa2e] text-white text-xs font-medium px-3 py-1.5 transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      'use server'
                      await rejectAgent(agent.user_id)
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium px-3 py-1.5 transition-colors border border-red-200"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved agents */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-[#3D4F5C]" />
          <h2 className="text-base font-semibold text-[#1E2D3B]">
            Active agents{approved.length > 0 && ` (${approved.length})`}
          </h2>
        </div>

        {approved.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-10 text-center">
            <p className="text-sm text-[#64748B]">No active agents yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
            {approved.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-[#1E2D3B]">
                    {agent.full_name}
                    {agent.is_super_admin && (
                      <span className="ml-2 text-xs bg-[#3D4F5C]/10 text-[#3D4F5C] rounded px-1.5 py-0.5 font-medium">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Joined {format(new Date(agent.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
