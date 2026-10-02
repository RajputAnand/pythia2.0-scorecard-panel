export default function SuperAdminStaffingIntelligenceLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 lg:px-[30px] h-[58px] border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="h-5 w-44 rounded bg-border" />
          <div className="h-4 w-28 rounded-full bg-border" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 rounded-lg bg-border" />
          <div className="h-8 w-8 rounded-full bg-border" />
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between px-4 lg:px-[30px] min-h-[50px] py-1.5 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 rounded-lg bg-border" />
          <div className="h-7 w-7 rounded-md bg-border" />
          <div className="h-7 w-7 rounded-md bg-border" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-36 rounded-lg bg-border" />
          <div className="h-8 w-44 rounded-lg bg-border" />
          <div className="h-8 w-32 rounded-lg bg-border" />
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* StaffingInsightStrip skeleton — 4 cards */}
        <div className="grid grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-[13px] px-[18px] py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-border" />
                <div className="h-[26px] w-[26px] rounded-[8px] bg-border" />
              </div>
              <div className="h-8 w-10 rounded bg-border" />
              <div className="h-3 w-36 rounded bg-border" />
            </div>
          ))}
        </div>

        {/* StaffingSchedulePanel skeleton */}
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
            <div className="h-4 w-40 rounded bg-border" />
            <div className="h-3 w-32 rounded bg-border" />
          </div>
          {/* Column headers */}
          <div className="grid grid-cols-8 gap-0 px-[22px] py-3 border-b border-border">
            <div className="h-3 w-20 rounded bg-border" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-3 w-16 rounded bg-border mx-auto" />
            ))}
          </div>
          {/* Employee rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-0 px-[22px] py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-border" />
                <div className="h-3 w-16 rounded bg-border" />
              </div>
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-8 w-20 rounded-lg bg-border mx-auto" />
              ))}
            </div>
          ))}
        </div>

        {/* StaffingRecommendations + StaffingTeamScores skeleton */}
        <div className="grid grid-cols-[1fr_300px] gap-5">
          <div className="h-64 rounded-[14px] bg-border" />
          <div className="h-64 rounded-[14px] bg-border" />
        </div>
      </div>
    </div>
  )
}
