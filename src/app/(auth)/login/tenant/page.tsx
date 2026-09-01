import { Suspense } from 'react'
import TenantLoginForm from '@/components/TenantLoginForm/TenantLoginForm'

export const metadata = {
  title: 'Pythia 2.0 — Organization Login',
  description: 'Sign in to your organization tenant workspace.',
}

export default function TenantLoginPage() {
  return (
    <Suspense fallback={<div className="text-secondary text-[13px]">Loading login form...</div>}>
      <TenantLoginForm />
    </Suspense>
  )
}

