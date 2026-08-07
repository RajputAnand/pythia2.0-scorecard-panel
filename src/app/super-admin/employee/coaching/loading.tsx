export default function SuperAdminEmployeeCoachingLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-24 rounded bg-border" />
          <div className="h-3.5 w-52 rounded bg-border" />
        </div>
      </div>

      <div className="grid px-[30px] py-[24px] gap-5">
        {/* CoachingMoments skeleton */}
        <div className="h-64 w-full rounded-xl bg-border" />
      </div>
    </div>
  )
}
