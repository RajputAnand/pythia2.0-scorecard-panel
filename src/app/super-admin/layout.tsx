import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar/Sidebar'
import type { User } from '@/types/user'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const user = session.user as unknown as User

  return (
    <>
      <Sidebar user={user} />
      <div className="grow grid ml-[210px]">{children}</div>
    </>
  )
}
