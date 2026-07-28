export default function ManagerDashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="h-5 w-44 rounded bg-border" />
      </div>

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        {/* UnknownIdentitiesAlertCard skeleton */}
        <div className="bg-surface border border-border rounded-[13px] px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[9px] bg-border shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-56 rounded bg-border" />
            <div className="h-3 w-40 rounded bg-border" />
          </div>
        </div>

        {/* ManagerDashboardKpiStrip skeleton — 4 cards */}
        <div className="grid grid-cols-4 gap-[14px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px]">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-border" />
                <div className="h-[27px] w-[27px] rounded-[8px] bg-border" />
              </div>
              <div className="h-8 w-16 rounded bg-border" />
              <div className="h-[6px] w-full rounded bg-border" />
              <div className="h-3 w-36 rounded bg-border" />
            </div>
          ))}
        </div>

        {/* ManagerDashboardLeaderboard skeleton */}
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-64 rounded bg-border" />
              <div className="h-3 w-72 rounded bg-border" />
            </div>
            <div className="flex gap-[6px]">
              <div className="h-7 w-20 rounded-full bg-border" />
              <div className="h-7 w-20 rounded-full bg-border" />
            </div>
          </div>
          <div className="flex gap-[6px] px-[22px] py-3 border-b border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 w-28 rounded-full bg-border" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-[18px] px-[22px] py-[13px] border-b border-border last:border-0">
              <div className="h-7 w-7 rounded-lg bg-border shrink-0" />
              <div className="h-7 w-7 rounded-full bg-border shrink-0" />
              <div className="h-3 w-24 rounded bg-border" />
              <div className="h-[5px] w-[60px] rounded bg-border ml-auto" />
              <div className="h-[5px] w-[60px] rounded bg-border" />
              <div className="h-[5px] w-[60px] rounded bg-border" />
              <div className="h-4 w-8 rounded bg-border" />
            </div>
          ))}
        </div>

        {/* CoachingHealthSnapshot + ManagerDashboardTrendChart skeleton — side by side, 50/50 */}
        <div className="grid grid-cols-2 gap-5 items-start">
          <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-[15px] border-b border-border">
              <div className="h-4 w-32 rounded bg-border" />
              <div className="h-3 w-28 rounded bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-4 px-5 py-[18px]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-6 w-12 rounded bg-border" />
                  <div className="h-3 w-24 rounded bg-border" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-[15px] border-b border-border">
              <div className="h-4 w-40 rounded bg-border" />
              <div className="h-3 w-48 rounded bg-border" />
            </div>
            <div className="h-[180px] mx-5 my-[18px] rounded bg-border" />
          </div>
        </div>
      </div>
    </div>
  )
}
