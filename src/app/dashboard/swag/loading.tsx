export default function SwagLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-28 rounded bg-border" />
          <div className="h-3.5 w-52 rounded bg-border" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded bg-border" />
          <div className="h-9 w-36 rounded bg-border" />
        </div>
      </div>

      <div className="grid px-[30px] py-[24px] gap-5">
        {/* SwagStore skeleton */}
        <div className="h-56 w-full rounded-xl bg-border" />
      </div>
    </div>
  )
}
