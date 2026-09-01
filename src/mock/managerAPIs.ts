// ---------------------------------------------------------------------------
// Fake API layer for the Manager Management page — replace with real fetch
// calls when a /managers endpoint exists on the backend. All state is held in
// module-level arrays so create/archive/unarchive persist for the session.
// ---------------------------------------------------------------------------

import { MANAGERS, ARCHIVED_MANAGERS } from '@/lib/manager-data'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiManager, CreateManagerResponse, ManagerCredentials } from '@/types/manager'
import { getEmployeeName } from '@/utils/common'

const active: ApiManager[] = MANAGERS.map((m) => ({ ...m }))
const archived: ApiManager[] = ARCHIVED_MANAGERS.map((m) => ({ ...m }))

// Temp passwords minted by fakeCreateManager, keyed by user_id, so the
// "reveal password" action has something to return afterwards.
const tempPasswords = new Map<string, string>([
  ['MGR-1025', 'mgr-temp-4821'],
  ['MGR-1028', 'mgr-temp-9304'],
])

const delay = <T>(value: T, ms = 500): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

function randomPassword(): string {
  return Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6)
}

interface ListParams {
  search?: string
  skip?: number
  limit?: number
}

function paginate(source: ApiManager[], { search = '', skip = 0, limit = 15 }: ListParams) {
  const term = search.trim().toLowerCase()
  const filtered = term
    ? source.filter((m) => {
        const name = getEmployeeName(m).toLowerCase()
        return name.includes(term) || m.email.toLowerCase().includes(term) || m.user_id.toLowerCase().includes(term)
      })
    : source

  const page = filtered.slice(skip, skip + limit)
  const response: ApiResponseV2Paginated<ApiManager[]> = {
    success: true,
    meta: { total: filtered.length, skip, limit },
    data: page.map((m) => ({ ...m })),
  }
  return response
}

export function fakeListManagers(params: ListParams): Promise<ApiResponseV2Paginated<ApiManager[]>> {
  return delay(paginate(active, params))
}

export function fakeListArchivedManagers(params: ListParams): Promise<ApiResponseV2Paginated<ApiManager[]>> {
  return delay(paginate(archived, params))
}

interface CreateArgs {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  storeIds: string[]
}

export function fakeCreateManager({ firstName, lastName, email, phone, storeIds }: CreateArgs): Promise<CreateManagerResponse> {
  const userId = `MGR-${Math.floor(1000 + Math.random() * 9000)}`
  const tempPassword = randomPassword()
  const record: ApiManager = {
    _id: `mgr_${Math.random().toString(36).slice(2, 10)}`,
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    email: email || `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '') + '@example.com',
    phone: phone || null,
    role_name: 'manager',
    store_ids: storeIds,
    is_active: true,
    must_change_password: true,
  }
  active.unshift(record)
  tempPasswords.set(userId, tempPassword)

  return delay({
    success: true,
    user_id: userId,
    temp_password: tempPassword,
    email_sent: !!email,
    message: 'Manager created',
  })
}

export function fakeGetManagerCredentials(userId: string): Promise<ManagerCredentials> {
  let tempPassword = tempPasswords.get(userId)
  if (!tempPassword) {
    const manager = active.find((m) => m.user_id === userId)
    if (manager?.must_change_password) {
      tempPassword = randomPassword()
      tempPasswords.set(userId, tempPassword)
    } else {
      return Promise.reject({
        response: { status: 409, data: { detail: 'No recoverable password on file for this manager.' } },
        isAxiosError: true,
      })
    }
  }
  return delay({ user_id: userId, temp_password: tempPassword })
}

export function fakeArchiveManager(userId: string): Promise<void> {
  const idx = active.findIndex((m) => m.user_id === userId)
  if (idx !== -1) {
    const [record] = active.splice(idx, 1)
    archived.unshift({
      ...record,
      is_active: false,
      archived_by: 'owner@demo.com',
      archived_at: new Date().toISOString(),
    })
  }
  return delay(undefined)
}

export function fakeUnarchiveManager(userId: string): Promise<void> {
  const idx = archived.findIndex((m) => m.user_id === userId)
  if (idx !== -1) {
    const [record] = archived.splice(idx, 1)
    active.unshift({
      ...record,
      is_active: true,
      archived_by: null,
      archived_at: null,
    })
  }
  return delay(undefined)
}
