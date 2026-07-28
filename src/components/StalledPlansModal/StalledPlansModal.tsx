'use client'

import StalledPlansPanel from '@/components/StalledPlansPanel/StalledPlansPanel'
import type { UseStalledCoachingPlansResult } from '@/hooks/useStalledCoachingPlans'

interface StalledPlansModalProps {
  data: UseStalledCoachingPlansResult
  onClose: () => void
}

export default function StalledPlansModal({ data, onClose }: StalledPlansModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[760px] max-h-[85vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-surface rounded-t-2xl">
          <div>
            <h2 className="text-[16px] font-semibold text-primary">Stalled Coaching Plans</h2>
            <p className="text-[12px] text-muted mt-0.5">Manager action required</p>
          </div>
          <div className="flex items-center gap-4">
            {!data.isLoading && !data.isError && data.groups.length > 0 && (
              <span className="font-mono text-[11px] text-muted whitespace-nowrap">
                {data.groups.length} employee{data.groups.length === 1 ? '' : 's'} · {data.openCount} plan
                {data.openCount === 1 ? '' : 's'} need action
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-muted hover:text-primary cursor-pointer"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <StalledPlansPanel data={data} />
        </div>
      </div>
    </div>
  )
}
