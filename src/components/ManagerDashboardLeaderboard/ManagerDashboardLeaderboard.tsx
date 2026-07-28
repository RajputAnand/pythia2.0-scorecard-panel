'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { fetchManagerDashboardLeaderboard } from '@/queries/manager-dashboard'
import type { ManagerDashboardEmployeeRow, ManagerDashboardSortBy, ManagerDashboardView } from '@/types/manager-dashboard'

interface Props {
  initialEmployees: ManagerDashboardEmployeeRow[]
  initialView: ManagerDashboardView
}

const rankClass: Record<'gold' | 'silver' | 'bronze' | 'regular', string> = {
  gold: 'bg-[#FBF0C0] text-[#A07010]',
  silver: 'bg-[#F0F0F4] text-[#70708A]',
  bronze: 'bg-[#FAE8D8] text-[#A05020]',
  regular: 'bg-surface-alt text-secondary',
}

const AVATAR_COLORS = ['#8B7355', '#6A8A5A', '#7A7A8A', '#9A6A4A', '#5A7A9A', '#8A5A7A']

function rankVariant(rank: number): 'gold' | 'silver' | 'bronze' | 'regular' {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return 'regular'
}

function MetricCell({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-[60px] h-[5px] bg-surface-alt rounded overflow-hidden">
        <div className="h-full rounded" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
      <span className="font-mono text-[12px] text-secondary">{value}%</span>
    </div>
  )
}

const SORTS: { key: ManagerDashboardSortBy; label: string }[] = [
  { key: 'thanked_count', label: 'Thank Yous' },
  { key: 'value_prop_count', label: 'Value Proposition' },
  { key: 'greeted_count', label: 'Greeted On Time' },
  { key: 'avg_overall_score', label: 'Overall Score' },
]

const VIEWS: { key: ManagerDashboardView; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'all', label: 'All Time' },
]

export default function ManagerDashboardLeaderboard({ initialEmployees, initialView }: Props) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [sortBy, setSortBy] = useState<ManagerDashboardSortBy>('thanked_count')
  const [view, setView] = useState<ManagerDashboardView>(initialView)
  const [employees, setEmployees] = useState<ManagerDashboardEmployeeRow[]>(initialEmployees)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    if (sortBy === 'thanked_count' && view === initialView) {
      setEmployees(initialEmployees)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchManagerDashboardLeaderboard({ token, view, sortBy })
      .then((rows) => {
        if (!cancelled) setEmployees(rows)
      })
      .catch(() => {
        if (!cancelled) setEmployees([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sortBy, view])

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border gap-3 flex-wrap">
        <div>
          <div className="text-[13.5px] font-semibold">Employee Recognition Leaderboard</div>
          <div className="text-[11.5px] text-muted mt-[2px]">
            Who&apos;s saying thank you and pitching value to customers
          </div>
        </div>
        <div className="flex gap-[6px]">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-[5px] rounded-full border font-sans text-[11.5px] font-medium cursor-pointer transition-all duration-150
                ${view === v.key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-secondary border-border hover:border-accent hover:text-accent'
                }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-[6px] px-[22px] py-3 border-b border-border bg-surface-alt flex-wrap">
        <span className="text-[11px] text-muted self-center mr-1">Sort by:</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`px-3 py-[5px] rounded-full border font-sans text-[11.5px] font-medium cursor-pointer transition-all duration-150
              ${sortBy === s.key
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-secondary border-border hover:border-accent hover:text-accent'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={`overflow-x-auto ${loading ? 'opacity-50 transition-opacity duration-150' : ''}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Rank', 'Employee', 'Thank You', 'Value Prop.', 'Greeted', 'Score', 'Transactions'].map((h, i) => (
                <th
                  key={h}
                  className={`text-[10px] font-semibold text-muted uppercase tracking-[.09em] py-[10px] border-b border-border text-left whitespace-nowrap
                    ${i === 0 ? 'pl-[22px] pr-[18px]' : 'px-[18px]'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.user_id}>
                <td className="pl-[22px] pr-[18px] py-[13px] border-b border-border align-middle">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold shrink-0 ${rankClass[rankVariant(emp.rank)]}`}>
                    {emp.rank}
                  </div>
                </td>
                <td className="px-[18px] py-[13px] border-b border-border align-middle">
                  <div className="flex items-center gap-[9px]">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: AVATAR_COLORS[(emp.rank - 1) % AVATAR_COLORS.length] }}
                    >
                      {emp.initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold">{emp.name}</div>
                      <div className="text-[10.5px] text-muted">{emp.role_title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-[18px] py-[13px] border-b border-border align-middle">
                  <MetricCell value={emp.thanked_rate} color="var(--color-accent)" />
                </td>
                <td className="px-[18px] py-[13px] border-b border-border align-middle">
                  <MetricCell value={emp.value_prop_rate} color="var(--color-cobalt)" />
                </td>
                <td className="px-[18px] py-[13px] border-b border-border align-middle">
                  <MetricCell value={emp.greeted_rate} color="var(--color-amber)" />
                </td>
                <td className="px-[18px] py-[13px] border-b border-border align-middle">
                  <span className="font-mono text-[14px] font-bold text-gold">{emp.avg_overall_score}</span>
                </td>
                <td className="px-[18px] py-[13px] border-b border-border align-middle">
                  <span className="font-mono text-[12px] text-secondary">{emp.transaction_count}</span>
                </td>
              </tr>
            ))}
            {employees.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-[22px] py-[18px] text-[12px] text-muted text-center">
                  No scored transactions {view === 'week' ? 'this week' : 'yet'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
