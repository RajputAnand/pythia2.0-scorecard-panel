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
      { rank: '#1', flex: 0.9, color: '#B8860B' },
      { rank: '#1', flex: 0.9, color: '#B8860B' },
      { rank: '#1', flex: 0.9, color: '#B8860B' },
      { rank: '#1', flex: 0.9, color: '#B8860B' },
    ],
    currentRank: '#1',
    currentColor: '#B8860B',
    delta: '±0',
    deltaVariant: 'flat',
  },
  {
    label: '#7',
    months: [
      { rank: '#2', flex: 0.85, color: '#5A7A9A' },
      { rank: '#2', flex: 0.85, color: '#5A7A9A' },
      { rank: '#3', flex: 0.85, color: '#5A7A9A' },
      { rank: '#2', flex: 0.85, color: '#5A7A9A' },
    ],
    currentRank: '#2',
    currentColor: '#5A7A9A',
    delta: '±0',
    deltaVariant: 'flat',
  },
  {
    label: '#18',
    months: [
      { rank: '#4', flex: 0.7, color: '#4A8A6A' },
      { rank: '#5', flex: 0.68, color: '#4A8A6A' },
      { rank: '#6', flex: 0.66, color: '#4A8A6A' },
      { rank: '#5', flex: 0.72, color: '#4A8A6A' },
    ],
    currentRank: '#5',
    currentColor: '#4A8A6A',
    delta: '↑ +1',
    deltaVariant: 'up',
  },
  {
    label: 'You',
    isYours: true,
    months: [
      { rank: '#10', flex: 0.56, color: '#1D5C3A' },
      { rank: '#8', flex: 0.60, color: '#1D5C3A' },
      { rank: '#7', flex: 0.63, color: '#1D5C3A' },
      { rank: '#6', flex: 0.68, color: '#1D5C3A' },
    ],
    currentRank: '#6',
    currentColor: '#1D5C3A',
    delta: '↑ +4',
    deltaVariant: 'up',
  },
  {
    label: '#9',
    months: [
      { rank: '#8', flex: 0.60, color: '#888' },
      { rank: '#7', flex: 0.60, color: '#888' },
      { rank: '#5', flex: 0.60, color: '#888' },
      { rank: '#7', flex: 0.58, color: '#888' },
    ],
    currentRank: '#7',
    currentColor: '#888',
    delta: '↓ −2',
    deltaVariant: 'down',
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
        <div className="text-[11.5px] text-muted mt-[2px]">Your store vs. top 5 and nearest competitor · Nov 2025 – Feb 2026</div>
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
          <strong className="font-semibold text-secondary">Key takeaway:</strong> Your store has climbed faster than any other in the top 10 over 4 months (+4 positions). Store #9 — your nearest competitor — is declining. At the current trajectory, you reach top 5 by April if checkout speed improves as projected.
        </div>
      </div>
    </div>
  )
}
