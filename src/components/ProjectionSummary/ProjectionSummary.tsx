'use client'

import { useState } from 'react'
import styles from './ProjectionSummary.module.css'
import { renderText } from '@/utils/common'
import { PROJECTION_SUMMARY_DATA } from '@/lib/projection-summary-data'
import type { ProjectionSummaryData } from '@/types/projection-summary'

export default function ProjectionSummary() {
  const [data] = useState<ProjectionSummaryData>(PROJECTION_SUMMARY_DATA)

  return (
    <div
      className={`${styles.projSummary} relative rounded-2xl overflow-hidden grid gap-6`}
      style={{
        background: 'var(--color-cobalt)',
        padding: '22px 28px',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      }}
    >
      {data.stats.map((stat) => (
        <div key={stat.eyebrow} className="flex flex-col gap-[5px]">
          <div
            className="font-medium uppercase text-[9.5px]"
            style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '.1em' }}
          >
            {stat.eyebrow}
          </div>
          <div
            className="font-mono font-medium text-[26px] leading-none"
            style={{ color: stat.highlight ? '#A8DFCA' : 'white' }}
          >
            {stat.value}
          </div>
          <div
            className="text-[11px] leading-[1.4] [&_strong]:text-white/75"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {renderText(stat.sub)}
          </div>
        </div>
      ))}
      <div
        className="col-span-4 text-[10.5px] italic mt-[10px]"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        {data.footnote}
      </div>
    </div>
  )
}
