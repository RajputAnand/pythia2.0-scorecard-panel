'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import DeviceHealthCard from '@/components/DeviceHealthCard/DeviceHealthCard'
import { fetchDeviceStates } from '@/queries/device-health'
import type { DeviceStateSummary } from '@/types/device-health'
import { extractApiErrorMessage } from '@/utils/common'

// Devices report every ~30s (DEVICE_STATE_REPORT_INTERVAL_SEC on the data
// preprocessor); polling faster than that just re-fetches the same snapshot,
// but 5s keeps the panel feeling live without hammering the backend.
const POLL_INTERVAL_MS = 5000

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

  const [devices, setDevices] = useState<DeviceStateSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    let cancelled = false

    const load = () => {
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
    }

    load()
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      controller.abort()
      clearInterval(id)
    }
  }, [token])

  // Ticks the "Updated Xs ago" labels between polls — independent of the
  // poll interval itself so the label stays accurate even between fetches.
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
      {error && (
        <div className="bg-danger-light border border-danger rounded-[10px] px-4 py-[10px] text-danger text-[12px]">
          {error} — showing the last known data.
        </div>
      )}
      {devices.map((device) => (
        <DeviceHealthCard key={device.device_id} device={device} now={now} />
      ))}
    </div>
  )
}
