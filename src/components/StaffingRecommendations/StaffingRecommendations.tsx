'use client'

import { useState } from 'react'
import { RECOMMENDATIONS, type Recommendation } from '@/lib/staffing-data'

const typePillClass: Record<string, string> = {
  coverage: 'bg-danger-light text-danger',
  pairing: 'bg-cobalt-light text-cobalt',
  fatigue: 'bg-amber-light text-amber',
  peak: 'bg-accent-light text-accent',
}

export default function StaffingRecommendations() {
  const [recs, setRecs] = useState<Recommendation[]>(RECOMMENDATIONS)
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)

  const fireToast = (msg: string) => {
    setToast(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const applyRec = (id: string) => {
    setApplied((prev) => new Set([...prev, id]))
    fireToast('Recommendation applied to schedule')
  }

  const dismissRec = (id: string) => {
    setRecs((prev) => prev.filter((r) => r.id !== id))
    fireToast('Recommendation dismissed')
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border">
          <div className="text-[13px] font-semibold">Pythia Recommendations</div>
          <div
            className={`font-mono text-[11px] px-2 py-[3px] rounded-[20px] font-semibold ${
              recs.length === 0
                ? 'bg-accent-light text-accent'
                : 'bg-danger-light text-danger'
            }`}
          >
            {recs.length} active
          </div>
        </div>
        <div className="flex flex-col">
          {recs.map((rec) => (
            <div key={rec.id} className="px-[18px] py-[13px] border-b border-border last:border-b-0 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[9.5px] font-bold px-[7px] py-[2px] rounded-[5px] uppercase tracking-[.07em] whitespace-nowrap ${typePillClass[rec.type]}`}
                >
                  {rec.typeLabel}
                </span>
              </div>
              <div className="text-[12.5px] font-medium leading-[1.4] text-primary">{rec.text}</div>
              <div className="text-[11.5px] text-secondary leading-[1.5]">{rec.detail}</div>
              <div className="flex gap-[7px]">
                {applied.has(rec.id) ? (
                  <div className="flex-1 text-center py-[7px] px-[10px] rounded-lg text-[11.5px] font-semibold bg-accent-light text-accent">
                    ✓ Applied
                  </div>
                ) : (
                  <button
                    onClick={() => applyRec(rec.id)}
                    className="flex-1 py-[7px] px-[10px] rounded-lg text-[11.5px] font-semibold bg-accent text-white cursor-pointer border-0 font-sans transition-opacity hover:opacity-85"
                  >
                    ✦ Apply to schedule
                  </button>
                )}
                <button
                  onClick={() => dismissRec(rec.id)}
                  className="flex-1 py-[7px] px-[10px] rounded-lg text-[11.5px] font-semibold bg-surface-alt text-muted border border-border cursor-pointer font-sans transition-colors hover:bg-border"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
          {recs.length === 0 && (
            <div className="px-[18px] py-8 text-center text-[12.5px] text-muted">All recommendations handled ✓</div>
          )}
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-white px-[18px] py-3 rounded-[10px] text-[13px] font-medium transition-all duration-300 pointer-events-none ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <span className="text-[15px]">✓</span>
        {toast}
      </div>
    </>
  )
}
