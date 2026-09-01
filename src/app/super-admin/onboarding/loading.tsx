import Header from '@/components/shared/Header/Header'

export default function OnboardingLoading() {
  return (
    <>
      <Header title="Customer Onboarding" subtitle="Super Admin Tools" />
      <div className="px-[30px] py-[26px] animate-pulse">
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <div className="h-5 w-60 bg-border rounded mb-2" />
          <div className="h-3.5 w-96 bg-border rounded" />
        </div>
        <div className="grid grid-cols-6 gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-border rounded-lg" />
          ))}
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 h-[400px]">
          <div className="h-6 w-48 bg-border rounded mb-4" />
          <div className="space-y-4">
            <div className="h-10 bg-border rounded" />
            <div className="h-10 bg-border rounded" />
            <div className="h-10 bg-border rounded" />
          </div>
        </div>
      </div>
    </>
  )
}

