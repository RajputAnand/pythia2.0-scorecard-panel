'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import ErrorModal from '@/components/shared/Modals/Error'

export default function ForgotPasswordError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Something went wrong. Please try again later.'

  return (
    <ErrorModal
      heading='Unable to send email'
      action={() => router.replace('/forgot-password')}
      actionLabel='← Try again'
      message={message}
    />
  )
}
