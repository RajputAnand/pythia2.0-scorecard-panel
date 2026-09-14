import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import OwnerManagementPanel from '@/components/OwnerManagementPanel/OwnerManagementPanel'
import { auth } from '@/auth'
import { fetchOrganizationOwners } from '@/queries/organization-owners'
import type { OrganizationOwner } from '@/types/organization-owner'

export const metadata = {
  title: 'Pythia 2.0 — Owner Management',
  description: 'Manage organization co-owners, credentials, and subscription management permissions.',
}

export default async function OwnerManagementPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token || session?.user?.token

  let initialOwners: OrganizationOwner[] = []
  if (token) {
    try {
      const res = await fetchOrganizationOwners({ token })
      if (res?.data) {
        initialOwners = res.data
      }
    } catch (err) {
      unstable_rethrow(err)
      console.warn('Failed to load initial organization owners:', err)
    }
  }

  return (
    <>
      <Header title="Owner Management" subtitle="Co-owners and permissions" />
      <div className="px-[30px] py-[26px]">
        <OwnerManagementPanel initialData={initialOwners} />
      </div>
    </>
  )
}

