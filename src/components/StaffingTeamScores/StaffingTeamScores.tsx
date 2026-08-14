import type { TeamScoreMember } from '@/types/staff'

const scoreColor: Record<string, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
}

interface Props {
  members: TeamScoreMember[]
}

export default function StaffingTeamScores({ members }: Props) {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="px-[18px] py-[13px] border-b border-border">
        <div className="text-[13px] font-semibold">Team Performance Reference</div>
        <div className="text-[11px] text-muted mt-0.5">Use when scheduling — higher scores = peak hour priority</div>
      </div>
      <div className="px-[18px] py-[10px] flex flex-col gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-[9px]">
            <div
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ background: member.avatarColor }}
            >
              {member.initials}
            </div>
            <span className="text-[12px] font-medium flex-1">{member.name}</span>
            <div className="w-[60px] h-[5px] bg-surface-alt rounded-[3px] overflow-hidden">
              <div
                className="h-full rounded-[3px]"
                style={{ width: member.barWidth, background: member.barColor }}
              />
            </div>
            <span className={`font-mono text-[12px] font-bold ${scoreColor[member.scoreColor]}`}>
              {member.score}
            </span>
          </div>
        ))}
        {members.length === 0 && (
          <div className="text-center text-[11.5px] text-muted py-4">No employees on record for this store</div>
        )}
      </div>
    </div>
  )
}
