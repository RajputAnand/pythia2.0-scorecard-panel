'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { User } from "@/types/user"
import { pythia1Client } from "@/lib/api-client"
import { PYTHIA_2_API } from "@/utils/api-endpoints"
import { extractApiErrorMessage } from "@/utils/common"
import type { ForgotPasswordResult, ResetPasswordResult, LoginResponse } from "@/types/auth"

// Returns null on success, error string on failure.
// Using redirect: false so the session cookie is fully set before the client navigates.
// Role is required and is validated server-side against the account's actual role —
// on mismatch the API returns a 401 with a message naming the correct login tab to use.
export async function login(_prev: string | null | undefined, formData: FormData): Promise<string | null> {
  try {
    const identifier = formData.get('email') as string
    const password = formData.get('password') as string
    const requiredRole = formData.get('role') as string

    if (!requiredRole) {
      return 'Invalid role.'
    }

    let result: LoginResponse
    try {
      const payload = {
        email: identifier,
        password,
        role: requiredRole,
      }
      const { data } = await pythia1Client.post<LoginResponse>(PYTHIA_2_API.auth.login, payload)
      result = data
    } catch (err: any) {
      return extractApiErrorMessage(err, 'Unable to connect to the login server. Please try again later.')
    }

    // @ts-ignore
    if (result.statusCode !== 200) {
      return 'Invalid email or password.'
    }

    // @ts-ignore
    const apiUser = result.data.user
    // @ts-ignore
    const token = result.data.token
    
    const roleSlug = apiUser.role?.slug?.toLowerCase() || ''
    const firstName = apiUser.firstName || ''
    const lastName = apiUser.lastName || ''
    const userId = apiUser._id
    const jobTitle = apiUser.role?.name || roleSlug

    await signIn('credentials', {
      email: identifier,
      password,
      userData: JSON.stringify({
        id: userId,
        email: apiUser.email,
        name: `${firstName} ${lastName}`.trim() || apiUser.email,
        role: roleSlug,
        token: token,
        pythia2Token: token,
        refreshToken: token, // New API doesn't provide a refresh token, using token
        initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'UR',
        score: roleSlug === 'employee' ? 0 : undefined,
        jobTitle: jobTitle,
        points: apiUser.points ?? 0,
      }),
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
  } else if (user.role === 'superadmin') {
    loginPage = '/login/superadmin'
  }
  await signOut({ redirectTo: loginPage })
}

// Always returns success (anti-enumeration by design) unless the request itself fails.
export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  try {
    const { data } = await pythia1Client.post(PYTHIA_2_API.auth.forgotPassword, { identifier: email })
    return { success: data.success, message: data.message || 'If an account exists, a password reset email has been sent.' }
  } catch (err) {
    return { success: false, message: extractApiErrorMessage(err, 'Unable to connect to the server. Please try again later.') }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  try {
    const { data } = await pythia1Client.post(PYTHIA_2_API.auth.resetPassword, { token, new_password: newPassword })

    if (data.success) {
      return { success: true, message: data.message || 'Password reset successfully.' }
    }
    return { success: false, message: data.message || 'Invalid or expired reset token.' }
  } catch (err) {
    return { success: false, message: extractApiErrorMessage(err, 'Unable to connect to the server. Please try again later.') }
  }
}
