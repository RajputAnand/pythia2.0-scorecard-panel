import Panel from '@/components/Panel/Panel'

const milestoneLabelClass: Record<string, string> = {
  reached: 'text-accent',
  next: 'text-amber',
}

const MILESTONES = [
  { icon: '✅', status: 'Reached', label: 'Score 80', variant: 'reached' },
  { icon: '✅', status: 'Reached', label: '3-wk streak', variant: 'reached' },
  { icon: '🎯', status: 'Next goal', label: 'Score 90', variant: 'next' },
  { icon: '🏆', status: 'Next goal', label: 'Checkout 25s', variant: 'next' },
]

const badge = (
  <span className="bg-accent-light text-accent font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
    ↑ +12 pts total
  </span>
)

export default function ProgressChart() {
  return (
    <Panel title="My Progress Over Time" subtitle="Weekly score · Nov 2025 – Feb 2026" badge={badge}>
      {/* Legend */}
      <div className="flex gap-[14px] mb-3">
        <span className="flex items-center gap-[5px] text-secondary text-[11px]">
          <span className="rounded-[1px] w-[18px] h-[2px]" style={{ background: 'var(--color-accent)' }} />
          Overall
        </span>
        <span className="flex items-center gap-[5px] text-secondary text-[11px]">
          <span className="rounded-[1px] w-[18px] h-[2px]" style={{ background: 'var(--color-cobalt)' }} />
          Hospitality
        </span>
        <span className="flex items-center gap-[5px] text-secondary text-[11px]">
          <span className="rounded-[1px] w-[18px] h-[2px]" style={{ background: 'var(--color-amber)' }} />
          Checkout
        </span>
      </div>

      {/* Chart */}
      <svg width="100%" viewBox="0 0 500 160" preserveAspectRatio="none">
        {/* Grid */}
        <line x1="0" y1="20" x2="500" y2="20" stroke="#F0EDE8" strokeWidth="1" />
        <line x1="0" y1="55" x2="500" y2="55" stroke="#F0EDE8" strokeWidth="1" />
        <line x1="0" y1="90" x2="500" y2="90" stroke="#F0EDE8" strokeWidth="1" />
        <line x1="0" y1="125" x2="500" y2="125" stroke="#F0EDE8" strokeWidth="1" />
        {/* Y labels */}
        <text x="0" y="24" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">95</text>
        <text x="0" y="59" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">85</text>
        <text x="0" y="94" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">75</text>
        <text x="0" y="129" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">65</text>
        {/* Overall (green) */}
        <path d="M 28 115 L 90 108 L 150 102 L 210 95 L 270 88 L 330 82 L 390 78 L 450 68" fill="none" stroke="#1D5C3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="115" r="3.5" fill="#1D5C3A" />
        <circle cx="150" cy="102" r="3.5" fill="#1D5C3A" />
        <circle cx="270" cy="88" r="3.5" fill="#1D5C3A" />
        <circle cx="390" cy="78" r="3.5" fill="#1D5C3A" />
        <circle cx="450" cy="68" r="4.5" fill="#1D5C3A" stroke="white" strokeWidth="2" />
        <text x="22" y="109" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">72</text>
        <text x="444" y="62" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">84</text>
        {/* Hospitality (blue) */}
        <path d="M 28 118 L 90 112 L 150 104 L 210 94 L 270 86 L 330 78 L 390 72 L 450 60" fill="none" stroke="#1E4D7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="450" cy="60" r="3.5" fill="#1E4D7A" />
        <text x="444" y="55" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono">88</text>
        {/* Checkout (amber) */}
        <path d="M 28 122 L 90 120 L 150 115 L 210 110 L 270 105 L 330 100 L 390 96 L 450 92" fill="none" stroke="#C47F18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="450" cy="92" r="3.5" fill="#C47F18" />
        <text x="444" y="87" fontSize="9" fill="#C47F18" fontFamily="DM Mono">76</text>
        {/* Coaching marker */}
        <line x1="210" y1="0" x2="210" y2="160" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="3,3" />
        <text x="213" y="14" fontSize="8" fill="#B0A89E" fontFamily="DM Mono">Coaching started</text>
        {/* Streak badge */}
        <rect x="320" y="30" width="110" height="22" rx="5" fill="#1D5C3A" opacity="0.12" />
        <text x="326" y="45" fontSize="9" fill="#1D5C3A" fontFamily="DM Sans" fontWeight="600">🔥 3-week streak</text>
      </svg>

      {/* X labels */}
      <div className="flex justify-between mt-[5px]">
        <span className="font-mono text-muted text-center text-[9.5px]">Nov</span>
        <span className="font-mono text-muted text-center text-[9.5px]">Dec</span>
        <span className="font-mono text-muted text-center text-[9.5px]">Jan</span>
        <span className="font-mono text-muted text-center text-[9.5px]">Feb</span>
        <span className="font-mono text-accent font-semibold text-center text-[9.5px]">Now</span>
      </div>

      {/* Milestones */}
      <div className="flex gap-2 mt-[14px]">
        {MILESTONES.map((m) => (
          <div key={m.label} className="flex-1 flex flex-col bg-surface-alt rounded-[9px] gap-[3px] px-[12px] py-[10px]">
            <span className="text-[14px]">{m.icon}</span>
            <span className="uppercase tracking-[.07em] text-muted text-[10px]">{m.status}</span>
            <span className={`font-semibold text-[12px] ${milestoneLabelClass[m.variant]}`}>{m.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}
