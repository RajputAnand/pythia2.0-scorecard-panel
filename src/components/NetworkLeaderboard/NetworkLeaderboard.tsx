'use client'

import { useState } from 'react'

type PercentileVariant = 'top5' | 'top10' | 'top25' | 'top50'
type MovementVariant = 'up' | 'down' | 'flat'
type RankVariant = 'gold' | 'silver' | 'bronze' | 'yours' | 'regular'

interface StoreRow {
  rank: number
  rankVariant: RankVariant
  name: string
  isYours?: boolean
  overall: number
  overallVariant?: 'gold' | 'silver' | 'bronze' | 'yours' | 'regular'
  hospitality: number
  hospColor: string
  checkout: number
  checkoutColor: string
  timeToSvc: number
  ttsColor: string
  movement: string
  movementVariant: MovementVariant
  percentile: string
  percentileVariant: PercentileVariant
}

const rows: StoreRow[] = [
  { rank: 1, rankVariant: 'gold', name: 'Store #14', overall: 94, overallVariant: 'gold', hospitality: 96, hospColor: '#1D5C3A', checkout: 91, checkoutColor: '#1D5C3A', timeToSvc: 93, ttsColor: '#1D5C3A', movement: '+2', movementVariant: 'up', percentile: 'Top 5%', percentileVariant: 'top5' },
  { rank: 2, rankVariant: 'silver', name: 'Store #7', overall: 91, overallVariant: 'silver', hospitality: 89, hospColor: '#7EC8A0', checkout: 93, checkoutColor: '#1D5C3A', timeToSvc: 90, ttsColor: '#1D5C3A', movement: '±0', movementVariant: 'flat', percentile: 'Top 10%', percentileVariant: 'top10' },
  { rank: 3, rankVariant: 'bronze', name: 'Store #21', overall: 88, overallVariant: 'bronze', hospitality: 91, hospColor: '#1D5C3A', checkout: 84, checkoutColor: '#7EC8A0', timeToSvc: 88, ttsColor: '#1D5C3A', movement: '+3', movementVariant: 'up', percentile: 'Top 10%', percentileVariant: 'top10' },
  { rank: 4, rankVariant: 'regular', name: 'Store #3', overall: 86, hospitality: 82, hospColor: '#7EC8A0', checkout: 88, checkoutColor: '#1D5C3A', timeToSvc: 86, ttsColor: '#1D5C3A', movement: '−1', movementVariant: 'down', percentile: 'Top 25%', percentileVariant: 'top25' },
  { rank: 5, rankVariant: 'regular', name: 'Store #18', overall: 84, hospitality: 80, hospColor: '#7EC8A0', checkout: 86, checkoutColor: '#1D5C3A', timeToSvc: 84, ttsColor: '#1D5C3A', movement: '+1', movementVariant: 'up', percentile: 'Top 25%', percentileVariant: 'top25' },
  { rank: 6, rankVariant: 'yours', name: 'Main St. Store', isYours: true, overall: 82, overallVariant: 'yours', hospitality: 84, hospColor: '#1D5C3A', checkout: 74, checkoutColor: '#C47F18', timeToSvc: 82, ttsColor: '#1D5C3A', movement: '+2 ↑', movementVariant: 'up', percentile: 'Top 25%', percentileVariant: 'top25' },
  { rank: 7, rankVariant: 'regular', name: 'Store #9', overall: 80, hospitality: 76, hospColor: '#7EC8A0', checkout: 82, checkoutColor: '#1D5C3A', timeToSvc: 80, ttsColor: '#7EC8A0', movement: '±0', movementVariant: 'flat', percentile: 'Top 25%', percentileVariant: 'top25' },
  { rank: 8, rankVariant: 'regular', name: 'Store #2', overall: 78, hospitality: 74, hospColor: '#7EC8A0', checkout: 80, checkoutColor: '#7EC8A0', timeToSvc: 78, ttsColor: '#7EC8A0', movement: '−2', movementVariant: 'down', percentile: 'Top 50%', percentileVariant: 'top50' },
]

const FILTERS = ['All Stores', 'Top 10', 'Near You ±3', 'Improving', 'Declining'] as const

const rankNumClass: Record<RankVariant, string> = {
  gold: 'bg-[#FBF0C0] text-[#A07010]',
  silver: 'bg-[#F0F0F4] text-[#70708A]',
  bronze: 'bg-[#FAE8D8] text-[#A05020]',
  yours: 'bg-accent text-white',
  regular: 'bg-surface-alt text-secondary',
}

const overallColor: Record<string, string> = {
  gold: 'text-gold',
  silver: 'text-[#70708A]',
  bronze: 'text-[#A05020]',
  yours: 'text-accent',
  regular: 'text-secondary',
}

const movementClass: Record<MovementVariant, string> = {
  up: 'text-accent',
  down: 'text-danger',
  flat: 'text-muted',
}

const percentileClass: Record<PercentileVariant, string> = {
  top5: 'bg-gold-light text-gold',
  top10: 'bg-gold-light text-gold',
  top25: 'bg-accent-light text-accent',
  top50: 'bg-cobalt-light text-cobalt',
}

function MetricCell({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-[60px] h-[5px] bg-surface-alt rounded overflow-hidden">
        <div className="h-full rounded" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[12px] text-secondary">{value}</span>
    </div>
  )
}

export default function NetworkLeaderboard() {
  const [activeFilter, setActiveFilter] = useState('All Stores')

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
        <div>
          <div className="text-[13.5px] font-semibold">Network Leaderboard</div>
          <div className="text-[11.5px] text-muted mt-[2px]">All stores anonymous · Sorted by overall score · Feb 2026</div>
        </div>
      </div>

      <div className="flex gap-[6px] px-[22px] py-3 border-b border-border bg-surface-alt">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-[5px] rounded-full border font-sans text-[11.5px] font-medium cursor-pointer transition-all duration-150
              ${activeFilter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-secondary border-border hover:border-accent hover:text-accent'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Rank', 'Store', 'Overall', 'Hospitality', 'Checkout', 'Time to Svc', 'MoM Change', 'Percentile'].map((h, i) => (
              <th
                key={h}
                className={`text-[10px] font-semibold text-muted uppercase tracking-[.09em] py-[10px] border-b border-border text-left
                  ${i === 0 ? 'pl-[22px] pr-[18px]' : i === 7 ? 'pr-[22px] pl-[18px] text-right' : 'px-[18px]'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rank} className={row.isYours ? 'bg-accent-light' : ''}>
              <td className="pl-[22px] pr-[18px] py-[13px] border-b border-border align-middle">
                <div className="flex items-center gap-[10px]">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold shrink-0 ${rankNumClass[row.rankVariant]}`}>
                    {row.rank}
                  </div>
                </div>
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <span className={`text-[13px] font-semibold ${row.isYours ? 'text-accent' : ''}`}>
                  {row.name}
                  {row.isYours && (
                    <span className="ml-[6px] text-[10px] font-semibold px-[6px] py-px rounded bg-accent text-white">You</span>
                  )}
                </span>
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <span className={`font-mono text-[14px] font-bold ${overallColor[row.overallVariant ?? 'regular']}`}>
                  {row.overall}
                </span>
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <MetricCell value={row.hospitality} color={row.hospColor} />
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <MetricCell value={row.checkout} color={row.checkoutColor} />
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <MetricCell value={row.timeToSvc} color={row.ttsColor} />
              </td>
              <td className="px-[18px] py-[13px] border-b border-border align-middle">
                <span className={`font-mono text-[11.5px] font-semibold ${movementClass[row.movementVariant]}`}>
                  {row.movement}
                </span>
              </td>
              <td className="pr-[22px] pl-[18px] py-[13px] border-b border-border align-middle text-right">
                <span className={`font-mono text-[11px] font-bold px-2 py-[3px] rounded-full ${percentileClass[row.percentileVariant]}`}>
                  {row.percentile}
                </span>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={8} className="px-[22px] py-[10px] text-[11.5px] text-muted bg-surface-alt text-center">
              Stores #9–24 · Scores ranging 42–77 · Below top 50%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
