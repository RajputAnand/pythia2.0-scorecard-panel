import Header from '@/components/shared/Header/Header'

export default function OwnersLoading() {
  return (
    <>
      <Header title="Owner Management" subtitle="Super Admin Tools" />
      <div className="px-[30px] py-[26px] animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-9 w-64 bg-border rounded-full" />
          <div className="h-9 w-40 bg-border rounded-lg" />
        </div>
        <div className="h-10 w-80 bg-border rounded-lg mb-4" />
        <div className="bg-surface border border-border rounded-xl p-6 h-[400px]">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-border rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

