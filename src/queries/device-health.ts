import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2 } from '@/types/api'
import type { DeviceStateSummary } from '@/types/device-health'

export interface FetchDeviceStatesParams {
  token: string
  signal?: AbortSignal
}

export async function fetchDeviceStates({ token, signal }: FetchDeviceStatesParams): Promise<DeviceStateSummary[]> {
  const { data } = await pythia2Client.get<ApiResponseV2<DeviceStateSummary[]>>(PYTHIA_2_API.deviceHealth.list, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
  return data.data
}

export interface FetchDeviceStateParams {
  token: string
  deviceId: string
  signal?: AbortSignal
}

export async function fetchDeviceState({ token, deviceId, signal }: FetchDeviceStateParams): Promise<DeviceStateSummary> {
  const { data } = await pythia2Client.get<ApiResponseV2<DeviceStateSummary>>(
    PYTHIA_2_API.deviceHealth.detail(deviceId),
    { headers: { Authorization: `Bearer ${token}` }, signal },
  )
  return data.data
}

/** ws(s)://<backend host>/device-states/ws, derived from the same base URL
 * pythia2Client uses — a browser WebSocket can't reuse an axios instance. */
export function getDeviceStatesWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_PYTHIA_2_API_URL || ''
  return `${base.replace(/^http/, 'ws')}${PYTHIA_2_API.deviceHealth.ws}`
}
