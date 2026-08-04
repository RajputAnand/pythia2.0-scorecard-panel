'use client'

import Panel from '@/components/shared/Panel/Panel'
import { PosVariant } from '@/types/leaderboart'
import type { TeamRankingData } from '@/types/overview'
import { renderText } from '@/utils/common'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

const posClass: Record<PosVariant, string> = {
  gold: 'bg-[#FBF0C0] text-[#A07010]',
  silver: 'bg-[#F0F0F4] text-[#70708A]',
  bronze: 'bg-[#FAE8D8] text-[#A05020]',
  yoursPos: 'bg-accent text-white',
  regular: 'bg-surface-alt text-muted',
}

const AVATAR_COLORS = ['#8B7355', '#6A8A5A', '#7A7A8A', '#9A6A4A', '#5A7A9A', '#8A5A7A']

function getPosVariant(rank: number, isYou: boolean): PosVariant {
  if (isYou) return 'yoursPos'
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return 'regular'
}

function getBarColor(rank: number, isYou: boolean): string {
  if (isYou) return 'var(--color-accent)'
  if (rank === 1) return 'var(--color-gold)'
  if (rank <= 3) return '#7EC8A0'
  return 'var(--color-amber)'
}

export default function Leaderboard({ data, previewMode }: { data: TeamRankingData; previewMode?: boolean }) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.employeeLeaderboard] ?? true)
  if (!previewMode && !visible) return null

  const topScore = Math.max(...data.members.map((member) => member.score), 1)
  // Defensive against a backend bug where more than one member can come back
  // flagged is_you: true — only the first such row is ever treated as "you",
  // so a duplicated flag can't highlight/badge the whole table.
  const youIndex = data.members.findIndex((member) => member.is_you)

  return (
    <Panel
      title="Team Leaderboard"
      subtitle="How you stack up against your team this week"
      badge={<span className="text-muted text-[11px]">This week</span>}
      noPadding
    >
      <div className="flex flex-col">
        {data.members.map((member, i) => {
          const isYou = i === youIndex
          const posVariant = getPosVariant(member.rank, isYou)
          return (
            <div
              key={member.rank}
              className={`flex items-center border-b border-border gap-3 px-5 py-[11px] last:border-b-0 ${isYou ? 'bg-accent-light' : ''}`}
            >
              <div className={`flex items-center justify-center rounded-[7px] font-mono font-bold shrink-0 w-6 h-6 text-[11px] ${posClass[posVariant]}`}>
                {member.rank}
              </div>
              <div
                className="flex items-center justify-center rounded-full text-white font-bold shrink-0 w-7 h-7 text-[10px]"
                style={{ background: isYou ? 'var(--color-accent)' : AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {member.initials}
              </div>
              <div className={`font-medium flex-1 text-[12.5px] ${isYou ? 'text-accent font-bold' : ''}`}>
                {member.label}
                {isYou && (
                  <span className="font-bold bg-accent text-white rounded-[4px] text-[9.5px] px-[6px] py-px ml-[6px]">
                    You
                  </span>
                )}
              </div>
              <div className="w-[90px]">
                <div className="bg-surface-alt rounded-[3px] overflow-hidden h-[6px]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{
                      width: `${Math.round((member.score / topScore) * 100)}%`,
                      background: getBarColor(member.rank, isYou),
                    }}
                  />
                </div>
              </div>
              <div
                className="font-mono font-bold text-[13px] w-7 text-right"
                style={{ color: isYou ? 'var(--color-accent)' : 'var(--color-gold)' }}
              >
                {member.score}
              </div>
              <div className={`font-mono text-[11px] w-14 text-right flex flex-col leading-tight ${isYou ? 'text-amber font-semibold' : 'text-muted'}`}>
                {`${member.points.toLocaleString()} pts`.split(' ').map((part, idx) => <span key={idx}>{part}</span>)}
              </div>
            </div>
          )
        })}
      </div>

      {data.insight && (
        <div className="bg-surface-alt border-t border-border text-secondary leading-relaxed px-5 py-[10px] text-[12px] [&_strong]:font-semibold [&_strong]:text-primary">
          {renderText(data.insight.message)}
        </div>
      )}
    </Panel>
  )
}
