'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { User } from "@/types/user"
import { pythia1Client } from "@/lib/api-client"
import { PYTHIA_2_API } from "@/utils/api-endpoints"
import { extractApiErrorMessage } from "@/utils/common"
import type { ForgotPasswordResult, ResetPasswordResult, LoginResponse, P1LoginResponse, P1ProfileResponse } from "@/types/auth"

// Manager auth is fully on Pythia 1.0: no Pythia 2.0 JWT is ever issued or
// accepted for this role (see PYTHIA1_AUTH_HANDOFF.md and dependencies_p1.py's
// get_current_p1_user, which is the only auth path manager-facing backend
// routes accept). Pythia 1.0's own POST /auth/login only returns a bearer
// token — no profile data — so a second GET /profile/ call is required to get
// the user's name/role/points, mirroring app/services/pythia1_client.py's
// login_p1() + get_profile_p1() on the backend.
async function loginManagerViaP1(identifier: string, password: string): Promise<string | null> {
  let loginData: P1LoginResponse
  try {
    const { data } = await pythia1Client.post<P1LoginResponse>(PYTHIA_2_API.auth.login, {
      email: identifier,
      password,
    })
    loginData = data
  } catch (err) {
    return extractApiErrorMessage(err, 'Unable to connect to the login server. Please try again later.')
  }

  const token = loginData.token || loginData.accessToken || loginData.data?.token || loginData.data?.accessToken
  if (!token) {
    return 'Invalid email or password.'
  }

  let profile: P1ProfileResponse['data']
  try {
    const { data } = await pythia1Client.get<P1ProfileResponse>(PYTHIA_2_API.auth.p1Profile, {
      headers: { Authorization: `Bearer ${token}` },
    })
    profile = data.data
  } catch (err) {
    return extractApiErrorMessage(err, 'Unable to verify manager account. Please try again later.')
  }

  const roleSlug = profile.role?.slug?.toLowerCase() || ''
  if (roleSlug !== 'manager') {
    const actualRole = profile.role?.name || roleSlug || 'a different role'
    return `This account is registered as '${actualRole}'. Please switch to the '${actualRole}' login.`
  }

  const firstName = profile.firstName || ''
  const lastName = profile.lastName || ''

  try {
    await signIn('credentials', {
      email: identifier,
      password,
      userData: JSON.stringify({
        id: profile._id,
        email: profile.email,
        name: `${firstName} ${lastName}`.trim() || profile.email,
        role: roleSlug,
        token,
        pythia2Token: token,
        // Pythia 1.0 has no refresh-token concept of its own; api-client.ts's
        // response interceptor skips the P2 refresh attempt entirely for
        // manager sessions on a 401, so this value is never actually sent.
        refreshToken: token,
        initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'UR',
        jobTitle: profile.role?.name || roleSlug,
        points: profile.points ?? 0,
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

    // Manager is fully migrated to Pythia 1.0 auth — see loginManagerViaP1's
    // docstring. Every other role's login is unchanged for now.
    if (requiredRole === 'manager') {
      return loginManagerViaP1(identifier, password)
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
