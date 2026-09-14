'use client'

import { useRef, useState } from 'react'
import { createSubOwner } from '@/queries/organization-owners'
import CredentialsReveal from '@/components/shared/CredentialsReveal/CredentialsReveal'
import { extractApiErrorMessage } from '@/utils/common'
import type { OrganizationOwner } from '@/types/organization-owner'

interface CreateSubOwnerModalProps {
  token: string
  onClose: () => void
  onCreated: (owner: OrganizationOwner) => void
}

export default function CreateSubOwnerModal({ token, onClose, onCreated }: CreateSubOwnerModalProps) {
  const [step, setStep] = useState<'form' | 'credentials'>('form')
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [canManageSubscription, setCanManageSubscription] = useState(false)

  const [tempPassword, setTempPassword] = useState('')
  const [createdUserId, setCreatedUserId] = useState('')

  const createdOwnerRef = useRef<OrganizationOwner | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(undefined)

    if (!firstName.trim()) {
      setServerError('First name is required.')
      return
    }
    if (!lastName.trim()) {
      setServerError('Last name is required.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setServerError('A valid email address is required.')
      return
    }

    setIsPending(true)
    try {
      const res = await createSubOwner({
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        canManageSubscription,
      })

      const newOwner: OrganizationOwner = {
        user_id: res.user_id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        role_name: 'Owner',
        tenant_id: '',
        is_active: true,
        can_manage_subscription: res.can_manage_subscription,
        is_root_owner: false,
        created_by: 'me',
        created_at: new Date().toISOString(),
      }

      createdOwnerRef.current = newOwner
      setTempPassword(res.temp_password)
      setCreatedUserId(res.user_id)
      setStep('credentials')
    } catch (err: unknown) {
      setServerError(extractApiErrorMessage(err, 'Failed to create co-owner.'))
    } finally {
      setIsPending(false)
    }
  }

  function handleDone() {
    if (createdOwnerRef.current) {
      onCreated(createdOwnerRef.current)
    }
    onClose()
  }

  const handleDismiss = () => {
    if (step === 'credentials') {
      handleDone()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs" onClick={handleDismiss}>
      <div
        className="w-full max-w-[460px] bg-surface border border-border rounded-2xl shadow-xl p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-semibold text-primary">Add Co-Owner</h2>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close"
                className="text-muted hover:text-primary cursor-pointer transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[12px] text-muted mb-4">
              Bring on another Owner within your organization. You will receive temporary credentials to share with them securely.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-medium text-secondary mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-secondary mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-secondary mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-secondary mb-1">Phone Number (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-[13px] bg-surface-alt border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Manage Subscription Permission Option */}
              <div className="mt-2 rounded-xl border border-border/80 bg-surface-alt/60 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageSubscription}
                    onChange={(e) => setCanManageSubscription(e.target.checked)}
                    className="mt-0.5 rounded border-border text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[12.5px] font-medium text-primary">
                      Allow this owner to manage subscription
                    </span>
                    <span className="block text-[11px] text-muted leading-relaxed mt-0.5">
                      Grants access to the Stripe Customer Portal to view invoices, update payment methods, and manage subscription settings on behalf of this organization.
                    </span>
                  </div>
                </label>
              </div>

              {serverError && (
                <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-lg text-danger text-[12px]">
                  {serverError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-3.5 py-2 text-[12.5px] font-medium text-secondary hover:text-primary rounded-lg border border-border hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-[12.5px] font-medium text-white bg-accent hover:opacity-90 rounded-lg transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Owner'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <CredentialsReveal
            heading="Login credentials"
            message="Share this with the co-owner securely — the password can only be viewed again until they change it."
            userId={createdUserId}
            password={tempPassword}
            actionLabel="Done"
            onAction={handleDone}
          />
        )}
      </div>
    </div>
  )
}
