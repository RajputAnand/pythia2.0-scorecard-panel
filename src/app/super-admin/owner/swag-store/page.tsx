import Header from '@/components/shared/Header/Header'
import OwnerSwagStore from '@/components/OwnerSwagStore/OwnerSwagStore'

export const metadata = {
  title: 'Pythia 2.0 — Swag Store (Owner Mirror)',
  description: 'Read-only mirror of owner swag store management for Super Admin.',
}

export default function SuperAdminOwnerSwagStoreMirrorPage() {
  return (
    <>
      <Header title="Swag Store Management (Mirror)" subtitle="Owner View" />
      <div className="px-[30px] py-[26px]">
        <OwnerSwagStore readOnly={false} />
      </div>
    </>
  )
}
