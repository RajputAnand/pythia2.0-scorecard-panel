import Header from '@/components/shared/Header/Header'
import SwagStore from '@/components/SwagStore/SwagStore'

export const metadata = {
  title: 'Pythia — Employee Swag Store (Super Admin)',
  description: 'Super Admin static preview of the Employee Swag Store page.',
}

// Static preview of /dashboard/swag for the Super Admin panel — see
// src/app/super-admin/employee/overview/page.tsx for the pattern.
export default function SuperAdminEmployeeSwagPage() {
  return (
    <>
      <Header title="Swag Store" subtitle="Super Admin · Sample data preview" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <SwagStore previewMode />
      </div>
    </>
  )
}
