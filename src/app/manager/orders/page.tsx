import Header from '@/components/shared/Header/Header'
import ManagerOrdersPanel from '@/components/ManagerOrdersPanel/ManagerOrdersPanel'

export const metadata = {
  title: 'Pythia — Order Management',
  description: 'Manage and fulfill employee reward claims and swag orders.',
}

export default function ManagerOrdersPage() {
  return (
    <>
      <Header title="Order Management" subtitle="Manager Tools" />
      <div className="p-5">
        <ManagerOrdersPanel />
      </div>
    </>
  )
}
