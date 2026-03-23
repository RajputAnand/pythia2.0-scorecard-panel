import styles from './HeroBanner.module.css'

interface MetricProps {
  label: string
  value: string
  change: string
  valueColor?: string
}

function Metric({ label, value, change, valueColor }: MetricProps) {
  return (
    <div
      className="flex flex-col rounded-[9px] border gap-[2px] px-[14px] py-[8px]"
      style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <div className="uppercase tracking-[.09em] text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </div>
      <div className="font-mono font-bold text-[16px]" style={{ color: valueColor ?? '#FFFFFF' }}>
        {value}
      </div>
      <div className="text-[9.5px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {change}
      </div>
    </div>
  )
}

export default function HeroBanner() {
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
            strokeDasharray="289" strokeDashoffset="52"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono font-bold text-white leading-none text-[32px]">84</div>
          <div className="uppercase text-white/40 tracking-[.1em] text-[9px] mt-[2px]">Score</div>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-col gap-[10px]">
        <div className="font-bold text-white leading-tight text-[20px]">
          Good morning, <span style={{ color: '#78C99A' }}>Marcus.</span>
          <br />You&apos;re on a 3-week improvement streak. 🔥
        </div>
        <div className="text-white/50 leading-relaxed text-[13px]">
          Your score is up 6 points since November. You&apos;re in the top 25% of your team this week.
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Metric label="Hospitality" value="88" change="↑ +4 this week" valueColor="#78C99A" />
          <Metric label="Checkout Spd" value="76" change="→ Coaching active" valueColor="#F5C842" />
          <Metric label="Time to Svc" value="86" change="↑ +2 this week" valueColor="#78C99A" />
          <Metric label="Shift Hours" value="36h" change="This week" />
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-[10px]">
        <div
          className="text-center rounded-xl px-[18px] py-[12px]"
          style={{ background: 'rgba(184,134,11,0.25)', border: '1px solid rgba(184,134,11,0.4)' }}
        >
          <div className="font-mono font-bold leading-none text-[28px]" style={{ color: '#F5C842' }}>1,840</div>
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
          <div className="font-mono font-bold leading-none text-[20px]" style={{ color: '#78C99A' }}>#2 / 5</div>
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
