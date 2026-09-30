import { redirect } from 'next/navigation'

export default function OwnerManagersPage() {
  redirect('/owner/users?role=manager')
}
