export default function SuperAdminMarketingLoopLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[30px] py-[18px] border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-52 rounded bg-border" />
          <div className="h-3.5 w-64 rounded bg-border" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded bg-border" />
          <div className="h-9 w-36 rounded bg-border" />
        </div>
      </div>

      <div className="grid px-[30px] py-[24px] gap-5">
        {/* MarketingInsightStrip skeleton */}
        <div className="h-20 w-full rounded-xl bg-border" />

        {/* DemographicShifts + CustomerSegmentShifts */}
        <div className="grid grid-cols-[1fr_1fr] gap-[18px] items-start">
          <div className="h-72 rounded-xl bg-border" />
          <div className="h-72 rounded-xl bg-border" />
        </div>

        {/* SpendVsTraffic skeleton */}
        <div className="h-64 w-full rounded-xl bg-border" />

        {/* CampaignCards skeleton */}
        <div className="h-56 w-full rounded-xl bg-border" />
      </div>
    </div>
  )
}
