import DataTable from '@/components/shared/DataTable/DataTable'
import type { DataTableColumn } from '@/types/data-table'
import type { DailyPipelineStats, DeviceAlertMetric, DeviceContainerStat, DevicePm2ServiceStat, DeviceStateSummary } from '@/types/device-health'
import { formatRelativeTime } from '@/utils/common'

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

interface Props {
  device: DeviceStateSummary
  dailyStats?: DailyPipelineStats | null
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
      <span className={`inline-flex items-center gap-1.5 text-[11.5px] ${c.status === 'running' ? 'text-accent' : 'text-gray-800'}`}>
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

const pm2Columns: DataTableColumn<DevicePm2ServiceStat>[] = [
  {
    key: 'service',
    header: 'Service',
    render: (s) => <span className="font-medium">{s.service}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (s) => (
      <span className={`inline-flex items-center gap-1.5 text-[11.5px] ${s.status === 'online' ? 'text-accent' : 'text-gray-800'}`}>
        <span className={`w-[6px] h-[6px] rounded-full ${s.status === 'online' ? 'bg-accent' : 'bg-muted'}`} />
        {s.status}
      </span>
    ),
  },
  {
    key: 'cpu',
    header: 'CPU',
    align: 'right',
    render: (s) => (s.cpu_percent != null ? `${s.cpu_percent.toFixed(1)}%` : '—'),
  },
  {
    key: 'ram',
    header: 'RAM',
    align: 'right',
    render: (s) => (s.ram_used_mb != null ? `${s.ram_used_mb.toFixed(0)} MB` : '—'),
  },
  {
    key: 'uptime',
    header: 'Uptime',
    align: 'right',
    render: (s) => (s.uptime_sec != null ? formatUptime(s.uptime_sec) : '—'),
  },
  {
    key: 'restarts',
    header: 'Restarts',
    align: 'right',
    render: (s) => (
      <span className={s.restarts > 0 ? 'text-danger font-medium' : undefined}>{s.restarts}</span>
    ),
  },
]

export default function DeviceHealthCard({ device, dailyStats, now }: Props) {
  const alerts = new Set(device.active_alerts)
  // Only devices running pm2 (not all of them — some are docker-only) report this.
  const pm2Services = device.pm2_services ?? []

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
            <p className="text-gray-800 text-[11px] font-mono mt-0.5">{device.store_id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-800">Updated {formatRelativeTime(device.updated_at, now)}</p>
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
                <span className="text-[10px] font-medium text-gray-800 uppercase tracking-[.06em]">{tile.label}</span>
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

      {/* Daily Pipeline Statistics & Video Processing KPIs */}
      <div className="mx-5 mb-[16px] p-4 rounded-[12px] bg-surface-alt/40 border border-border">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-primary">Daily Pipeline Statistics</span>
            {dailyStats?.date && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-gray-800">
                {dailyStats.date}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-800">
            <span>💓 {dailyStats?.heartbeat_count?.toLocaleString() ?? 0} heartbeats</span>
            {dailyStats?.synced_at && (
              <span>Synced {formatRelativeTime(dailyStats.synced_at, now)}</span>
            )}
          </div>
        </div>

        {/* Video Processing Breakdown (Customer vs Employee vs Total) */}
        <div className="mb-3">
          <div className="text-[10px] font-semibold text-gray-800 uppercase tracking-[.06em] mb-2 flex items-center justify-between">
            <span>Video Processing Metrics</span>
            <span className="text-primary font-mono text-[11px]">
              {(dailyStats?.videos?.total?.processed ??
                ((dailyStats?.videos as any)?.processed ??
                  ((dailyStats?.videos?.customer?.processed ?? 0) + (dailyStats?.videos?.employee?.processed ?? 0))))}{' '}
              total videos
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-surface rounded-[8px] p-3 border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-gray-800 flex items-center gap-1.5">
                  <span>👷</span> Employee Videos
                </span>
                <span className="text-[16px] font-bold text-primary">
                  {dailyStats?.videos?.employee?.processed ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10.5px] font-mono mt-1 pt-1.5 border-t border-border/50">
                <span className="text-accent flex items-center gap-1">
                  ✓ {dailyStats?.videos?.employee?.accepted ?? 0} accepted
                </span>
                <span className="text-danger flex items-center gap-1">
                  ✗ {dailyStats?.videos?.employee?.rejected ?? 0} rejected
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-[8px] p-3 border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-gray-800 flex items-center gap-1.5">
                  <span>🛍️</span> Customer Videos
                </span>
                <span className="text-[16px] font-bold text-primary">
                  {dailyStats?.videos?.customer?.processed ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10.5px] font-mono mt-1 pt-1.5 border-t border-border/50">
                <span className="text-accent flex items-center gap-1">
                  ✓ {dailyStats?.videos?.customer?.accepted ?? 0} accepted
                </span>
                <span className="text-danger flex items-center gap-1">
                  ✗ {dailyStats?.videos?.customer?.rejected ?? 0} rejected
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-[8px] p-3 border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-gray-800 flex items-center gap-1.5">
                  <span>🎞️</span> Total Videos
                </span>
                <span className="text-[16px] font-bold text-primary">
                  {dailyStats?.videos?.total?.processed ??
                    ((dailyStats?.videos as any)?.processed ??
                      ((dailyStats?.videos?.customer?.processed ?? 0) + (dailyStats?.videos?.employee?.processed ?? 0)))}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10.5px] font-mono mt-1 pt-1.5 border-t border-border/50">
                <span className="text-accent flex items-center gap-1">
                  ✓{' '}
                  {dailyStats?.videos?.total?.accepted ??
                    ((dailyStats?.videos as any)?.accepted ??
                      ((dailyStats?.videos?.customer?.accepted ?? 0) + (dailyStats?.videos?.employee?.accepted ?? 0)))}
                  {' accepted'}
                </span>
                <span className="text-danger flex items-center gap-1">
                  ✗{' '}
                  {dailyStats?.videos?.total?.rejected ??
                    ((dailyStats?.videos as any)?.rejected ??
                      ((dailyStats?.videos?.customer?.rejected ?? 0) + (dailyStats?.videos?.employee?.rejected ?? 0)))}
                  {' rejected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Running Averages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-surface rounded-[8px] p-2.5 border border-border">
            <span className="text-[9.5px] font-medium text-gray-800 uppercase tracking-[.05em] block mb-1">
              CPU Daily Avg
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold text-primary">
                {dailyStats?.cpu?.avg_percent != null ? `${dailyStats.cpu.avg_percent.toFixed(1)}%` : '—'}
              </span>
              {dailyStats?.cpu?.latest_percent != null && (
                <span className="text-[10.5px] text-gray-800 font-mono">
                  latest: {dailyStats.cpu.latest_percent.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-[8px] p-2.5 border border-border">
            <span className="text-[9.5px] font-medium text-gray-800 uppercase tracking-[.05em] block mb-1">
              RAM Daily Avg
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold text-primary">
                {dailyStats?.memory?.avg_percent != null ? `${dailyStats.memory.avg_percent.toFixed(1)}%` : '—'}
              </span>
              {dailyStats?.memory?.used_mb != null && dailyStats?.memory?.total_mb != null && (
                <span className="text-[10.5px] text-gray-800 font-mono">
                  {dailyStats.memory.used_mb.toFixed(0)}/{dailyStats.memory.total_mb.toFixed(0)} MB
                </span>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-[8px] p-2.5 border border-border">
            <span className="text-[9.5px] font-medium text-gray-800 uppercase tracking-[.05em] block mb-1">
              Temp Daily Avg
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold text-primary">
                {dailyStats?.temperature?.avg_celsius != null ? `${dailyStats.temperature.avg_celsius.toFixed(1)}°C` : '—'}
              </span>
              {dailyStats?.temperature?.latest_celsius != null && (
                <span className="text-[10.5px] text-gray-800 font-mono">
                  latest: {dailyStats.temperature.latest_celsius.toFixed(1)}°C
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {device.cpu_usage_per_core_percent.length > 0 && (
        <div className="px-5 pb-[16px]">
          <p className="text-[10.5px] font-medium text-gray-800 uppercase tracking-[.06em] mb-2">CPU per core</p>
          <div className="flex gap-1">
            {device.cpu_usage_per_core_percent.map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`Core ${i}: ${pct.toFixed(1)}%`}>
                <div className="w-full h-[36px] bg-surface-alt rounded-[3px] overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-[3px]"
                    style={{ height: `${Math.min(100, pct)}%`, background: pct >= 90 ? 'var(--color-danger)' : 'var(--color-cobalt)' }}
                  />
                </div>
                <span className="text-[9px] text-gray-800 font-mono">{i}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {device.containers.length > 0 && (
        <div className="px-5 pb-[16px]">
          <p className="text-[10.5px] font-medium text-gray-800 uppercase tracking-[.06em] mb-2">
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

      {pm2Services.length > 0 && (
        <div className="px-5 pb-[16px]">
          <p className="text-[10.5px] font-medium text-gray-800 uppercase tracking-[.06em] mb-2">
            pm2 services ({pm2Services.length})
          </p>
          <DataTable
            columns={pm2Columns}
            rows={pm2Services}
            // service name is usually unique, but isn't guaranteed to be (e.g.
            // briefly during a rolling restart) — index disambiguates.
            getRowKey={(s) => `${s.service}-${pm2Services.indexOf(s)}`}
          />
        </div>
      )}
    </div>
  )
}
