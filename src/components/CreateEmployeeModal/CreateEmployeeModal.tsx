'use client'

import CreateUserModal from '@/components/CreateUserModal/CreateUserModal'
import type { ApiEmployee } from '@/types/employee'

interface CreateEmployeeModalProps {
  token: string
  onClose: () => void
  onCreated: (employee: ApiEmployee) => void
  storeId?: string
}

export default function CreateEmployeeModal({ token, onClose, onCreated, storeId }: CreateEmployeeModalProps) {
  return (
    <CreateUserModal
      token={token}
      storeId={storeId}
      initialRole="employee"
      allowedRoles={['employee']}
      onClose={onClose}
      onEmployeeCreated={onCreated}
    />
  )
}
