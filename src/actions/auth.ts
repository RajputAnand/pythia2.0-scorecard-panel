'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import axios from "axios"
import { User } from "@/types/user"
import { pythia1Client, pythia2Client } from "@/lib/api-client"
import { PYTHIA_1_API, PYTHIA_2_API } from "@/utils/api-endpoints"
import type { ForgotPasswordResult, ResetPasswordResult } from "@/types/auth"

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

    // const isDemoEmail = DEMO_USERS.some((u) => u.email === email)
    let apiUser = null
    let roleSlug = ''
    let apiErrorMessage = ''
    let apiToken = ''

    try {
      const { data: result } = await pythia1Client.post(PYTHIA_1_API.auth.login, { email, password })

      if (result.statusCode === 200) {
        apiUser = result.data.user
        apiToken = result.data.token
        roleSlug = apiUser.role?.slug?.toLowerCase() === "employee_6a1088c624446509847e9dfe" ? "employee" : apiUser.role?.slug?.toLowerCase()
      } else {
        apiErrorMessage = result.message || 'Invalid email or password.'
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        apiErrorMessage = err.response.data.message
      } else {
        console.error('API login error:', err)
        apiErrorMessage = 'Unable to connect to the login server. Please try again later.'
      }
    }

    // Dynamic Login Success
    if (apiUser) {
      if (roleSlug !== requiredRole) {
        return `This account is registered as a ${roleSlug}. Please log in to the correct role page.`
      }

      await signIn('credentials', {
        email,
        password,
        userData: JSON.stringify({
          id: apiUser._id || apiUser.email,
          email: apiUser.email,
          name: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.email,
          role: roleSlug,
          token: apiToken,
          initials: `${apiUser.firstName?.[0] || ''}${apiUser.lastName?.[0] || ''}`.toUpperCase() || 'UR',
          score: roleSlug === 'employee' ? 85 : undefined,
          jobTitle: apiUser.role?.name || 'User',
        }),
        redirect: false,
      })
      return null
    }

    // // Fallback to DEMO_USERS if dynamic login didn't succeed but it is a demo account
    // if (isDemoEmail) {
    //   const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)
    //   if (!demoUser) {
    //     return 'Invalid email or password.'
    //   }

    //   // Verify the demo user's role matches the required role for this page
    //   if (demoUser.role !== requiredRole) {
    //     return `This account is registered as a ${demoUser.role}. Please log in to the correct role page.`
    //   }

    //   await signIn('credentials', {
    //     email,
    //     password,
    //     redirect: false,
    //   })
    //   return null
    // }

    // Real user login failed
    return apiErrorMessage || 'Invalid email or password.'
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

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  try {
    const { data } = await pythia1Client.post(PYTHIA_1_API.auth.forgotPassword, { email })

    if (data.statusCode === 200 || data.statusCode === 201) {
      return { success: true, message: data.message || 'Reset link sent to your email' }
    }
    return { success: false, message: data.message || 'User not found!' }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return { success: false, message: err.response.data.message }
    }
    console.error('API forgot-password error:', err)
    return { success: false, message: 'Unable to connect to the server. Please try again later.' }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  try {
    const url = `${PYTHIA_1_API.auth.resetPassword}/${encodeURIComponent(token)}`
    const { data } = await pythia1Client.put(url, { newPassword }, { params: { token } })

    if (data.statusCode === 200 || data.statusCode === 201) {
      return { success: true, message: data.message || 'Password reset successfully.' }
    }
    return { success: false, message: data.message || 'User not found!' }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return { success: false, message: err.response.data.message }
    }
    console.error('API reset-password error:', err)
    return { success: false, message: 'Unable to connect to the server. Please try again later.' }
  }
}
