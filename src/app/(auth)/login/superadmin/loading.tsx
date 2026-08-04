export default function Loading() {
  return (
    <div className="w-full max-w-[420px] animate-pulse">
      <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
        <div className="flex flex-col gap-6">
          {/* Logo & Header skeleton */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-[9px] bg-border" />
            <div className="flex flex-col gap-2">
              <div className="w-16 h-3 rounded bg-border" />
              <div className="w-12 h-2 rounded bg-border" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-48 h-6 rounded bg-border" />
            <div className="w-full h-3 rounded bg-border" />
            <div className="w-5/6 h-3 rounded bg-border" />
          </div>

          <div className="space-y-4 mt-2">
            <div className="w-full h-10 rounded-lg bg-border" />
            <div className="w-full h-10 rounded-lg bg-border" />
          </div>

          <div className="w-full h-11 rounded-lg bg-border mt-2" />
        </div>
      </div>
    </div>
  )
}
