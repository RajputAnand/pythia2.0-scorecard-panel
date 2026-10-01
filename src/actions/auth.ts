'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { User, type UserRole } from "@/types/user"
import { pythia1Client, pythia2Client } from "@/lib/api-client"
import { PYTHIA_2_API } from "@/utils/api-endpoints"
import { extractApiErrorMessage } from "@/utils/common"
import type { ForgotPasswordResult, ResetPasswordResult, LoginResponse, P1LoginResponse, P1ProfileResponse } from "@/types/auth"
import { DEMO_USERS, isDemoModeEnabled } from '@/lib/demo-user'

// Manager and Owner auth are normally fully on Pythia 1.0: no Pythia 2.0 JWT is ever
// issued or accepted for these roles (see PYTHIA1_AUTH_HANDOFF.md and dependencies_p1.py's
// get_current_p1_user, which is the only auth path manager/owner-facing backend
// routes accept). Pythia 1.0's own POST /auth/login only returns a bearer
// token — no profile data — so a second GET /profile/ call is required to get
// the user's name/role/points, mirroring app/services/pythia1_client.py's
// login_p1() + get_profile_p1() on the backend.
// TEMPORARILY UNUSED — see the commented-out call site in login() below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function loginViaP1(identifier: string, password: string, expectedRole: string): Promise<string | null> {
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
    return extractApiErrorMessage(err, 'Unable to verify account. Please try again later.')
  }

  const roleSlug = profile.role?.slug?.toLowerCase() || ''
  if (roleSlug !== expectedRole) {
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
        // P1 sessions on a 401, so this value is never actually sent.
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

export interface LoginActionResult {
  success: boolean
  role?: UserRole
  first_login?: boolean
  error?: string
}

// Returns { success: true, role } on success, or { success: false, error } on failure.
// Using redirect: false so the session cookie is fully set before the client navigates.
// Single login for all roles: role is determined from the login response.
export async function login(_prev: string | null | undefined | unknown, formData: FormData): Promise<LoginActionResult> {
  try {
    const identifier = formData.get('email') as string
    const password = formData.get('password') as string
    const requestedRole = (formData.get('role') as string) || undefined

    if (!identifier || !password) {
      return { success: false, error: 'Email/User ID and password are required.' }
    }

    const demoUser = DEMO_USERS.find((user) => user.email.toLowerCase() === identifier.toLowerCase() && user.password === password)
    if (demoUser) {
      if (requestedRole && requestedRole !== demoUser.role) {
        return { success: false, error: `This account is registered as '${demoUser.role}'. Please switch to the '${demoUser.role}' login.` }
      }

      const { password: _password, ...demoProfile } = demoUser
      const demoToken = isDemoModeEnabled() ? `demo-mock-${demoUser.role}` : `demo-frontend-${demoUser.role}`
      await signIn('credentials', {
        email: demoUser.email,
        password,
        userData: JSON.stringify({
          ...demoProfile,
          token: demoToken,
          pythia2Token: demoToken,
          store_ids: demoUser.storeIds,
          isDemo: true,
          can_manage_subscription: demoUser.role === 'owner',
          is_root_owner: demoUser.role === 'owner',
        }),
        redirect: false,
      })
      return { success: true, role: demoUser.role }
    }

    let result: LoginResponse
    try {
      const payload: { userid_email_or_mobile: string; password: string; role?: string } = {
        userid_email_or_mobile: identifier,
        password,
      }
      if (requestedRole) {
        payload.role = requestedRole
      }
      const { data } = await pythia2Client.post<LoginResponse>(PYTHIA_2_API.auth.login, payload)
      result = data
    } catch (err: any) {
      return { success: false, error: extractApiErrorMessage(err, 'Unable to connect to the login server. Please try again later.') }
    }

    if (!result.success) {
      return { success: false, error: 'Invalid email, user ID, or password.' }
    }

    const apiUser = result.user
    const token = result.access_token

    const rawRole = (apiUser.role_name || '').toLowerCase().replace(/[\s_]+/g, '')
    const roleSlug = (rawRole === 'superadmin' ? 'superadmin' : (apiUser.role_name?.toLowerCase() || '')) as UserRole
    const firstName = apiUser.first_name || ''
    const lastName = apiUser.last_name || ''
    const userId = apiUser.user_id
    const jobTitle = apiUser.role_name || roleSlug
    const isFirstLogin = Boolean(result.first_login ?? apiUser.first_login ?? false)

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
        refreshToken: result.refresh_token,
        initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'UR',
        score: roleSlug === 'employee' ? 0 : undefined,
        jobTitle: jobTitle,
        points: apiUser.points ?? 0,
        tenantId: apiUser.tenant_id,
        store_ids: apiUser.store_ids ?? [],
        storeIds: apiUser.store_ids ?? [],
        can_manage_subscription: apiUser.can_manage_subscription ?? false,
        is_root_owner: apiUser.is_root_owner ?? false,
        first_login: isFirstLogin,
      }),
      redirect: false,
    })
    return { success: true, role: roleSlug, first_login: isFirstLogin }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid email, user ID, or password.' }
    }
    throw error
  }
}

export async function logout(_user?: User) {
  await signOut({ redirectTo: '/login' })
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
