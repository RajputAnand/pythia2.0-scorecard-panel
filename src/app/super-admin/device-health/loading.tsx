export default function DeviceHealthLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="flex items-center gap-[14px]">
          <div className="h-5 w-32 rounded bg-border" />
          <div className="h-5 w-20 rounded-full bg-border" />
        </div>
      </div>

      <div className="grid px-[30px] py-[24px] gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-[14px] border border-border bg-surface h-[220px]" />
        ))}
      </div>
    </div>
  )
}
