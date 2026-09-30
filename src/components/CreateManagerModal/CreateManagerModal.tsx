'use client'

import CreateUserModal, { type StoreOption } from '@/components/CreateUserModal/CreateUserModal'
import type { ApiManager } from '@/types/manager'

export type { StoreOption }

interface CreateManagerModalProps {
  token: string
  onClose: () => void
  onCreated: (manager: ApiManager) => void
  stores?: StoreOption[]
  tenantId?: string
}

export default function CreateManagerModal({ token, onClose, onCreated, stores, tenantId }: CreateManagerModalProps) {
  return (
    <CreateUserModal
      token={token}
      stores={stores}
      tenantId={tenantId}
      initialRole="manager"
      allowedRoles={['manager']}
      onClose={onClose}
      onManagerCreated={onCreated}
    />
  )
}
