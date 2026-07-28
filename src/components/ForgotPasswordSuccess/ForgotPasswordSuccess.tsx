'use client'

import { useRouter } from 'next/navigation'
import SuccessPage from '@/components/shared/Modals/Success'

export default function ForgotPasswordSuccess() {
  const router = useRouter()

  return (
    <SuccessPage
      heading='Check your email'
      message='Password reset link has been sent to your email.'
      actionLabel='← Back to login'
      action={() => router.replace('/login/employee')} />
  )
}
