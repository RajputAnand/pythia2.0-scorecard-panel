import Header from '@/components/shared/Header/Header'
import OwnerSwagStore from '@/components/OwnerSwagStore/OwnerSwagStore'

export const metadata = {
  title: 'Pythia 2.0 — Swag Store (Manager Mirror)',
  description: 'Read-only mirror of manager swag store management for Super Admin.',
}

export default function SuperAdminManagerSwagStorePage() {
  return (
    <>
      <Header title="Swag Store Management (Mirror)" subtitle="Manager View" />
      <div className="px-[30px] py-[26px]">
        <OwnerSwagStore actorTitle="Store Manager" />
      </div>
    </>
  )
}

