'use client'

import type { ApiRecommendation } from '@/types/staff'

const typePillClass: Record<string, string> = {
  coverage_gap: 'bg-danger-light text-danger',
  weak_pairing: 'bg-cobalt-light text-cobalt',
  alone_at_peak: 'bg-danger-light text-danger',
  fatigue_shift: 'bg-amber-light text-amber',
  fatigue_weekly: 'bg-amber-light text-amber',
}

interface Props {
  recommendations: ApiRecommendation[]
  generationStatus: 'idle' | 'generating' | 'done' | 'failed'
  applyingId: string | null
  onApply: (id: string) => void
  onDismiss: (id: string) => void
}

export default function StaffingRecommendations({
  recommendations,
  generationStatus,
  applyingId,
  onApply,
  onDismiss,
}: Props) {
  const visible = recommendations.filter((r) => r.status !== 'dismissed')
  const activeCount = recommendations.filter((r) => r.status === 'active').length
  const isGenerating = generationStatus === 'generating'

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border">
        <div className="text-[13px] font-semibold whitespace-nowrap">Pythia Recommendations</div>
        <div
          className={`font-mono text-[11px] px-2 py-[3px] rounded-[20px] font-semibold whitespace-nowrap ${
            activeCount === 0 ? 'bg-accent-light text-accent' : 'bg-danger-light text-danger'
          }`}
        >
          {activeCount} active
        </div>
      </div>
      <div className="flex flex-col">
        {visible.map((rec) => (
          <div key={rec.id} className="px-[18px] py-[13px] border-b border-border last:border-b-0 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-[9.5px] font-bold px-[7px] py-[2px] rounded-[5px] uppercase tracking-[.07em] whitespace-nowrap ${typePillClass[rec.type] ?? 'bg-surface-alt text-muted'}`}
              >
                {rec.type_label}
              </span>
            </div>
            <div className="text-[12.5px] font-medium leading-[1.4] text-primary">{rec.text}</div>
            <div className="text-[11.5px] text-secondary leading-[1.5]">{rec.detail}</div>
            <div className="flex gap-[7px]">
              {rec.status === 'applied' ? (
                <div className="flex-1 text-center py-[7px] px-[10px] rounded-lg text-[11.5px] font-semibold bg-accent-light text-accent">
                  ✓ Applied
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onApply(rec.id)}
                    disabled={applyingId === rec.id}
                    className="flex-1 py-[7px] px-[10px] rounded-lg text-[11.5px] font-semibold bg-accent text-white cursor-pointer border-0 font-sans transition-opacity hover:opacity-85 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {applyingId === rec.id ? 'Applying…' : '✦ Apply to schedule'}
                  </button>
                  <button
                    onClick={() => onDismiss(rec.id)}
                    disabled={applyingId === rec.id}
                    className="flex-1 py-[7px] px-[10px] rounded-lg text-[11.5px] font-semibold bg-surface-alt text-muted border border-border cursor-pointer font-sans transition-colors hover:bg-border disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {visible.length === 0 && !isGenerating && (
          <div className="px-[18px] py-8 text-center text-[12.5px] text-muted">
            {generationStatus === 'idle' ? 'No recommendations yet — use Refresh in the header to generate' : 'All recommendations handled ✓'}
          </div>
        )}
        {isGenerating && visible.length === 0 && (
          <div className="px-[18px] py-8 text-center text-[12.5px] text-muted">Generating recommendations…</div>
        )}
      </div>
    </div>
  )
}
