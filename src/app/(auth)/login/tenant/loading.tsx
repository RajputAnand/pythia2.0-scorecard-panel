export default function TenantLoginLoading() {
  return (
    <div className="w-full max-w-[460px] animate-pulse">
      <div className="bg-surface border border-border rounded-2xl shadow-sm px-8 py-9">
        <div className="flex items-center gap-[10px] mb-6">
          <div className="w-8 h-8 rounded-[9px] bg-border" />
          <div className="space-y-1">
            <div className="w-20 h-3.5 bg-border rounded" />
            <div className="w-16 h-2.5 bg-border rounded" />
          </div>
        </div>
        <div className="w-28 h-6 bg-border rounded-full mb-4" />
        <div className="w-48 h-5 bg-border rounded mb-2" />
        <div className="w-full h-3 bg-border rounded mb-6" />
        <div className="h-10 bg-border rounded-lg mb-4" />
        <div className="h-10 bg-border rounded-lg mb-4" />
        <div className="h-10 bg-border rounded-lg mb-6" />
        <div className="h-11 bg-border rounded-lg" />
      </div>
    </div>
  )
}

