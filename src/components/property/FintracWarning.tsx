import { CheckCircle2, Circle } from 'lucide-react'
import type { FintracRequirement } from '@/lib/types/database'

interface FintracWarningProps {
  requirements: FintracRequirement[]
}

const FINTRAC_ITEMS = [
  { type: 'FINTRAC' as const, label: 'FINTRAC – Client Identification Form' },
  { type: 'RECO_GUIDE' as const, label: 'RECO Consumer Information Guide' },
]

export function FintracWarning({ requirements }: FintracWarningProps) {
  if (requirements.length === 0) return null

  const allComplete = requirements.every((r) => r.status === 'uploaded')

  return (
    <div
      className={`rounded-xl border p-4 mb-6 ${
        allComplete
          ? 'bg-green-50 border-green-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      <p
        className={`text-sm font-semibold mb-2 ${
          allComplete ? 'text-green-800' : 'text-yellow-800'
        }`}
      >
        {allComplete ? 'Complete' : 'Required'}
      </p>
      <ul className="space-y-1.5">
        {FINTRAC_ITEMS.map(({ type, label }) => {
          const req = requirements.find((r) => r.type === type)
          const done = req?.status === 'uploaded'
          return (
            <li key={type} className="flex items-center gap-2 text-sm">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
              <span className={done ? 'text-green-700 line-through' : 'text-yellow-800'}>
                {label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
