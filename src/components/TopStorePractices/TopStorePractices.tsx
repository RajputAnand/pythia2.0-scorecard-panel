'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import { fetchNetworkIntelligence } from '@/queries/benchmarking'
import { BenchmarkingNetworkIntelligenceResponse } from '@/types/benchmarking'

type IconColor = 'green' | 'amber' | 'blue'
type GapVariant = 'gap' | 'close'

interface Practice {
  icon: string
  iconColor: IconColor
  title: string
  desc: React.ReactNode
  pillText: string
  pillVariant: GapVariant
}

import type React from 'react'

const iconBg: Record<IconColor, string> = {
  green: 'bg-accent-light',
  amber: 'bg-amber-light',
  blue: 'bg-cobalt-light',
}

const pillStyle: Record<GapVariant, string> = {
  gap: 'bg-amber-light text-amber',
  close: 'bg-accent-light text-accent',
}

const previewPractices: Practice[] = [
  { icon: '⚡', iconColor: 'green', title: 'Checkout speed', desc: <>Top-performing stores average <strong className="font-semibold text-primary">32 seconds per transaction</strong>. Your store averages 34s — nearly caught up.</>, pillText: 'Your gap: 2s', pillVariant: 'close' },
  { icon: '👋', iconColor: 'green', title: 'Greeting speed and consistency', desc: <>Top performers greet customers with <strong className="font-semibold text-primary">96% consistency</strong>. Your store is at 88%.</>, pillText: 'Your gap: 8 pts', pillVariant: 'gap' },
  { icon: '🔄', iconColor: 'blue', title: 'Zero dead air during transactions', desc: <>Top stores show <strong className="font-semibold text-primary">active verbal engagement throughout the transaction</strong> — not just greeting and close. Your team is close behind.</>, pillText: 'Your gap: close', pillVariant: 'close' },
  { icon: '📅', iconColor: 'amber', title: 'High scorers always on during peak', desc: <>Network&apos;s top stores schedule their <strong className="font-semibold text-primary">top performers during every peak window</strong> without exception. You have 2 uncovered windows this week.</>, pillText: 'Your gap: 2 windows', pillVariant: 'gap' },
  { icon: '📈', iconColor: 'green', title: 'Coaching resolution speed', desc: <>Top stores resolve coaching issues in an average of <strong className="font-semibold text-primary">1.8 weeks</strong>. Your team averages 2.1 weeks.</>, pillText: 'Your gap: 0.3 wks', pillVariant: 'close' },
  { icon: '🏆', iconColor: 'blue', title: 'Staff score floor', desc: <>Top-ranked stores have <strong className="font-semibold text-primary">no employee below a 70 score</strong>. You have 1 employee below that threshold.</>, pillText: 'Your gap: 1 employee', pillVariant: 'gap' },
]

export default function TopStorePractices({ 
  previewMode,
  selectedStoreId,
  period,
}: { 
  previewMode?: boolean
  selectedStoreId?: string | null
  period?: string
} = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.benchmarkingTopPractices] ?? true)
  const { data: session } = useSession()
  const token = session?.user?.token
  
  const [cardsData, setCardsData] = useState<BenchmarkingNetworkIntelligenceResponse['cards'] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token || !selectedStoreId || previewMode) return
    let cancelled = false
    setLoading(true)

    fetchNetworkIntelligence(token, selectedStoreId, period)
      .then((res) => {
        if (!cancelled) {
          setCardsData(res.cards)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, selectedStoreId, period, previewMode])

  if (!previewMode && !visible) return null

  let shownPractices: Practice[] = []

  if (previewMode) {
    shownPractices = previewPractices.slice(0, 2)
  } else if (cardsData) {
    if (cardsData.checkout) {
      shownPractices.push({
        icon: '⚡', iconColor: 'green', title: cardsData.checkout.title,
        desc: cardsData.checkout.description,
        pillText: cardsData.checkout.your_gap,
        pillVariant: cardsData.checkout.your_gap.toLowerCase().includes('slower') ? 'gap' : 'close'
      })
    }
    if (cardsData.greeting) {
      shownPractices.push({
        icon: '👋', iconColor: 'green', title: cardsData.greeting.title,
        desc: cardsData.greeting.description,
        pillText: cardsData.greeting.your_gap,
        pillVariant: cardsData.greeting.your_gap.toLowerCase().includes('less') ? 'gap' : 'close'
      })
    }
    if (cardsData.dead_air) {
      shownPractices.push({
        icon: '🔄', iconColor: 'blue', title: cardsData.dead_air.title,
        desc: cardsData.dead_air.description,
        pillText: cardsData.dead_air.your_gap,
        pillVariant: cardsData.dead_air.your_gap.toLowerCase().includes('more') ? 'gap' : 'close'
      })
    }
    if (cardsData.coaching) {
      shownPractices.push({
        icon: '📈', iconColor: 'green', title: cardsData.coaching.title,
        desc: cardsData.coaching.description,
        pillText: cardsData.coaching.your_gap,
        pillVariant: cardsData.coaching.your_gap.toLowerCase().includes('enough data') ? 'gap' : 'close'
      })
    }
    if (cardsData.staff_floor) {
      shownPractices.push({
        icon: '🏆', iconColor: 'blue', title: cardsData.staff_floor.title,
        desc: cardsData.staff_floor.description,
        pillText: cardsData.staff_floor.your_gap,
        pillVariant: cardsData.staff_floor.your_gap.toLowerCase().includes('enough data') ? 'gap' : 'close'
      })
    }
  } else {
    // Empty state while loading or no data
    shownPractices = [
      { icon: '⚡', iconColor: 'green', title: 'Checkout speed', desc: 'Loading network intelligence...', pillText: 'N/A', pillVariant: 'gap' },
      { icon: '👋', iconColor: 'green', title: 'Greeting speed and consistency', desc: 'Loading network intelligence...', pillText: 'N/A', pillVariant: 'gap' },
      { icon: '🔄', iconColor: 'blue', title: 'Zero dead air during transactions', desc: 'Loading network intelligence...', pillText: 'N/A', pillVariant: 'gap' },
    ]
  }

  return (
    <div className={`bg-surface border border-border rounded-[14px] overflow-hidden transition-opacity ${loading ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
        <div>
          <div className="text-[13.5px] font-semibold">What Top-Ranked Stores Do Differently</div>
          <div className="text-[11.5px] text-muted mt-[2px]">Aggregated behavioral patterns from stores ranked #1–3 in the Pythia network</div>
        </div>
        <div className="text-[10px] font-semibold px-[9px] py-[3px] rounded-full bg-gold-light text-gold tracking-[.05em]">
          Network Intelligence
        </div>
      </div>

      <div className="grid grid-cols-3">
        {shownPractices.map((p, i) => (
          <div
            key={p.title}
            className={`flex flex-col gap-[10px] p-[22px]
              ${(i + 1) % 3 !== 0 ? 'border-r border-border' : ''}
              ${i < 3 ? 'border-b border-border' : ''}`}
          >
            <div className="flex items-start gap-[10px]">
              <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px] shrink-0 ${iconBg[p.iconColor]}`}>
                {p.icon}
              </div>
              <div className="text-[13px] font-semibold leading-[1.3]">{p.title}</div>
            </div>
            <div className="text-[12px] text-secondary leading-[1.55]">{p.desc}</div>
            <div className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full w-fit ${pillStyle[p.pillVariant]}`}>
              {p.pillText}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
