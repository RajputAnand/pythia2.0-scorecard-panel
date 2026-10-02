import Header from '@/components/shared/Header/Header'
import KpiVisibilityPanel from '@/components/KpiVisibilityPanel/KpiVisibilityPanel'

export default function KpiVisibilityPage() {
  return (
    <>
      <Header title="KPI Visibility" subtitle="Super Admin" />

      <div className="grid p-5 gap-5">
        <KpiVisibilityPanel />
      </div>
    </>
  )
}
