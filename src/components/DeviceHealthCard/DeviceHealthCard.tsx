import DataTable from '@/components/shared/DataTable/DataTable'
import type { DataTableColumn } from '@/types/data-table'
import type { DeviceAlertMetric, DeviceContainerStat, DeviceStateSummary } from '@/types/device-health'
import { formatRelativeTime } from '@/utils/common'

interface Props {
  device: DeviceStateSummary
  now: Date
}

interface StatTile {
  key: DeviceAlertMetric
  label: string
  icon: string
  value: number | null
  displayValue: string
}

const containerColumns: DataTableColumn<DeviceContainerStat>[] = [
  {
    key: 'service',
    header: 'Service',
    render: (c) => <span className="font-medium">{c.service}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (c) => (
      <span className={`inline-flex items-center gap-1.5 text-[11.5px] ${c.status === 'running' ? 'text-accent' : 'text-muted'}`}>
        <span className={`w-[6px] h-[6px] rounded-full ${c.status === 'running' ? 'bg-accent' : 'bg-muted'}`} />
        {c.status}
      </span>
    ),
  },
  {
    key: 'cpu',
    header: 'CPU',
    align: 'right',
    render: (c) => (c.cpu_percent != null ? `${c.cpu_percent.toFixed(1)}%` : '—'),
  },
  {
    key: 'ram',
    header: 'RAM',
    align: 'right',
    render: (c) =>
      c.ram_used_mb != null
        ? `${c.ram_used_mb.toFixed(0)} MB${c.ram_percent != null ? ` (${c.ram_percent.toFixed(1)}%)` : ''}`
        : '—',
  },
]

export default function DeviceHealthCard({ device, now }: Props) {
  const alerts = new Set(device.active_alerts)

  const tiles: StatTile[] = [
    {
      key: 'cpu',
      label: 'CPU',
      icon: '🖥️',
      value: device.cpu_usage_avg_percent,
      displayValue: device.cpu_usage_avg_percent != null ? `${device.cpu_usage_avg_percent.toFixed(1)}%` : '—',
    },
    {
      key: 'ram',
      label: 'Memory',
      icon: '🧠',
      value: device.ram_usage_percent,
      displayValue: `${device.ram_usage_percent.toFixed(1)}%`,
    },
    {
      key: 'temperature',
      label: 'Temperature',
      icon: '🌡️',
      value: device.temperature_celsius,
      displayValue: device.temperature_celsius != null ? `${device.temperature_celsius.toFixed(1)}°C` : '—',
    },
    {
      key: 'storage',
      label: 'Storage',
      icon: '💾',
      value: device.storage_usage_percent,
      displayValue: `${device.storage_usage_percent.toFixed(1)}%`,
    },
  ]

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-[14px] border-b border-border">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full shrink-0 ${alerts.size > 0 ? 'bg-danger' : 'bg-accent'}`} />
          <div>
            <p className="font-semibold text-[14px]">{device.device_id}</p>
            <p className="text-muted text-[11px] font-mono mt-0.5">{device.store_id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted">Updated {formatRelativeTime(device.updated_at, now)}</p>
          {alerts.size > 0 && (
            <p className="text-[11px] text-danger font-medium mt-0.5">
              {alerts.size} metric{alerts.size > 1 ? 's' : ''} in alert
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[12px] px-5 py-[16px]">
        {tiles.map((tile) => {
          const inAlert = alerts.has(tile.key)
          return (
            <div
              key={tile.key}
              className={`rounded-[10px] border px-[14px] py-[12px] flex flex-col gap-[6px] ${
                inAlert ? 'border-danger bg-danger-light' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted uppercase tracking-[.06em]">{tile.label}</span>
                <span className="text-[12px]">{tile.icon}</span>
              </div>
              <span className={`text-[20px] font-semibold tracking-[-0.02em] ${inAlert ? 'text-danger' : 'text-primary'}`}>
                {tile.displayValue}
              </span>
              {tile.value != null && (
                <div className="h-[4px] bg-surface-alt rounded-[2px] overflow-hidden">
                  <div
                    className="h-full rounded-[2px]"
                    style={{
                      width: `${Math.min(100, tile.value)}%`,
                      background: inAlert ? 'var(--color-danger)' : 'var(--color-accent)',
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {device.cpu_usage_per_core_percent.length > 0 && (
        <div className="px-5 pb-[16px]">
          <p className="text-[10.5px] font-medium text-muted uppercase tracking-[.06em] mb-2">CPU per core</p>
          <div className="flex gap-1">
            {device.cpu_usage_per_core_percent.map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`Core ${i}: ${pct.toFixed(1)}%`}>
                <div className="w-full h-[36px] bg-surface-alt rounded-[3px] overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-[3px]"
                    style={{ height: `${Math.min(100, pct)}%`, background: pct >= 90 ? 'var(--color-danger)' : 'var(--color-cobalt)' }}
                  />
                </div>
                <span className="text-[9px] text-muted font-mono">{i}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {device.containers.length > 0 && (
        <div className="px-5 pb-[16px]">
          <p className="text-[10.5px] font-medium text-muted uppercase tracking-[.06em] mb-2">
            Pipeline services ({device.containers.length})
          </p>
          <DataTable
            columns={containerColumns}
            rows={device.containers}
            // service name is usually unique, but isn't guaranteed to be (e.g.
            // briefly during a rolling restart) — index disambiguates.
            getRowKey={(c) => `${c.service}-${device.containers.indexOf(c)}`}
          />
        </div>
      )}

      {device.docker_disk_usage && (
        <div className="px-5 py-[14px] border-t border-border bg-surface-alt flex items-center gap-6 flex-wrap">
          <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.06em]">Docker disk</span>
          <span className="text-[12px] font-mono">Images {device.docker_disk_usage.images_gb?.toFixed(1) ?? '—'} GB</span>
          <span className="text-[12px] font-mono">Containers {device.docker_disk_usage.containers_gb?.toFixed(1) ?? '—'} GB</span>
          <span className="text-[12px] font-mono">Volumes {device.docker_disk_usage.volumes_gb?.toFixed(1) ?? '—'} GB</span>
          <span className="text-[12px] font-mono font-semibold text-primary">
            Total {device.docker_disk_usage.total_gb?.toFixed(1) ?? '—'} GB
          </span>
        </div>
      )}
    </div>
  )
}
