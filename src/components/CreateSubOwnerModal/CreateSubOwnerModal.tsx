'use client'

import CreateUserModal from '@/components/CreateUserModal/CreateUserModal'
import type { OrganizationOwner } from '@/types/organization-owner'

interface CreateSubOwnerModalProps {
  token: string
  canManageSubscriptionAllowed?: boolean
  onClose: () => void
  onCreated: (owner: OrganizationOwner) => void
}

export default function CreateSubOwnerModal({
  token,
  canManageSubscriptionAllowed = true,
  onClose,
  onCreated,
}: CreateSubOwnerModalProps) {
  return (
    <CreateUserModal
      token={token}
      canManageSubscriptionAllowed={canManageSubscriptionAllowed}
      initialRole="owner"
      allowedRoles={['owner']}
      onClose={onClose}
      onOwnerCreated={onCreated}
    />
  )
}
