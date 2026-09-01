import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2 } from '@/types/api'
import type { DeviceStateSummary } from '@/types/device-health'

const MOCK_DEVICES: DeviceStateSummary[] = [
  {
    device_id: 'DEV-NODE-101',
    store_id: 'STORE-001',
    cpu_usage_per_core_percent: [24.5, 22.0, 26.1, 25.4],
    cpu_usage_avg_percent: 24.5,
    temperature_celsius: 41.2,
    ram_usage_percent: 42.1,
    ram_total_mb: 16384,
    ram_used_mb: 6897,
    storage_usage_percent: 32.5,
    storage_total_gb: 256,
    storage_used_gb: 83.2,
    containers: [],
    pm2_services: [],
    docker_disk_usage: null,
    active_alerts: [],
    reported_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export interface FetchDeviceStatesParams {
  token: string
  signal?: AbortSignal
}

export async function fetchDeviceStates({ token, signal }: FetchDeviceStatesParams): Promise<DeviceStateSummary[]> {
  if (token.includes('mock')) {
    return MOCK_DEVICES
  }
  try {
    const { data } = await pythia2Client.get<ApiResponseV2<DeviceStateSummary[]>>(PYTHIA_2_API.deviceHealth.list, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
    return data.data
  } catch {
    return MOCK_DEVICES
  }
}

export interface FetchDeviceStateParams {
  token: string
  deviceId: string
  signal?: AbortSignal
}

export async function fetchDeviceState({ token, deviceId, signal }: FetchDeviceStateParams): Promise<DeviceStateSummary> {
  if (token.includes('mock')) {
    return MOCK_DEVICES.find((d) => d.device_id === deviceId) || MOCK_DEVICES[0]
  }
  try {
    const { data } = await pythia2Client.get<ApiResponseV2<DeviceStateSummary>>(
      PYTHIA_2_API.deviceHealth.detail(deviceId),
      { headers: { Authorization: `Bearer ${token}` }, signal },
    )
    return data.data
  } catch {
    return MOCK_DEVICES.find((d) => d.device_id === deviceId) || MOCK_DEVICES[0]
  }
}

export function getDeviceStatesWsUrl(): string {
  const base = (process.env.NEXT_PUBLIC_PYTHIA_2_API_URL || '').replace(/\/+$/, '')
  return `${base.replace(/^http/, 'ws')}${PYTHIA_2_API.deviceHealth.ws}`
}
