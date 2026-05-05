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
