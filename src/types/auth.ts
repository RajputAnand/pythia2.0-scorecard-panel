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
