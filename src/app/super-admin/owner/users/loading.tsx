import Header from '@/components/shared/Header/Header'

export default function SuperAdminOwnerUsersLoading() {
  return (
    <>
      <Header title="Users (Mirror)" subtitle="Owner View" />
      <div className="px-[30px] py-[26px]">
        <div className="flex flex-col gap-4">
          <div className="h-14 bg-surface border border-border rounded-xl animate-pulse" />
          <div className="h-10 w-64 bg-surface border border-border rounded-lg animate-pulse" />
          <div className="rounded-[10px] border border-border bg-surface overflow-hidden animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[52px] border-b border-border last:border-b-0 bg-surface-alt/40" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

