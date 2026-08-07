import Header from '@/components/shared/Header/Header'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import { PREVIEW_COACHING_MOMENTS } from '@/lib/kpi-preview-data'

export const metadata = {
  title: 'Pythia — Employee Coaching (Super Admin)',
  description: 'Super Admin static preview of the Employee Coaching page.',
}

// Static preview of /dashboard/coaching for the Super Admin panel — see
// src/app/super-admin/employee/overview/page.tsx for the pattern.
export default function SuperAdminEmployeeCoachingPage() {
  return (
    <>
      <Header title="Coaching" subtitle="Super Admin · Sample data preview" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <CoachingMoments items={PREVIEW_COACHING_MOMENTS} previewMode />
      </div>
    </>
  )
}
