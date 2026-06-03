'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { User } from "@/types/user"
import { API_ENDPOINTS } from "@/utils/api-endpoints"

interface ApiStore {
  _id?: string
  id?: string
  name?: string
  location?: string
  address?: string
  nodesOnline?: number
}

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
      const res = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      // console.log("res---", res)

      const result = await res.json()

      // console.log("result---", result)

      if (res.ok && result.statusCode === 200) {
        apiUser = result.data.user
        apiToken = result.data.token
        roleSlug = apiUser.role?.slug?.toLowerCase() === "employee_6a1088c624446509847e9dfe" ? "employee" : apiUser.role?.slug?.toLowerCase()
      } else {
        apiErrorMessage = result.message || 'Invalid email or password.'
      }
    } catch (err) {
      console.error('API login error:', err)
      apiErrorMessage = 'Unable to connect to the login server. Please try again later.'
    }

    // Dynamic Login Success
    if (apiUser) {
      // Verify the user's role matches the required role for this page
      if (roleSlug !== requiredRole) {
        return `This account is registered as a ${roleSlug}. Please log in to the correct role page.`
      }

      // Fetch store details if token is available
      let fetchedStores: ApiStore[] = []
      if (apiToken) {
        try {
          const storesRes = await fetch(API_ENDPOINTS.stores.list, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
          })
          if (storesRes.ok) {
            const storesResult = await storesRes.json()
            // console.log("storesResult---", storesResult)
            if (storesResult && Array.isArray(storesResult)) {
              fetchedStores = storesResult
            } else if (storesResult && Array.isArray(storesResult.data)) {
              fetchedStores = storesResult.data
            } else if (storesResult && storesResult.data && Array.isArray(storesResult.data.stores)) {
              fetchedStores = storesResult.data.stores
            }
          } else {
            console.warn("Failed to fetch stores, status:", storesRes.status)
          }
        } catch (storesErr) {
          console.error("Error fetching stores from API:", storesErr)
        }
      }

      const stores = apiUser.storeIds?.map((id: string, index: number) => {
        const apiStore = fetchedStores.find((s) => (s._id || s.id) === id)
        return {
          id,
          name: apiStore?.name || (index === 0 ? 'Main St. Store' : `Branch Store ${index}`),
          location: apiStore?.location || apiStore?.address || (index === 0 ? 'Boise, ID' : 'Branch Loc'),
          nodesOnline: typeof apiStore?.nodesOnline === 'number' ? apiStore.nodesOnline : (3 + index),
        }
      }) || []

      const primaryStore = stores[0] || null
      const storeName = primaryStore?.name || 'Main St. Store'
      const storeLoc = primaryStore?.location || 'Boise, ID'
      const nodesOnline = primaryStore?.nodesOnline ?? 5

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
          storeName,
          storeLoc,
          nodesOnline,
          stores,
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
