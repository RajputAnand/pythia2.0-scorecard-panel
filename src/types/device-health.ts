// Mirrors app/schemas/device_state.py's DeviceStateSummary — GET /device-states,
// GET /device-states/{device_id}.

export type DeviceAlertMetric = 'cpu' | 'ram' | 'temperature' | 'storage'

export interface DeviceContainerStat {
  service: string
  status: string
  cpu_percent: number | null
  ram_used_mb: number | null
  ram_limit_mb: number | null
  ram_percent: number | null
}

export interface DeviceDockerDiskUsage {
  images_gb: number | null
  containers_gb: number | null
  volumes_gb: number | null
  total_gb: number | null
}

export interface DeviceStateSummary {
  device_id: string
  store_id: string
  cpu_usage_per_core_percent: number[]
  cpu_usage_avg_percent: number | null
  temperature_celsius: number | null
  ram_usage_percent: number
  ram_total_mb: number | null
  ram_used_mb: number | null
  storage_usage_percent: number
  storage_total_gb: number | null
  storage_used_gb: number | null
  containers: DeviceContainerStat[]
  docker_disk_usage: DeviceDockerDiskUsage | null
  active_alerts: DeviceAlertMetric[]
  reported_at: string
  updated_at: string
}
