---
name: device-health-monitoring
description: >-
  Guide for Super Admin real-time IoT/Edge device state monitoring, WebSocket live telemetry, and REST snapshot synchronization in Pythia 2.0.
---

# Device Health Monitoring Guide

Device Health (`/super-admin/device-health`) allows Super Admins to monitor real-time connectivity, hardware metrics (CPU, RAM, GPU, temperature), and camera feed health across all in-store edge devices.

## Core Files & Locations

- **Page Route**: [`src/app/super-admin/device-health/page.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/app/super-admin/device-health/page.tsx)
- **Panel & Cards**:
  - [`src/components/DeviceHealthPanel/DeviceHealthPanel.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/components/DeviceHealthPanel/DeviceHealthPanel.tsx)
  - [`src/components/DeviceHealthCard/DeviceHealthCard.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/components/DeviceHealthCard/DeviceHealthCard.tsx)
- **Queries & WS URL**: [`src/queries/device-health.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/queries/device-health.ts)
- **Types**: [`src/types/device-health.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/types/device-health.ts)

---

## Dual REST & WebSocket Hybrid Architecture

To guarantee both instant initial load and real-time updates:

### 1. Initial REST Snapshot
On mount, `DeviceHealthPanel` immediately calls `fetchDeviceStates({ token, signal })` to load the current state of all known devices without waiting for incoming WebSocket events.

### 2. Live WebSocket Connection (`GET /device-states/ws`)
Browser WebSockets cannot send standard HTTP `Authorization` headers. Pythia 2.0 uses an in-socket authentication handshake:

```ts
const ws = new WebSocket(getDeviceStatesWsUrl())

ws.onopen = () => {
  // Handshake message carries bearer token
  ws.send(JSON.stringify({ token }))
}

ws.onmessage = (event) => {
  const message: DeviceStateWsMessage = JSON.parse(event.data)
  
  if (message.type === 'connected') {
    setStatus('live')
  } else if (message.type === 'device_update') {
    // Merges latest telemetry frame for specific device
    setDevices((prev) => {
      const update = message.data
      const index = prev.findIndex((d) => d.device_id === update.device_id)
      if (index === -1) return [update, ...prev]
      const next = [...prev]
      next[index] = update
      return next
    })
  }
}
```

### 3. Reconnection Handling
If the WebSocket closes unexpectedly (backend restart, network hiccup), the client sets status to `reconnecting` and schedules a clean retry after `RECONNECT_DELAY_MS = 3000`.

