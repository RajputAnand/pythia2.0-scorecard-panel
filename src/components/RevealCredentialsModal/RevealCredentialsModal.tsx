'use client'

import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'

interface RevealCredentialsModalProps {
  employeeName: string
  userId: string
  password: string
  onClose: () => void
}

export default function RevealCredentialsModal({ employeeName, userId, password, onClose }: RevealCredentialsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[400px] bg-surface border border-border rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <CredentialsReveal
          heading="Login credentials"
          message={`Share this with ${employeeName} securely — the password can only be viewed again until they change it.`}
          userId={userId}
          password={password}
          actionLabel="Close"
          onAction={onClose}
        />
      </div>
    </div>
  )
}
