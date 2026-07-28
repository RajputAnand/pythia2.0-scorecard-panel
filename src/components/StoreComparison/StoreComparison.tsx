interface MetricRowProps {
  label: string
  shortLabel: string
  yoursScore: number
  yoursColor: string
  gap: string
  gapVariant: 'behind' | 'ahead'
  theirsScore: number
  isLast?: boolean
}

function MetricRow({ label, shortLabel, yoursScore, yoursColor, gap, gapVariant, theirsScore, isLast }: MetricRowProps) {
  const borderB = isLast ? '' : 'border-b border-border'
  return (
    <>
      <div className={`flex flex-col gap-[6px] px-[22px] py-[14px] bg-[#FAFDF8] ${borderB}`}>
        <div className="text-[9.5px] font-semibold text-muted uppercase tracking-[.08em]">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[26px] font-bold leading-none" style={{ color: yoursColor }}>{yoursScore}</span>
          <span className={`font-mono text-[11.5px] font-semibold ${gapVariant === 'behind' ? 'text-amber' : 'text-accent'}`}>{gap}</span>
        </div>
        <div className="h-[6px] bg-surface-alt rounded overflow-hidden mt-1">
          <div className="h-full rounded" style={{ width: `${yoursScore}%`, background: yoursColor }} />
        </div>
      </div>
      <div className={`flex items-center justify-center border-l border-r border-border ${borderB}`}>
        <span className="text-[9px] font-semibold text-muted uppercase tracking-[.07em] [writing-mode:vertical-rl] rotate-180">
          {shortLabel}
        </span>
      </div>
      <div className={`flex flex-col gap-[6px] px-[22px] py-[14px] bg-[#FDFCF4] ${borderB}`}>
        <div className="text-[9.5px] font-semibold text-muted uppercase tracking-[.08em]">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[26px] font-bold leading-none text-gold">{theirsScore}</span>
        </div>
        <div className="h-[6px] bg-surface-alt rounded overflow-hidden mt-1">
          <div className="h-full rounded bg-gold" style={{ width: `${theirsScore}%` }} />
        </div>
      </div>
    </>
  )
}

export default function StoreComparison() {
  return (
    <div className="grid grid-cols-[1fr_60px_1fr] bg-surface border border-border rounded-[14px] overflow-hidden">

      {/* Header row */}
      <div className="flex flex-col px-[22px] py-[18px] gap-1 border-b border-border bg-accent-light">
        <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-accent">Your Store</div>
        <div className="text-[15px] font-bold">Main St. Store</div>
        <div className="font-mono text-[11.5px] text-muted">#6 of 24 · 76th percentile</div>
      </div>
      <div className="flex items-center justify-center border-b border-border border-l border-r bg-surface-alt">
        <span className="text-[9px] font-semibold text-muted uppercase tracking-[.07em] [writing-mode:vertical-rl] rotate-180">vs.</span>
      </div>
      <div className="flex flex-col px-[22px] py-[18px] gap-1 border-b border-border bg-gold-light">
        <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-gold">Top Performer</div>
        <div className="text-[15px] font-bold">Store #14</div>
        <div className="font-mono text-[11.5px] text-muted">#1 of 24 · 99th percentile</div>
      </div>

      {/* Metric rows */}
      <MetricRow
        label="Overall Score" shortLabel="Overall"
        yoursScore={82} yoursColor="#C47F18" gap="−12 pts" gapVariant="behind"
        theirsScore={94}
      />
      <MetricRow
        label="Hospitality" shortLabel="Hosp"
        yoursScore={84} yoursColor="#1D5C3A" gap="−12 pts" gapVariant="ahead"
        theirsScore={96}
      />
      <MetricRow
        label="Checkout Speed" shortLabel="Checkout"
        yoursScore={74} yoursColor="#C47F18" gap="−17 pts" gapVariant="behind"
        theirsScore={91}
      />
      <MetricRow
        label="Time to Service" shortLabel="Time to Svc"
        yoursScore={82} yoursColor="#1D5C3A" gap="−11 pts" gapVariant="behind"
        theirsScore={93}
        isLast
      />

      {/* Insight row */}
      <div className="col-span-full px-[22px] py-3 text-[12px] text-secondary leading-[1.5] bg-surface-alt border-t border-border">
        <strong className="font-semibold text-primary">Biggest gap: Checkout Speed (−17 pts).</strong> This is where Store #14 separates from the field — and where your team has the most room to gain. Closing half this gap would move you from #6 to an estimated #4 overall. Hospitality is actually your strongest metric relative to the top performer, only 12 points back.
      </div>

    </div>
  )
}
