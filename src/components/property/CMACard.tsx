'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { CMA } from '@/lib/types/database'

interface CMACardProps {
  cma: CMA
}

export function CMACard({ cma }: CMACardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showPdf, setShowPdf] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#3D4F5C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-[#3D4F5C]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1E2D3B]">{cma.title}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {format(new Date(cma.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={cma.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open PDF
            </a>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#64748B] hover:text-[#1E2D3B] transition-colors ml-2"
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4">
            <div
              className="prose prose-sm text-[#64748B] max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: cma.body }}
            />
            <button
              onClick={() => setShowPdf(!showPdf)}
              className="text-sm text-[#3D4F5C] font-medium hover:text-[#6DBF3A] transition-colors"
            >
              {showPdf ? 'Hide PDF viewer' : 'View PDF inline'}
            </button>

            {showPdf && (
              <div className="mt-3 rounded-lg overflow-hidden border border-[#E2E8F0]">
                <iframe
                  src={cma.pdf_url}
                  className="w-full h-[600px]"
                  title={cma.title}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
