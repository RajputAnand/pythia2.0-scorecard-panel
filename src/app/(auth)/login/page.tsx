import { Suspense } from 'react'
import LoginForm from '@/components/LoginForm/LoginForm'
import Loading from './loading'

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  )
}

