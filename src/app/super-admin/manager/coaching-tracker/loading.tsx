export default function SuperAdminCoachingTrackerLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="h-5 w-52 rounded bg-border" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded bg-border" />
          <div className="h-9 w-32 rounded bg-border" />
        </div>
      </div>

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        {/* CoachingWinStrip skeleton — 4 cards */}
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

        {/* CoachingTrackerPanel skeleton */}
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-52 rounded bg-border" />
              <div className="h-3 w-72 rounded bg-border" />
            </div>
            <div className="h-3 w-40 rounded bg-border" />
          </div>

          {/* Stalled alert skeleton */}
          <div className="mx-[22px] mt-[14px] h-12 rounded-[10px] bg-border" />

          {/* Employee selector skeleton */}
          <div className="flex gap-2 px-[22px] py-[14px] border-b border-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-28 rounded-[30px] bg-border" />
            ))}
          </div>

          {/* Drilldown content skeleton */}
          <div className="p-[22px] flex flex-col gap-4">
            <div className="h-6 w-48 rounded bg-border" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-border" />
              ))}
            </div>
            <div className="h-48 w-full rounded-xl bg-border" />
          </div>
        </div>
      </div>
    </div>
  )
}
