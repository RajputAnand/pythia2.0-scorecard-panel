export default function SuperAdminRoiAttributionLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="h-5 w-40 rounded bg-border" />
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded bg-border" />
          <div className="h-9 w-40 rounded bg-border" />
        </div>
      </div>

      {/* TimeControls skeleton */}
      <div className="flex gap-2 px-[30px] py-3 border-b border-border">
        <div className="h-8 w-20 rounded bg-border" />
        <div className="h-8 w-20 rounded bg-border" />
        <div className="h-8 w-20 rounded bg-border" />
        <div className="h-8 w-20 rounded bg-border" />
      </div>

      <div className="grid px-[30px] py-[24px] gap-5">
        {/* RoiHero skeleton */}
        <div className="h-40 w-full rounded-xl bg-border" />

        {/* ScoreVsTransactions + HospitalityVsDwell */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-72 rounded-xl bg-border" />
          <div className="h-72 rounded-xl bg-border" />
        </div>

        {/* CheckoutSpeed skeleton */}
        <div className="h-56 w-full rounded-xl bg-border" />

        {/* RevenueImpactTable skeleton */}
        <div className="h-64 w-full rounded-xl bg-border" />

        {/* CostPerCoaching skeleton */}
        <div className="h-56 w-full rounded-xl bg-border" />

        {/* ProjectionSummary skeleton */}
        <div className="h-48 w-full rounded-xl bg-border" />
      </div>
    </div>
  )
}
