'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

// Returns null on success, error string on failure.
// Using redirect: false so the session cookie is fully set before the client navigates.
export async function login(_prev: string | null | undefined, formData: FormData): Promise<string | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
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

export async function logout() {
  await signOut({ redirectTo: '/login' })
}
