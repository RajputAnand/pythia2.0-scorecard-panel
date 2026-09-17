'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/userStore'
import DeviceHealthCard from '@/components/DeviceHealthCard/DeviceHealthCard'
import { fetchDeviceStates, getDeviceStatesWsUrl } from '@/queries/device-health'
import type { DeviceStateSummary, DeviceStateWsMessage } from '@/types/device-health'
import { extractApiErrorMessage } from '@/utils/common'

type ConnectionStatus = 'connecting' | 'live' | 'reconnecting'

// How long to wait before retrying a dropped WebSocket connection (network
// blip, backend restart/redeploy). No backoff growth — a fixed 3s is simple
// and this connection is cheap to retry (nothing per-attempt to rate-limit).
const RECONNECT_DELAY_MS = 3000

function DeviceHealthSkeleton() {
  return (
    <div className="grid gap-4 animate-pulse">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-[14px] h-[220px]" />
      ))}
    </div>
  )
}

export default function DeviceHealthPanel() {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const currentStore = useUserStore((s) => s.currentStore)
  const currentStoreId = currentStore?.storeNo || currentStore?._id

  const [devices, setDevices] = useState<DeviceStateSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [now, setNow] = useState(() => new Date())

  const filteredDevices = useMemo(() => {
    if (!devices) return null
    if (!currentStoreId) return devices
    return devices.filter(
      (d) => d.store_id === currentStoreId || d.store_id === currentStore?.storeNo || d.store_id === currentStore?._id
    )
  }, [devices, currentStoreId, currentStore])

  // One-time initial snapshot, so the page has something to show immediately
  // instead of waiting for every device to happen to report over the socket
  // after connecting (devices report every few seconds, but with several
  // devices the first one might take a moment to come through).
  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    let cancelled = false

    fetchDeviceStates({ token, signal: controller.signal })
      .then((data) => {
        if (cancelled) return
        setDevices(data)
        setError(null)
      })
      .catch((err) => {
        if (cancelled || axios.isCancel(err)) return
        setError(extractApiErrorMessage(err, 'Unable to load device health data.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [token])

  // Live updates over WebSocket (GET /device-states/ws) — each device_update
  // message is merged into the snapshot above by device_id, so the page
  // updates the moment a device reports instead of on the next poll.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      if (cancelled) return
      setStatus((prev) => (prev === 'live' ? 'reconnecting' : 'connecting'))
      ws = new WebSocket(getDeviceStatesWsUrl())

      ws.onopen = () => {
        // A browser WebSocket can't send a custom Authorization header, so
        // auth happens over the socket itself as the first message instead
        // — see device_states_ws in app/routers/device_states.py.
        ws?.send(JSON.stringify({ token }))
      }

      ws.onmessage = (event) => {
        let message: DeviceStateWsMessage
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }

        if (message.type === 'connected') {
          setStatus('live')
          setError(null)
        } else if (message.type === 'device_update') {
          const update = message.data
          setDevices((prev) => {
            const list = prev ? [...prev] : []
            const idx = list.findIndex((d) => d.device_id === update.device_id)
            if (idx >= 0) list[idx] = update
            else list.unshift(update)
            return list
          })
        }
      }

      ws.onclose = () => {
        if (cancelled) return
        setStatus('reconnecting')
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      }

      // A socket-level error is always followed by onclose — just close
      // explicitly so that single reconnect path is the only one that fires.
      ws.onerror = () => {
        ws?.close()
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [token])

  // Ticks the "Updated Xs ago" labels once a second, independent of when
  // updates actually arrive.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (loading && !devices) return <DeviceHealthSkeleton />

  if (error && !devices) {
    return (
      <div className="bg-surface border border-danger rounded-[14px] px-5 py-[18px] text-danger text-[13px]">
        {error}
      </div>
    )
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[14px] px-5 py-[24px] text-center text-muted text-[13px]">
        No devices have reported in yet.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between text-[12px] text-muted">
        <div>
          {currentStore ? (
            <span>
              Store: <strong className="text-primary font-medium">{currentStore.name}</strong> ({filteredDevices?.length ?? 0} {filteredDevices?.length === 1 ? 'device' : 'devices'})
            </span>
          ) : (
            <span>All Stores ({devices.length} {devices.length === 1 ? 'device' : 'devices'})</span>
          )}
        </div>
        <div className="flex items-center gap-[7px] text-[11.5px]">
          <span
            className={`w-[7px] h-[7px] rounded-full ${status === 'live' ? 'bg-accent' : 'bg-amber animate-pulse'}`}
          />
          {status === 'live' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Reconnecting…'}
        </div>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger rounded-[10px] px-4 py-[10px] text-danger text-[12px]">
          {error} — showing the last known data.
        </div>
      )}

      {filteredDevices && filteredDevices.length === 0 ? (
        <div className="bg-surface border border-border rounded-[14px] px-5 py-[24px] text-center text-muted text-[13px]">
          No devices found for {currentStore?.name || 'this store'}.
        </div>
      ) : (
        filteredDevices?.map((device) => (
          <DeviceHealthCard key={device.device_id} device={device} now={now} />
        ))
      )}
    </div>
  )
}
