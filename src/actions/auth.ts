'use server'

import { signIn, signOut, auth } from "@/auth"
import { AuthError } from "next-auth"
import { DEMO_USERS } from "@/lib/demo-user"
import { User } from "@/types/user"

// Returns null on success, error string on failure.
// Using redirect: false so the session cookie is fully set before the client navigates.
// Role is required and must match the user's role.
export async function login(_prev: string | null | undefined, formData: FormData): Promise<string | null> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const requiredRole = formData.get('role') as string

    // Validate that role parameter is provided
    if (!requiredRole) {
      return 'Invalid role.'
    }

    // Find the user to verify role matches
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password)
    if (!user) {
      return 'Invalid email or password.'
    }

    // Verify the user's role matches the required role for this page
    if (user.role !== requiredRole) {
      return `This account is registered as a ${user.role}. Please log in to the correct role page.`
    }

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    return null
  } catch (error) {
    if (error instanceof AuthError) {
      return 'Invalid email or password.'
    }
    throw error
  }
}

export async function logout(user: User) {
  let loginPage = '/login/employee'
  if (user.role === 'owner') {
    loginPage = '/login/owner'
  } else if (user.role === 'manager') {
    loginPage = '/login/manager'
  }
  await signOut({ redirectTo: loginPage })
}
