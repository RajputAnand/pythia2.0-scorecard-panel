'use client'

import { useState } from 'react'
import styles from './RoiHero.module.css'
import { RoiStat } from '@/types/roi'
import { ROI_STATS } from '@/lib/roi-data'

const valueColorClass: Record<string, string> = {
  green: 'text-[#78C99A]',
  amber: 'text-[#F5C842]',
}

const pillVariantStyle: Record<string, React.CSSProperties> = {
  up:      { background: 'rgba(29,92,58,0.5)',    color: '#78C99A' },
  down:    { background: 'rgba(181,43,30,0.4)',   color: '#F5A49E' },
  neutral: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' },
}

export default function RoiHero() {
  const [stats] = useState<RoiStat[]>(ROI_STATS)

  return (
    <div
      className={`${styles.roiHero} relative rounded-2xl overflow-hidden grid`}
      style={{
        background: 'linear-gradient(135deg, #1A1714 0%, #2A2218 60%, #1D3828 100%)',
        padding: '28px 32px',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex flex-col gap-[6px] pr-[28px] mr-[28px]"
          style={i === 3 ? { paddingRight: 0, marginRight: 0, borderRight: 'none' } : { borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="font-medium uppercase text-[10px]"
            style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '.1em' }}
          >
            {stat.label}
          </div>
          <div
            className={`font-mono font-medium text-[32px] leading-none ${valueColorClass[stat.valueVariant] ?? 'text-white'}`}
            style={{ letterSpacing: '-.02em' }}
          >
            {stat.value.split('→').flatMap((part, i, arr) =>
              i < arr.length - 1
                ? [part, <span key={i} style={{ fontFamily: 'system-ui, sans-serif' }}>→</span>]
                : [part]
            )}
          </div>
          <div className="flex items-center gap-[6px] text-[11.5px]">
            <span
              className="font-mono font-semibold rounded-[20px] text-[10.5px] px-[7px] py-[2px]"
              style={pillVariantStyle[stat.pillVariant]}
            >
              {stat.pill}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

