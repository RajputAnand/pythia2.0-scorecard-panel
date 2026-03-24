'use client'

import Panel from '@/components/shared/Panel/Panel'
import { LeaderboardData, PosVariant } from '@/types/leaderboart'
import { renderText } from '@/utils/common'

const posClass: Record<PosVariant, string> = {
  gold: 'bg-[#FBF0C0] text-[#A07010]',
  silver: 'bg-[#F0F0F4] text-[#70708A]',
  bronze: 'bg-[#FAE8D8] text-[#A05020]',
  yoursPos: 'bg-accent text-white',
  regular: 'bg-surface-alt text-muted',
}


export default function Leaderboard({ data }: { data: LeaderboardData }) {

  return (
    <Panel
      title={data.title}
      subtitle={data.subtitle}
      badge={<span className="text-muted text-[11px]">{data.periodLabel}</span>}
      noPadding
    >
      <div className="flex flex-col">
        {data.entries.map((entry) => (
          <div
            key={entry.pos}
            className={`flex items-center border-b border-border gap-3 px-5 py-[11px] last:border-b-0 ${entry.isYou ? 'bg-accent-light' : ''}`}
          >
            <div className={`flex items-center justify-center rounded-[7px] font-mono font-bold shrink-0 w-6 h-6 text-[11px] ${posClass[entry.posVariant]}`}>
              {entry.pos}
            </div>
            <div
              className="flex items-center justify-center rounded-full text-white font-bold shrink-0 w-7 h-7 text-[10px]"
              style={{ background: entry.avatarBg }}
            >
              {entry.initials}
            </div>
            <div className={`font-medium flex-1 text-[12.5px] ${entry.isYou ? 'text-accent font-bold' : ''}`}>
              {entry.name}
              {entry.isYou && (
                <span className="font-bold bg-accent text-white rounded-[4px] text-[9.5px] px-[6px] py-px ml-[6px]">
                  You
                </span>
              )}
            </div>
            <div className="w-[90px]">
              <div className="bg-surface-alt rounded-[3px] overflow-hidden h-[6px]">
                <div className="h-full rounded-[3px]" style={{ width: entry.barWidth, background: entry.barColor }} />
              </div>
            </div>
            <div
              className="font-mono font-bold text-[13px] w-7 text-right"
              style={{ color: entry.scoreIsYou ? 'var(--color-accent)' : 'var(--color-gold)' }}
            >
              {entry.score}
            </div>
            <div className={`font-mono text-[11px] w-14 text-right flex flex-col leading-tight ${entry.ptsIsYou ? 'text-amber font-semibold' : 'text-muted'}`}>
              {entry.pts.split(' ').map((part, i) => <span key={i}>{part}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-alt border-t border-border text-secondary leading-relaxed px-5 py-[10px] text-[12px] [&_strong]:font-semibold [&_strong]:text-primary">
        {renderText(data.insightText)}
      </div>
    </Panel>
  )
}
