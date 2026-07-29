interface StoreTrack {
  label: string
  isYours?: boolean
  months: { rank: string; flex: number; color: string }[]
  currentRank: string
  currentColor: string
  delta: string
  deltaVariant: 'up' | 'down' | 'flat'
}

const tracks: StoreTrack[] = [
  {
    label: '#14',
    months: [
      { rank: 'N/A', flex: 0.9, color: '#B8860B' },
      { rank: 'N/A', flex: 0.9, color: '#B8860B' },
      { rank: 'N/A', flex: 0.9, color: '#B8860B' },
      { rank: 'N/A', flex: 0.9, color: '#B8860B' },
    ],
    currentRank: 'N/A',
    currentColor: '#B8860B',
    delta: 'N/A',
    deltaVariant: 'flat',
  },
  {
    label: '#7',
    months: [
      { rank: 'N/A', flex: 0.85, color: '#5A7A9A' },
      { rank: 'N/A', flex: 0.85, color: '#5A7A9A' },
      { rank: 'N/A', flex: 0.85, color: '#5A7A9A' },
      { rank: 'N/A', flex: 0.85, color: '#5A7A9A' },
    ],
    currentRank: 'N/A',
    currentColor: '#5A7A9A',
    delta: 'N/A',
    deltaVariant: 'flat',
  },
  {
    label: '#18',
    months: [
      { rank: 'N/A', flex: 0.7, color: '#4A8A6A' },
      { rank: 'N/A', flex: 0.68, color: '#4A8A6A' },
      { rank: 'N/A', flex: 0.66, color: '#4A8A6A' },
      { rank: 'N/A', flex: 0.72, color: '#4A8A6A' },
    ],
    currentRank: 'N/A',
    currentColor: '#4A8A6A',
    delta: 'N/A',
    deltaVariant: 'flat',
  },
  {
    label: 'You',
    isYours: true,
    months: [
      { rank: 'N/A', flex: 0.56, color: '#1D5C3A' },
      { rank: 'N/A', flex: 0.60, color: '#1D5C3A' },
      { rank: 'N/A', flex: 0.63, color: '#1D5C3A' },
      { rank: 'N/A', flex: 0.68, color: '#1D5C3A' },
    ],
    currentRank: 'N/A',
    currentColor: '#1D5C3A',
    delta: 'N/A',
    deltaVariant: 'flat',
  },
  {
    label: '#9',
    months: [
      { rank: 'N/A', flex: 0.60, color: '#888' },
      { rank: 'N/A', flex: 0.60, color: '#888' },
      { rank: 'N/A', flex: 0.60, color: '#888' },
      { rank: 'N/A', flex: 0.58, color: '#888' },
    ],
    currentRank: 'N/A',
    currentColor: '#888',
    delta: 'N/A',
    deltaVariant: 'flat',
  },
]

const deltaClass: Record<'up' | 'down' | 'flat', string> = {
  up: 'text-accent',
  down: 'text-danger',
  flat: 'text-muted',
}

export default function RankMovement() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="px-[22px] py-4 border-b border-border">
        <div className="text-[13.5px] font-semibold">Month-over-Month Rank Movement</div>
        <div className="text-[11.5px] text-muted mt-[2px]">Your store vs. top 5 and nearest competitor</div>
      </div>

      <div className="flex flex-col gap-[14px] px-[22px] py-5">
        {tracks.map((track) => (
          <div key={track.label} className="flex items-center gap-[14px]">
            <div className={`w-[72px] font-mono text-[11.5px] font-semibold shrink-0 ${track.isYours ? 'text-accent' : 'text-secondary'}`}>
              {track.label}
            </div>
            <div className="flex-1 flex gap-[3px] items-center">
              {track.months.map((m, i) => (
                <div
                  key={i}
                  className="h-7 rounded flex items-center justify-center px-[6px] min-w-[40px]"
                  style={{ flex: m.flex, background: m.color }}
                >
                  <span className="font-mono text-[10px] font-bold text-white whitespace-nowrap">{m.rank}</span>
                </div>
              ))}
            </div>
            <div className="w-[70px] flex flex-col items-end gap-[1px]">
              <div className="font-mono text-[16px] font-bold" style={{ color: track.currentColor }}>{track.currentRank}</div>
              <div className={`font-mono text-[10.5px] font-semibold ${deltaClass[track.deltaVariant]}`}>{track.delta}</div>
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-border text-[11.5px] text-muted leading-[1.6]">
          <strong className="font-semibold text-secondary">Key takeaway:</strong> Rank movement data is not yet available for this period.
        </div>
      </div>
    </div>
  )
}
