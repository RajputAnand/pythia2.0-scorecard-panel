export default function VideoIdentitiesLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="h-5 w-52 rounded bg-border" />
      </div>

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        {/* Stat strip skeleton */}
        <div className="grid grid-cols-4 gap-[14px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px]">
              <div className="h-3 w-24 rounded bg-border" />
              <div className="h-8 w-16 rounded bg-border" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-[280px] rounded-lg bg-border" />
          <div className="h-8 w-[320px] rounded-full bg-border" />
        </div>

        {/* Video card skeletons */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-[14px] p-4 flex gap-4">
              <div className="shrink-0 w-[168px] h-[104px] rounded-[10px] bg-border" />
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-4 w-56 rounded bg-border" />
                <div className="h-3 w-40 rounded bg-border" />
                <div className="flex gap-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="h-9 w-40 rounded-[10px] bg-border" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
