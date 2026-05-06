'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import ErrorModal from '@/components/shared/Modals/Error'

export default function ResetPasswordError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Something went wrong. Please try again later.'
  const keyParam = searchParams.get('key') || ''

  return (
    <ErrorModal
      heading='Reset failed'
      action={() => router.replace(`/reset-password${keyParam ? `?key=${keyParam}` : ''}`)}
      actionLabel='← Try again'
      message={message}
    />
  )
}
