import Header from '@/components/shared/Header/Header'
import OwnerSwagStore from '@/components/OwnerSwagStore/OwnerSwagStore'

export const metadata = {
  title: 'Pythia 2.0 — Swag Store Management',
  description: 'Manage rewards, points pricing, inventory stock, and employee redemptions.',
}

export default function OwnerSwagStorePage() {
  return (
    <>
      <Header title="Swag Store Management" subtitle="Owner Tools" />
      <div className="px-[30px] py-[26px]">
        <OwnerSwagStore />
      </div>
    </>
  )
}
