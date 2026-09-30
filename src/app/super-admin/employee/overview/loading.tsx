export default function SuperAdminEmployeeOverviewLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[14px] border-b border-border">
        <div className="flex items-center gap-[14px]">
          <div className="h-5 w-44 rounded bg-border" />
          <div className="h-4 w-28 rounded-full bg-border" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-40 rounded-lg bg-border" />
          <div className="h-8 w-32 rounded-lg bg-border" />
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
