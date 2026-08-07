export default function SuperAdminEmployeeOverviewLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-36 rounded bg-border" />
          <div className="h-3.5 w-52 rounded bg-border" />
        </div>
      </div>

      <div className="grid px-[30px] py-[24px] gap-5">
        {/* HeroBanner skeleton */}
        <div className="h-40 w-full rounded-xl bg-border" />

        {/* CoachingMoments + Leaderboard */}
        <div className="grid grid-cols-2 items-start gap-[18px]">
          <div className="h-64 rounded-xl bg-border" />
          <div className="h-64 rounded-xl bg-border" />
        </div>

        {/* ProgressChart skeleton */}
        <div className="h-72 rounded-xl bg-border" />

        {/* SwagStore skeleton */}
        <div className="h-56 w-full rounded-xl bg-border" />
      </div>
    </div>
  )
}
