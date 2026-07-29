'use client'

import { useState } from 'react'

type PillVariant = 'up' | 'down' | 'flat'

interface DemoRow {
  label: string
  novPct: number
  febPct: number
  febColor: string
  change: string
  changeVariant: PillVariant
}

const AGE_ROWS: DemoRow[] = [
  { label: '18–24', novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
  { label: '25–34', novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
  { label: '35–44', novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
  { label: '45–54', novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
  { label: '55+',   novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
]

const GENDER_ROWS: DemoRow[] = [
  { label: 'Male',   novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
  { label: 'Female', novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
  { label: 'Other',  novPct: 0, febPct: 0, febColor: '#B0A89E', change: 'N/A', changeVariant: 'flat' },
]

const AGE_INSIGHT = <><strong className="font-semibold text-primary">Demographic shift data is not yet available.</strong> Age breakdown figures will populate once live data is connected.</>
const GENDER_INSIGHT = <><strong className="font-semibold text-primary">Demographic shift data is not yet available.</strong> Gender split figures will populate once live data is connected.</>

const pillClass: Record<PillVariant, string> = {
  up: 'bg-accent-light text-accent',
  down: 'bg-danger-light text-danger',
  flat: 'bg-surface-alt text-muted',
}

function DemoBarRows({ rows, insight }: { rows: DemoRow[]; insight: React.ReactNode }) {
  return (
    <div className="px-[22px] py-[18px]">
      <div className="flex flex-col gap-[11px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className="w-[58px] font-mono text-[11.5px] font-semibold text-secondary shrink-0">{row.label}</div>
            <div className="flex-1 flex flex-col gap-[3px]">
              <div className="flex items-center gap-[7px]">
                <span className="text-[9px] text-muted w-[22px] shrink-0">Nov</span>
                <div className="flex-1 h-[9px] bg-surface-alt rounded overflow-hidden">
                  <div className="h-full rounded bg-[#C8DFC8]" style={{ width: `${row.novPct}%` }} />
                </div>
                <span className="font-mono text-[10px] font-semibold text-muted w-8 text-right">{row.novPct}%</span>
              </div>
              <div className="flex items-center gap-[7px]">
                <span className="text-[9px] text-muted w-[22px] shrink-0">Feb</span>
                <div className="flex-1 h-[9px] bg-surface-alt rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${row.febPct}%`, background: row.febColor }} />
                </div>
                <span className="font-mono text-[10px] font-semibold w-8 text-right" style={{ color: row.febColor }}>{row.febPct}%</span>
              </div>
            </div>
            <span className={`font-mono text-[9.5px] font-bold px-[6px] py-[1px] rounded shrink-0 ${pillClass[row.changeVariant]}`}>
              {row.change}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-[14px] bg-surface-alt rounded-[9px] px-[13px] py-[11px] text-[12px] text-secondary leading-[1.55]">
        {insight}
      </div>
    </div>
  )
}

import type React from 'react'

export default function DemographicShifts() {
  const [tab, setTab] = useState<'age' | 'gender'>('age')

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-start justify-between px-[22px] py-4 border-b border-border gap-3">
        <div>
          <div className="text-[13.5px] font-semibold">Demographic Shifts Over Time</div>
          <div className="text-[11.5px] text-muted mt-[2px]">Node 2 age + gender tracking · Nov 2025 – Feb 2026</div>
        </div>
        <span className="font-mono text-[10.5px] text-muted whitespace-nowrap">4-month view</span>
      </div>

      <div className="flex gap-[6px] px-[22px] py-[10px] border-b border-border bg-surface-alt">
        {(['age', 'gender'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-[13px] py-[5px] rounded-full border font-sans text-[11.5px] font-medium cursor-pointer transition-all duration-150
              ${tab === t
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-secondary border-border hover:border-accent hover:text-accent'
              }`}
          >
            {t === 'age' ? 'Age Breakdown' : 'Gender Split'}
          </button>
        ))}
      </div>

      {tab === 'age'
        ? <DemoBarRows rows={AGE_ROWS} insight={AGE_INSIGHT} />
        : <DemoBarRows rows={GENDER_ROWS} insight={GENDER_INSIGHT} />
      }
    </div>
  )
}
