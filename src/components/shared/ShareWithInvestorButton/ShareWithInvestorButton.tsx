'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import headerStyles from '@/components/shared/Header/Header.module.css'
import DynamicForm from '@/components/shared/DynamicForm/DynamicForm'
import { useToast } from '@/context/ToastContext'
import { generateSectionedPdf } from '@/utils/pdf-export'
import { shareRoiAttributionPdf } from '@/queries/owner-roi'
import { extractApiErrorMessage } from '@/utils/common'
import { shareWithInvestorSchema, type ShareWithInvestorSchema } from '@/schemas/investor-share'
import type { FormField } from '@/types/dynamic-form'

const FIELDS: FormField[] = [
  { id: 'email', type: 'email', label: 'Investor email', placeholder: 'investor@fund.com' },
  { id: 'note', type: 'text', label: 'Note (optional)', placeholder: 'Add a short message…' },
]

interface ShareWithInvestorButtonProps {
  /** DOM id of the element to capture — must wrap the content to share. */
  targetId: string
  /** File name (without extension) for the generated PDF attachment. */
  fileName: string
  className?: string
}

export default function ShareWithInvestorButton({
  targetId,
  fileName,
  className = headerStyles.btnPrimary,
}: ShareWithInvestorButtonProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()
  const { showToast } = useToast()

  const handleClose = () => {
    if (isPending) return
    setOpen(false)
    setServerError(undefined)
  }

  const handleSubmit = async (values: ShareWithInvestorSchema) => {
    const token = session?.user?.pythia2Token
    if (!token) {
      setServerError('Your session has expired. Please sign in again.')
      return
    }

    setServerError(undefined)
    setIsPending(true)
    try {
      const blob = await generateSectionedPdf(targetId)
      const pdfFile = new File([blob], `${fileName}.pdf`, { type: 'application/pdf' })
      const result = await shareRoiAttributionPdf({
        token,
        toEmail: values.email,
        note: values.note || undefined,
        senderName: session?.user?.name || undefined,
        pdfFile,
      })
      showToast(result.message || `Report emailed to ${values.email}.`)
      setOpen(false)
    } catch (err) {
      setServerError(extractApiErrorMessage(err, 'Failed to share report. Please try again.'))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        Share with Investor
      </button>

      {open &&
        createPortal(
          // Rendered into document.body (not inline where the button sits)
          // so this fixed-position overlay competes for stacking in the root
          // context — nested inside Header's `sticky` (its own stacking
          // context), a z-50 here would still lose to the Sidebar's z-20,
          // since that comparison never happens outside Header's context.
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[440px] bg-surface border border-border rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[16px] font-semibold text-primary">Share with Investor</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close"
                  className="text-muted hover:text-primary cursor-pointer"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="text-[12.5px] text-muted mb-4">
                They&apos;ll get a PDF snapshot of this exact report by email — no login required.
              </p>

              <DynamicForm
                fields={FIELDS}
                zodSchema={shareWithInvestorSchema}
                onSubmit={handleSubmit}
                submitLabel="Send Report"
                loading={isPending}
                serverError={serverError}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
