const itemCostClass: Record<string, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
}

const itemGainClass: Record<string, string> = {
  up: 'text-accent',
  flat: 'text-muted',
}

const ITEMS = [
  { name: 'Tara C.',   cost: '$0.84', quality: 'good', gain: '↑ +17 pts · 2 issues resolved', gainType: 'up' },
  { name: 'Marcus R.', cost: '$1.20', quality: 'good', gain: '↑ +12 pts · 3 resolved',         gainType: 'up' },
  { name: 'Devon W.',  cost: '$1.54', quality: 'good', gain: '↑ +10 pts · 2 resolved',         gainType: 'up' },
  { name: 'Sofia K.',  cost: '$3.20', quality: 'ok',   gain: '↑ +5 pts · 1 resolved',          gainType: 'up' },
  { name: 'Jamie L.',  cost: '$8.60', quality: 'bad',  gain: '→ −12 pts · 2 stalled',          gainType: 'flat' },
]

export default function CostPerCoaching() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">Cost Per Coaching Moment vs. Performance Gain</div>
          <div className="text-muted text-[11px] mt-0.5">How efficiently is each coaching dollar converting to score improvement?</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
          Team avg: $2.14 / point gained
        </div>
      </div>
      <div className="px-5 py-[18px]">
        <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {ITEMS.map((item) => (
            <div key={item.name} className="bg-surface-alt rounded-[10px] flex flex-col gap-[5px] px-[14px] py-[12px]">
              <div className="font-semibold text-secondary text-[11px]">{item.name}</div>
              <div className={`font-mono font-semibold text-[17px] ${itemCostClass[item.quality]}`}>{item.cost}</div>
              <div className="text-muted text-[10px] leading-[1.4]">per score point gained</div>
              <div className={`text-[10.5px] font-semibold ${itemGainClass[item.gainType]}`}>{item.gain}</div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] mt-[14px] px-[13px] py-[10px]">
          <span className="text-[13px] shrink-0 mt-[1px]">💡</span>
          <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
            Jamie&apos;s coaching cost is <strong>4× the team average</strong> with declining scores — a
            signal that AI coaching alone is not the right tool here. A single manager conversation
            (est. 30 min × $22/hr = <strong>$11</strong>) is more cost-effective than continued
            automated coaching at current trajectory.
          </p>
        </div>
      </div>
    </div>
  )
}
