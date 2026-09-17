import { redirect } from 'next/navigation'

export default function OwnerEmployeesPage() {
  redirect('/owner/users?role=employee')
}
