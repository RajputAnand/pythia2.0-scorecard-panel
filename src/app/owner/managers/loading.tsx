export default function ManagersLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="h-5 w-40 rounded bg-border" />
      </div>

      <div className="px-[30px] py-[26px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 rounded-full bg-border" />
          <div className="h-9 w-36 rounded-lg bg-border" />
        </div>
        <div className="h-9 w-full max-w-[320px] rounded-lg bg-border" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[60px] rounded-[10px] bg-border" />
          ))}
        </div>
      </div>
    </div>
  )
}
