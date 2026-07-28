const cards = [
  {
    label: 'Total Foot Traffic',
    icon: '🚶',
    iconBg: 'bg-accent-light',
    value: '0%',
    valueColor: 'text-accent',
    sub: <><strong className="text-secondary font-medium">N/A</strong> vs. prior period · Node 2</>,
  },
  {
    label: 'Best Channel',
    icon: '📱',
    iconBg: 'bg-cobalt-light',
    value: 'N/A',
    valueColor: 'text-cobalt',
    sub: <><strong className="text-secondary font-medium">N/A ROAS</strong> · highest traffic-per-dollar</>,
  },
  {
    label: 'Fastest Growing Segment',
    icon: '📈',
    iconBg: 'bg-purple-light',
    value: 'N/A',
    valueColor: 'text-purple',
    sub: <><strong className="text-secondary font-medium">N/A</strong> this period vs. last</>,
  },
  {
    label: 'Active Campaigns',
    icon: '📣',
    iconBg: 'bg-amber-light',
    value: '0',
    valueColor: 'text-amber',
    sub: <><strong className="text-secondary font-medium">N/A</strong></>,
  },
]

export default function MarketingInsightStrip() {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-[14px]">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface border border-border rounded-[13px] px-[18px] py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{c.label}</span>
            <div className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[12px] ${c.iconBg}`}>
              {c.icon}
            </div>
          </div>
          <div className={`font-mono text-[26px] font-bold tracking-[-0.02em] leading-none ${c.valueColor}`}>{c.value}</div>
          <div className="text-[11.5px] text-muted leading-[1.4]">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
