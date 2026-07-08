'use client'

import styles from './HeroBanner.module.css'
import { HeroBannerData, MetricData } from '@/types/hero-banner'
import { WeeklyStats } from '@/types/overview'
import { useSession } from 'next-auth/react'
import { getGreeting } from '@/utils/common'

interface MetricProps extends MetricData {}

function Metric({ label, value, change, valueColor }: MetricProps) {
  return (
    <div
      className="flex flex-col rounded-[9px] border gap-[2px] px-[14px] py-[8px]"
      style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <div className="uppercase tracking-[.09em] text-[9px]" style={{ color: 'white', opacity: 0.6 }}>
        {label}
      </div>
      <div className="font-mono font-bold text-[16px]" style={{ color: valueColor ?? '#FFFFFF' }}>
        {value}
      </div>
      <div className="text-[9.5px]" style={{ color: 'white', opacity: 0.6 }}>
        {change}
      </div>
    </div>
  )
}

const RING_CIRCUMFERENCE = 289

export default function HeroBanner({ data, weeklyStats }: { data: HeroBannerData, weeklyStats: WeeklyStats }) {
  const { data: user } = useSession()
  if (!weeklyStats) return <></>
  const points = weeklyStats.points ?? 0
  const ringOffset = RING_CIRCUMFERENCE * (1 - Math.round(weeklyStats.overall_score ?? 0) / 100)
  return (
    <div
      className={`${styles.bannerPseudo} relative rounded-2xl overflow-hidden grid items-center`}
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        gap: 32,
        padding: '28px 32px',
        background: 'linear-gradient(135deg, #1A1714 0%, #1D3828 60%, #2D5A3A 100%)',
      }}
    >
      {/* Score ring */}
      <div className="relative shrink-0 w-[110px] h-[110px]">
        <svg viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)', width: 110, height: 110 }}>
          <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="55" cy="55" r="46"
            fill="none" stroke="#78C99A" strokeWidth="8"
            strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={ringOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono font-bold text-white leading-none text-[32px]">{Math.round(weeklyStats.overall_score ?? 0)}</div>
          <div className="uppercase text-white/40 tracking-[.1em] text-[9px] mt-[2px]">Score</div>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-col gap-[10px]">
        <div className="font-bold text-white leading-tight text-[20px]">
          {getGreeting()}, <span style={{ color: '#78C99A' }}>{(user!.user.name)?.split(" ")[0]}.</span>
          <br />You&apos;re on a {weeklyStats.streak_weeks}-week improvement streak. 🔥
        </div>
        <div className="text-white leading-relaxed text-[13px]">
          {data.scoreSubtitle}
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Metric key={"Hospitality"} change='↑ +4 this week' label='Hospitality' value={(weeklyStats.hospitality ?? 0).toString()} valueColor='#78C99A' />
          <Metric key={"Checkout Spd"} change='→ Coaching active' label='Checkout Spd' value={(weeklyStats.checkout_speed ?? 0).toString()} valueColor='#F5C842' />
          <Metric key={"Time to Svc"} change='↑ +2 this week' label='Time to Svc' value={(weeklyStats.time_to_service ?? 0).toString()} valueColor='#78C99A' />
          <Metric key={"Shift Hours"} change='This week' label='Shift Hours' value='36h' />
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-[10px]">
        <div
          className="text-center rounded-xl px-[18px] py-[12px]"
          style={{ background: 'rgba(184,134,11,0.25)', border: '1px solid rgba(184,134,11,0.4)' }}
        >
          <div className="font-mono font-bold leading-none text-[28px]" style={{ color: '#F5C842' }}>
            {(points || 0).toLocaleString()}
          </div>
          <div
            className="uppercase tracking-[.09em] text-[10px] mt-[3px]"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Points
          </div>
        </div>
        <div
          className="text-center rounded-xl px-[16px] py-[8px]"
          style={{ background: 'rgba(29,92,58,0.35)', border: '1px solid rgba(120,201,154,0.3)' }}
        >
          <div className="font-mono font-bold leading-none text-[20px]" style={{ color: '#78C99A' }}>{weeklyStats.team_rank}</div>
          <div
            className="uppercase tracking-[.09em] text-[10px] mt-[2px]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Team rank
          </div>
        </div>
      </div>
    </div>
  )
}
