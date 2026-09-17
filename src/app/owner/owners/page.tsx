import { redirect } from 'next/navigation'

export default function OwnerOwnersPage() {
  redirect('/owner/users?role=owner')
}
