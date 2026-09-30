import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2 } from '@/types/api'
import type { DailyPipelineStats, DeviceStateSummary } from '@/types/device-health'

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
  if (token.includes('mock')) {
    return MOCK_DEVICES.find((d) => d.device_id === deviceId) || MOCK_DEVICES[0]
  }
  const { data } = await pythia2Client.get<ApiResponseV2<DeviceStateSummary>>(
    PYTHIA_2_API.deviceHealth.detail(deviceId),
    { headers: { Authorization: `Bearer ${token}` }, signal },
  )
  return data.data
}

export function getDeviceStatesWsUrl(): string {
  const base = (process.env.NEXT_PUBLIC_PYTHIA_2_API_URL || '').replace(/\/+$/, '')
  return `${base.replace(/^http/, 'ws')}${PYTHIA_2_API.deviceHealth.ws}`
}

export interface FetchDailyDeviceStatsParams {
  token: string
  date?: string
  deviceId?: string
  storeId?: string
  signal?: AbortSignal
}

export async function fetchDailyDeviceStats({
  token,
  date,
  deviceId,
  storeId,
  signal,
}: FetchDailyDeviceStatsParams): Promise<DailyPipelineStats[]> {
  if (token.includes('mock')) {
    return [
      {
        date: new Date().toISOString().slice(0, 10),
        device_id: 'DEV-NODE-101',
        store_id: 'STORE-001',
        heartbeat_count: 1440,
        last_heartbeat_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        cpu: { latest_percent: 24.5, avg_percent: 22.8 },
        memory: { latest_percent: 42.1, avg_percent: 40.5, total_mb: 16384, used_mb: 6897 },
        temperature: { latest_celsius: 41.2, avg_celsius: 40.1 },
        videos: {
          employee: { processed: 0, accepted: 0, rejected: 0 },
          customer: { processed: 6, accepted: 6, rejected: 0 },
          total: { processed: 6, accepted: 6, rejected: 0 },
        },
      },
    ]
  }
  const params: Record<string, string> = {}
  if (date) params.date = date
  if (deviceId) params.device_id = deviceId
  if (storeId) params.store_id = storeId

  const { data } = await pythia2Client.get<ApiResponseV2<DailyPipelineStats[]>>(
    PYTHIA_2_API.deviceHealth.dailyStats,
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
      signal,
    }
  )
  return data.data
}

