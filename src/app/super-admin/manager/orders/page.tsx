import Header from '@/components/shared/Header/Header'
import ManagerOrdersPanel from '@/components/ManagerOrdersPanel/ManagerOrdersPanel'

export const metadata = {
  title: 'Pythia — Orders (Manager Mirror)',
  description: 'Read-only mirror of manager order fulfillment for Super Admin.',
}

export default function SuperAdminManagerOrdersMirrorPage() {
  return (
    <>
      <Header title="Order Management (Mirror)" subtitle="Manager View" />
      <div className="px-[30px] py-[26px]">
        <ManagerOrdersPanel readOnly={false} />
      </div>
    </>
  )
}
