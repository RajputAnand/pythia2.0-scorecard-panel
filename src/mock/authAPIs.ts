// ---------------------------------------------------------------------------
// Fake API layer — replace with real fetch calls when the backend is ready
// ---------------------------------------------------------------------------

import type {
  ForgotPasswordResult,
  ValidateKeyResult,
  ResetPasswordResult,
} from '@/types/auth'
import { DEMO_USERS } from '@/lib/demo-user'

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password  { email }
// Simulates sending a password-reset email.
// Succeeds for any known demo email; fails otherwise.
// ---------------------------------------------------------------------------
export function fakeForgotPassword(email: string): Promise<ForgotPasswordResult> {
  return new Promise((resolve) =>
    setTimeout(() => {
      const exists = DEMO_USERS.some((u) => u.email === email)
      if (exists) {
        resolve({
          success: true,
          message: 'Password reset link has been sent to your email.',
        })
      } else {
        resolve({
          success: false,
          message: 'No account found with that email address.',
        })
      }
    }, 1200)
  )
}

// ---------------------------------------------------------------------------
// POST /api/auth/validate-key  { key }
// Validates a password-reset key.
// The key "expired" simulates an expired link; any other non-empty key is valid.
// ---------------------------------------------------------------------------
export function fakeValidateKey(key: string): Promise<ValidateKeyResult> {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (!key) {
        resolve({ valid: false, message: 'Reset link is invalid.' })
      } else if (key === 'expired') {
        resolve({
          valid: false,
          message: 'This reset link has expired. Please request a new one.',
        })
      } else {
        resolve({ valid: true, message: 'Key is valid.' })
      }
    }, 800)
  )
}

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password  { key, password, confirmPassword }
// Resets the password.
// Has a 10 % random failure rate to simulate server errors.
// ---------------------------------------------------------------------------
export function fakeResetPassword(
  _key: string,
  _password: string,
  _confirmPassword: string,
): Promise<ResetPasswordResult> {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (Math.random() < 0.1) {
        resolve({
          success: false,
          message: 'Something went wrong. Please try again later.',
        })
      } else {
        resolve({
          success: true,
          message: 'Your password has been reset successfully.',
        })
      }
    }, 1000)
  )
}
// ---------------------------------------------------------------------------
