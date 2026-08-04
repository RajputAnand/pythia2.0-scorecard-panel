export default function KpiVisibilityLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="flex items-center gap-[14px]">
          <div className="h-5 w-32 rounded bg-border" />
          <div className="h-5 w-20 rounded-full bg-border" />
        </div>
      </div>

      <div className="grid px-[30px] py-[24px] gap-5">
        <div className="h-4 w-64 rounded bg-border" />

        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-[10px] bg-border" />
          ))}
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-32 rounded-[9px] bg-border" />
          ))}
        </div>

        <div className="rounded-[14px] border border-border overflow-hidden">
          <div className="h-[52px] border-b border-border bg-surface-alt" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-[10px] border-b border-border last:border-b-0">
              <div className="h-6 w-[30px] rounded bg-border" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 w-40 rounded bg-border" />
                <div className="h-2.5 w-56 rounded bg-border" />
              </div>
              <div className="h-[22px] w-[38px] rounded-full bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
