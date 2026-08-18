/** Result from the forgot-password API (send reset email). */
export interface ForgotPasswordResult {
  success: boolean
  message: string
}

/** Result from the validate-key API (check if reset key is valid). */
export interface ValidateKeyResult {
  valid: boolean
  message: string
}

/** Result from the reset-password API (set new password). */
export interface ResetPasswordResult {
  success: boolean
  message: string
}

/** The `user` object embedded in POST /auth/login's response. */
export interface ApiAuthUser {
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  role_name: string
  hierarchy_level: number
  store_ids: string[]
  is_active: boolean
  points: number
  must_change_password: boolean
}

/** Raw response from POST /auth/login. Not wrapped in ApiResponseV2 — flat shape. */
export interface LoginResponse {
  success: boolean
  access_token: string
  refresh_token: string
  token_type: string
  must_change_password: boolean
  user: ApiAuthUser
}

/** Raw response from POST /auth/refresh. Same shape as LoginResponse minus must_change_password. */
export interface RefreshResponse {
  success: boolean
  access_token: string
  refresh_token: string
  token_type: string
  user: ApiAuthUser
}

/**
 * Raw response from Pythia 1.0's own POST /auth/login (called via pythia1Client,
 * not pythia2Client). Only ever carries a bearer token — no user profile. Backend's
 * app/services/pythia1_client.py::login_p1() checks all four of these shapes for
 * the token; mirror that here rather than assuming one fixed shape.
 */
export interface P1LoginResponse {
  statusCode?: number
  token?: string
  accessToken?: string
  data?: {
    token?: string
    accessToken?: string
  }
}

/** The `role` object embedded in Pythia 1.0's GET /profile/ response. */
export interface P1ProfileRole {
  _id: string
  name: string
  slug: string
  hierarchyLevel: number
  permissions: string[]
}

/** The `data` payload of Pythia 1.0's GET /profile/ response. */
export interface P1ProfileUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: P1ProfileRole
  ownerGroupId: string
  storeIds: string[]
  isActive: boolean
  points?: number
}

/**
 * Raw response from Pythia 1.0's own GET /profile/ (called via pythia1Client).
 * Fetched with the token from P1LoginResponse to get the actual user/role data —
 * P1's /auth/login never returns this itself. Shape matches the docstring in
 * app/services/pythia1_client.py::_map_p1_user() on the backend.
 */
export interface P1ProfileResponse {
  statusCode: number
  data: P1ProfileUser
}
