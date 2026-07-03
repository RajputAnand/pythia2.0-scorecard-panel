export default function UnknownIdentitiesLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="h-5 w-52 rounded bg-border" />
      </div>

      <div className="px-[30px] py-[26px] flex flex-col gap-5 max-w-[560px]">
        {/* Carousel skeleton */}
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
            <div className="h-4 w-40 rounded bg-border" />
            <div className="h-3 w-20 rounded bg-border" />
          </div>
          <div className="flex items-center gap-3 px-[22px] py-[18px]">
            <div className="shrink-0 w-8 h-8 rounded-full bg-border" />
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full max-w-[260px] aspect-square rounded-[12px] bg-border" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-9 h-9 rounded-[7px] bg-border" />
                ))}
              </div>
              <div className="h-3 w-full max-w-[260px] rounded bg-border" />
              <div className="h-3 w-full max-w-[260px] rounded bg-border" />
            </div>
            <div className="shrink-0 w-8 h-8 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-center gap-[6px] pb-[16px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-border" />
            ))}
          </div>
        </div>

        {/* Assign picker skeleton */}
        <div className="bg-surface border border-border rounded-[14px] p-5 flex flex-col gap-3">
          <div className="h-4 w-36 rounded bg-border" />
          <div className="h-9 w-full rounded-lg bg-border" />
          <div className="h-9 w-full rounded-[9px] bg-border" />
        </div>
      </div>
    </div>
  )
}
