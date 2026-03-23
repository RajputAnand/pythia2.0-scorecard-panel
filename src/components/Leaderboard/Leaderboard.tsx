import Panel from '@/components/Panel/Panel'

type PosVariant = 'gold' | 'silver' | 'bronze' | 'yoursPos' | 'regular'

interface LeaderboardEntry {
  pos: number
  posVariant: PosVariant
  initials: string
  avatarBg: string
  name: string
  isYou?: boolean
  barWidth: string
  barColor: string
  score: number
  scoreIsYou?: boolean
  pts: string
  ptsIsYou?: boolean
}

const posClass: Record<PosVariant, string> = {
  gold: 'bg-[#FBF0C0] text-[#A07010]',
  silver: 'bg-[#F0F0F4] text-[#70708A]',
  bronze: 'bg-[#FAE8D8] text-[#A05020]',
  yoursPos: 'bg-accent text-white',
  regular: 'bg-surface-alt text-muted',
}

const ENTRIES: LeaderboardEntry[] = [
  {
    pos: 1, posVariant: 'gold',
    initials: 'TA', avatarBg: '#8B7355',
    name: 'Team Member A',
    barWidth: '91%', barColor: 'var(--color-gold)',
    score: 91, pts: '2,240 pts',
  },
  {
    pos: 2, posVariant: 'yoursPos',
    initials: 'MR', avatarBg: 'var(--color-accent)',
    name: 'Marcus R.', isYou: true,
    barWidth: '84%', barColor: 'var(--color-accent)',
    score: 84, scoreIsYou: true,
    pts: '1,840 pts', ptsIsYou: true,
  },
  {
    pos: 3, posVariant: 'bronze',
    initials: 'TB', avatarBg: '#6A8A5A',
    name: 'Team Member B',
    barWidth: '80%', barColor: '#7EC8A0',
    score: 80, pts: '1,620 pts',
  },
  {
    pos: 4, posVariant: 'regular',
    initials: 'TC', avatarBg: '#7A7A8A',
    name: 'Team Member C',
    barWidth: '69%', barColor: 'var(--color-amber)',
    score: 69, pts: '980 pts',
  },
  {
    pos: 5, posVariant: 'regular',
    initials: 'TD', avatarBg: '#9A6A4A',
    name: 'Team Member D',
    barWidth: '66%', barColor: 'var(--color-amber)',
    score: 66, pts: '820 pts',
  },
]

export default function Leaderboard() {
  return (
    <Panel
      title="Team Leaderboard"
      subtitle="Anonymized · Your teammates are shown as Team Member A–D"
      badge={<span className="text-muted text-[11px]">This week</span>}
      noPadding
    >
      <div className="flex flex-col">
        {ENTRIES.map((entry) => (
          <div
            key={entry.pos}
            className={`flex items-center border-b border-border gap-3 px-5 py-[11px] last:border-b-0 ${entry.isYou ? 'bg-accent-light' : ''}`}
          >
            <div className={`flex items-center justify-center rounded-[7px] font-mono font-bold shrink-0 w-6 h-6 text-[11px] ${posClass[entry.posVariant]}`}>
              {entry.pos}
            </div>
            <div
              className="flex items-center justify-center rounded-full text-white font-bold shrink-0 w-7 h-7 text-[10px]"
              style={{ background: entry.avatarBg }}
            >
              {entry.initials}
            </div>
            <div className={`font-medium flex-1 text-[12.5px] ${entry.isYou ? 'text-accent font-bold' : ''}`}>
              {entry.name}
              {entry.isYou && (
                <span className="font-bold bg-accent text-white rounded-[4px] text-[9.5px] px-[6px] py-[1px] ml-[6px]">
                  You
                </span>
              )}
            </div>
            <div className="w-[90px]">
              <div className="bg-surface-alt rounded-[3px] overflow-hidden h-[6px]">
                <div className="h-full rounded-[3px]" style={{ width: entry.barWidth, background: entry.barColor }} />
              </div>
            </div>
            <div
              className="font-mono font-bold text-[13px] w-7 text-right"
              style={{ color: entry.scoreIsYou ? 'var(--color-accent)' : 'var(--color-gold)' }}
            >
              {entry.score}
            </div>
            <div className={`font-mono text-[11px] w-14 text-right ${entry.ptsIsYou ? 'text-amber font-semibold' : 'text-muted'}`}>
              {entry.pts}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-alt border-t border-border text-secondary leading-relaxed px-5 py-[10px] text-[12px] [&_strong]:font-semibold [&_strong]:text-primary">
        You&apos;re <strong>7 points behind #1</strong> this week. At your current improvement rate (+1.5 pts/week),
        you could reach #1 in about 5 weeks. Keep the streak going. 🔥
      </div>
    </Panel>
  )
}
