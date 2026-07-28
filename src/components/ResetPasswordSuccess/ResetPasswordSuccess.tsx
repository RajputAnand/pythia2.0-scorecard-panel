'use client'

import { useRouter } from 'next/navigation'
import SuccessPage from '@/components/shared/Modals/Success'

export default function ResetPasswordSuccess() {
  const router = useRouter()

  return (
    <SuccessPage
      heading='Password reset!'
      message='You can now login with your new password'
      actionLabel='← Sign in with your new password'
      action={() => router.replace('/login/employee')} />
  )
}
