import Header from '@/components/shared/Header/Header'
import SwagStore from '@/components/SwagStore/SwagStore'

export const metadata = {
  title: 'Pythia — Swag Store (Super Admin Employee View)',
  description: 'Super Admin Employee View mirror of the Swag Store.',
}

export default function SuperAdminEmployeeSwagPage() {
  return (
    <>
      <Header title="Swag Store" subtitle="Super Admin · Employee View Mirror" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <SwagStore />
      </div>
    </>
  )
}

