'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { User } from "@/types/user"
import { pythia2Client } from "@/lib/api-client"
import { PYTHIA_2_API } from "@/utils/api-endpoints"
import { extractApiErrorMessage } from "@/utils/common"
import { DEMO_USERS } from "@/lib/demo-user"
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

    // superadmin has no backend account — it's a local demo-only role, so it
    // never hits the real /auth/login endpoint. Every other role continues
    // below and is validated against the real backend as usual.
    if (requiredRole === 'superadmin') {
      const demo = DEMO_USERS.find(
        (u) => u.role === 'superadmin' && u.email === identifier && u.password === password
      )
      if (!demo) return 'Invalid email or password.'

      await signIn('credentials', {
        email: identifier,
        password,
        userData: JSON.stringify({
          id: demo.email,
          email: demo.email,
          name: demo.name,
          role: demo.role,
          initials: demo.initials,
          score: demo.score,
          jobTitle: demo.jobTitle,
          points: 0,
        }),
        redirect: false,
      })
      return null
    }

    let result: LoginResponse
    try {
      const { data } = await pythia2Client.post<LoginResponse>(PYTHIA_2_API.auth.login, {
        userid_email_or_mobile: identifier,
        password,
        role: requiredRole,
      })
      result = data
    } catch (err) {
      return extractApiErrorMessage(err, 'Unable to connect to the login server. Please try again later.')
    }

    if (!result.success) {
      return 'Invalid email or password.'
    }

    const apiUser = result.user
    const roleSlug = apiUser.role_name.toLowerCase()
    const firstName = apiUser.first_name || ''
    const lastName = apiUser.last_name || ''

    await signIn('credentials', {
      email: identifier,
      password,
      userData: JSON.stringify({
        id: apiUser.user_id,
        email: apiUser.email,
        name: `${firstName} ${lastName}`.trim() || apiUser.email,
        role: roleSlug,
        token: result.access_token,
        pythia2Token: result.access_token,
        refreshToken: result.refresh_token,
        initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'UR',
        score: roleSlug === 'employee' ? 0 : undefined,
        jobTitle: apiUser.role_name,
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
    const { data } = await pythia2Client.post(PYTHIA_2_API.auth.forgotPassword, { identifier: email })
    return { success: data.success, message: data.message || 'If an account exists, a password reset email has been sent.' }
  } catch (err) {
    return { success: false, message: extractApiErrorMessage(err, 'Unable to connect to the server. Please try again later.') }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  try {
    const { data } = await pythia2Client.post(PYTHIA_2_API.auth.resetPassword, { token, new_password: newPassword })

    if (data.success) {
      return { success: true, message: data.message || 'Password reset successfully.' }
    }
    return { success: false, message: data.message || 'Invalid or expired reset token.' }
  } catch (err) {
    return { success: false, message: extractApiErrorMessage(err, 'Unable to connect to the server. Please try again later.') }
  }
}
