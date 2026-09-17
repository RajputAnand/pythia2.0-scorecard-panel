import { redirect } from 'next/navigation'

export default async function SuperadminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams
  redirect(redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login')
}
