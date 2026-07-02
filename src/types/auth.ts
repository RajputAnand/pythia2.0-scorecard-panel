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

/** Raw response from the Pythia-2 POST /auth/exchange endpoint. Not wrapped in ApiResponseV2 — flat shape. */
export interface TokenExchangeResponse {
  success: boolean
  pythia1_token: string
  pythia2_token: string
  user: {
    _id: string
    pythia1_user_id: string
    email: string
    firstName: string
    lastName: string
    role_name: string
    hierarchy_level: number
    is_active: boolean
    owner_group_id: string
    phone: string
    store_ids: string[]
    permissions: string[]
    points: number
    device_id: string | null
    created_at: string
    updated_at: string
  }
}
