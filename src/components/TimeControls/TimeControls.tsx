'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import DatePicker from '@/components/shared/DatePicker/DatePicker'

const TIME_PERIODS = ['This Week', 'Month over Month', 'Quarter'] as const
const VIEW_OPTIONS = ['Actuals + Projected', 'Actuals Only', 'Projected Only'] as const

export default function TimeControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const period = searchParams.get('period') || 'Month over Month'
  const view = searchParams.get('view') || 'Actuals + Projected'
  
  const initialDateFrom = searchParams.get('custom_start') || '2025-11-01'
  const initialDateTo = searchParams.get('custom_end') || '2026-02-23'

  const [dateFrom, setDateFrom] = useState(initialDateFrom)
  const [dateTo, setDateTo] = useState(initialDateTo)
  const [isPending, startTransition] = useTransition()

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleApplyCustomDates = () => {
    updateParams({
      period: 'custom',
      custom_start: dateFrom,
      custom_end: dateTo,
    })
  }

  return (
    <div className="flex items-center gap-2 bg-surface border-b border-border px-[30px] h-[50px]">
      {TIME_PERIODS.map((p) => (
        <button
          key={p}
          disabled={isPending}
          className={`border rounded-lg font-sans font-medium cursor-pointer transition-all duration-150 text-[12px] px-[14px] py-[6px] disabled:cursor-not-allowed disabled:opacity-60 ${
            period === p
              ? 'bg-accent text-white border-accent'
              : 'border-border text-secondary bg-transparent hover:border-accent hover:text-accent'
          }`}
          onClick={() => {
            updateParams({ period: p, custom_start: null, custom_end: null })
          }}
        >
          {p}
        </button>
      ))}

      <div className="bg-border shrink-0 w-px h-5 mx-1" />

      <div className="flex items-center gap-[6px] ml-1">
        <DatePicker ariaLabel="Custom range start date" value={dateFrom} onChange={setDateFrom} max={dateTo} />
        <span className="text-muted text-[11px]">to</span>
        <DatePicker ariaLabel="Custom range end date" value={dateTo} onChange={setDateTo} min={dateFrom} />
        <button
          disabled={isPending}
          className={`flex items-center gap-[6px] border rounded-lg font-sans font-medium cursor-pointer transition-all duration-150 text-[11.5px] px-[11px] py-[5px] disabled:cursor-not-allowed disabled:opacity-70 ${
            period === 'custom'
              ? 'bg-accent text-white border-accent'
              : 'border-border bg-transparent text-secondary hover:bg-surface-alt'
          }`}
          onClick={handleApplyCustomDates}
        >
          {isPending && (
            <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isPending ? 'Applying…' : 'Apply'}
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-muted text-[11.5px]">View:</span>
        <div className={`flex border border-border rounded-lg overflow-hidden transition-opacity duration-150 ${isPending ? 'opacity-60' : ''}`}>
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              disabled={isPending}
              className={`font-sans font-medium cursor-pointer transition-all duration-150 text-[11.5px] px-[12px] py-[5px] border-none disabled:cursor-not-allowed ${
                view === v ? 'bg-primary text-white' : 'bg-transparent text-muted'
              }`}
              onClick={() => updateParams({ view: v })}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
