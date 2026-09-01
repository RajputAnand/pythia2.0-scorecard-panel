// Raw shape returned by the (still-mocked) /managers endpoint. Mirrors
// `ApiEmployee` field-for-field so the shared `getEmployeeName` /
// `getEmployeeInitials` helpers accept a manager record structurally, and
// `store_ids` carries the stores a manager oversees (see CreateManagerModal's
// multi-store picker).
export interface ApiManager {
  _id: string
  user_id: string
  first_name?: string | null
  last_name?: string | null
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  role_name: string
  store_ids: string[]
  is_active: boolean
  must_change_password?: boolean
  // Only present once a manager has been archived.
  archived_by?: string | null
  archived_at?: string | null
}

export interface CreateManagerParams {
  token: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  storeIds: string[]
}

// Raw response from POST /managers
export interface CreateManagerResponse {
  success: boolean
  user_id: string
  temp_password: string
  email_sent: boolean
  message: string
}

// Raw `data` payload from GET /managers/{user_id}/credentials
export interface ManagerCredentials {
  user_id: string
  temp_password: string
}
