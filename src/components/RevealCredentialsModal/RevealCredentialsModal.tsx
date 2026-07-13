'use client'

import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'

interface RevealCredentialsModalProps {
  employeeName: string
  password: string
  onClose: () => void
}

export default function RevealCredentialsModal({ employeeName, password, onClose }: RevealCredentialsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[400px] bg-surface border border-border rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <CredentialsReveal
          heading="Temporary password"
          message={`Share this with ${employeeName} securely — it can only be viewed again until they change it.`}
          password={password}
          actionLabel="Close"
          onAction={onClose}
        />
      </div>
    </div>
  )
}
