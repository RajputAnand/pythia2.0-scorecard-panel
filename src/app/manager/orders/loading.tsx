import Header from '@/components/shared/Header/Header'

export default function ManagerOrdersLoading() {
  return (
    <>
      <Header title="Order Management" subtitle="Manager Tools" />
      <div className="px-[30px] py-[26px] animate-pulse">
        {/* Metric strip skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface border border-border rounded-xl p-4">
              <div className="h-3 w-28 bg-border rounded mb-3" />
              <div className="h-7 w-16 bg-border rounded" />
            </div>
          ))}
        </div>

        {/* Table container skeleton */}
        <div className="bg-surface border border-border rounded-xl p-6 h-[460px]">
          <div className="flex gap-4 border-b border-border pb-4 mb-6">
            <div className="h-8 w-36 bg-border rounded-lg" />
            <div className="h-8 w-24 bg-border rounded-lg" />
            <div className="h-8 w-32 bg-border rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface-alt/60 border border-border rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
