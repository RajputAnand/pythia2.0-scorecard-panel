import Header from '@/components/shared/Header/Header'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import { PREVIEW_PROGRESS_DATA } from '@/lib/kpi-preview-data'

export const metadata = {
  title: 'Pythia — Employee Progress (Super Admin)',
  description: 'Super Admin static preview of the Employee Progress page.',
}

// Static preview of /dashboard/progress for the Super Admin panel — see
// src/app/super-admin/employee/overview/page.tsx for the pattern.
export default function SuperAdminEmployeeProgressPage() {
  return (
    <>
      <Header title="My Progress" subtitle="Super Admin · Sample data preview" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <ProgressChart data={PREVIEW_PROGRESS_DATA} previewMode />
      </div>
    </>
  )
}
