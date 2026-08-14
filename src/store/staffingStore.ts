import { create } from 'zustand'
import {
  fetchStaffingSchedule,
  fetchStaffingRoster,
  fetchStaffingHeatmap,
  fetchStaffingInsights,
  fetchStaffingRecommendations,
  createStaffingShift,
  updateStaffingShift,
  deleteStaffingShift,
  generateStaffingSchedule,
  publishStaffingSchedule,
  generateStaffingRecommendations,
  applyStaffingRecommendation,
  dismissStaffingRecommendation,
  type CreateStaffingShiftBody,
  type UpdateStaffingShiftBody,
} from '@/queries/staffing'
import { addDaysToDateString } from '@/lib/staffing-transform'
import type {
  ApiScheduleResponse,
  ApiRosterMember,
  ApiTrafficHeatmap,
  ApiInsights,
  ApiRecommendation,
  ApiCriticalAlert,
} from '@/types/staff'

const POLL_INTERVAL_MS = 2000
// Gemini's batch call for a week's worth of flags has been observed taking ~15-20s;
// 30 attempts x 2s gives a comfortable 60s margin before the client gives up.
const POLL_MAX_ATTEMPTS = 30

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface HydrateArgs {
  storeId: string
  weekStartDate: string
  schedule: ApiScheduleResponse | null
  roster: ApiRosterMember[]
  heatmap: ApiTrafficHeatmap | null
  insights: ApiInsights | null
  recommendations: import('@/types/staff').ApiRecommendationsResponse | null
}

interface StaffingState {
  hydrated: boolean
  storeId: string | null
  weekStartDate: string | null

  schedule: ApiScheduleResponse | null
  roster: ApiRosterMember[]
  heatmap: ApiTrafficHeatmap | null
  insights: ApiInsights | null
  recommendations: ApiRecommendation[]
  criticalAlert: ApiCriticalAlert | null
  generationStatus: 'idle' | 'generating' | 'done' | 'failed'
  // Whether THIS client is actively polling for a generation it kicked off — distinct
  // from generationStatus (the server's last-known state), so the header's Refresh
  // button doesn't stay disabled forever if the client's poll window runs out while
  // the server is still working (e.g. a slow Gemini call): generationStatus would
  // still read "generating" from the last successful poll, but pollingRecommendations
  // correctly flips back to false so the button re-enables.
  pollingRecommendations: boolean

  loading: boolean
  error: string | null
  applyingId: string | null
  savingShift: boolean
  publishing: boolean
  lastSyncedAt: string | null

  hydrate: (args: HydrateArgs) => void
  fetchAll: (token: string) => Promise<void>
  goToPreviousWeek: (token: string) => Promise<void>
  goToNextWeek: (token: string) => Promise<void>
  saveShift: (
    token: string,
    args: { shiftId: string | null; body: CreateStaffingShiftBody | UpdateStaffingShiftBody }
  ) => Promise<void>
  deleteShift: (token: string, shiftId: string) => Promise<void>
  generateSchedule: (token: string) => Promise<void>
  publishSchedule: (token: string) => Promise<boolean>
  generateRecommendations: (token: string) => Promise<void>
  applyRecommendation: (token: string, recommendationId: string) => Promise<boolean>
  applyAllRecommendations: (token: string) => Promise<boolean>
  dismissRecommendation: (token: string, recommendationId: string, reason?: string) => Promise<boolean>
}

export const useStaffingStore = create<StaffingState>((set, get) => ({
  hydrated: false,
  storeId: null,
  weekStartDate: null,

  schedule: null,
  roster: [],
  heatmap: null,
  insights: null,
  recommendations: [],
  criticalAlert: null,
  generationStatus: 'idle',
  pollingRecommendations: false,

  loading: false,
  error: null,
  applyingId: null,
  savingShift: false,
  publishing: false,
  lastSyncedAt: null,

  hydrate({ storeId, weekStartDate, schedule, roster, heatmap, insights, recommendations }) {
    if (get().hydrated) return
    set({
      hydrated: true,
      storeId,
      weekStartDate,
      schedule,
      roster,
      heatmap,
      insights,
      recommendations: recommendations?.recommendations ?? [],
      criticalAlert: recommendations?.critical_alert ?? null,
      generationStatus: recommendations?.generation_status ?? 'idle',
    })
  },

  async fetchAll(token) {
    const { storeId, weekStartDate } = get()
    if (!storeId || !weekStartDate) return
    set({ loading: true, error: null })
    try {
      const [schedule, roster, heatmap, insights, recommendations] = await Promise.all([
        fetchStaffingSchedule({ token, storeId, weekStartDate }),
        fetchStaffingRoster({ token, storeId }),
        fetchStaffingHeatmap({ token, storeId, weekStartDate }),
        fetchStaffingInsights({ token, storeId, weekStartDate }),
        fetchStaffingRecommendations({ token, storeId, weekStartDate }),
      ])
      set({
        schedule,
        roster,
        heatmap,
        insights,
        recommendations: recommendations.recommendations,
        criticalAlert: recommendations.critical_alert,
        generationStatus: recommendations.generation_status,
        loading: false,
        lastSyncedAt: new Date().toISOString(),
      })
    } catch {
      set({ loading: false, error: 'Failed to load staffing data' })
    }
  },

  async goToPreviousWeek(token) {
    const { weekStartDate } = get()
    if (!weekStartDate) return
    set({ weekStartDate: addDaysToDateString(weekStartDate, -7) })
    await get().fetchAll(token)
  },

  async goToNextWeek(token) {
    const { weekStartDate } = get()
    if (!weekStartDate) return
    set({ weekStartDate: addDaysToDateString(weekStartDate, 7) })
    await get().fetchAll(token)
  },

  async saveShift(token, { shiftId, body }) {
    set({ savingShift: true })
    try {
      if (shiftId && !shiftId.startsWith('actual:')) {
        await updateStaffingShift({ token, shiftId, body: body as UpdateStaffingShiftBody })
      } else {
        await createStaffingShift({ token, body: body as CreateStaffingShiftBody })
      }
      set({ savingShift: false })
      await get().fetchAll(token)
    } catch {
      set({ savingShift: false, error: 'Failed to save shift' })
    }
  },

  async deleteShift(token, shiftId) {
    set({ savingShift: true })
    try {
      await deleteStaffingShift({ token, shiftId })
      set({ savingShift: false })
      await get().fetchAll(token)
    } catch {
      set({ savingShift: false, error: 'Failed to remove shift' })
    }
  },

  async generateSchedule(token) {
    const { storeId, weekStartDate } = get()
    if (!storeId || !weekStartDate) return
    set({ loading: true })
    try {
      await generateStaffingSchedule({ token, storeId, weekStartDate })
    } finally {
      await get().fetchAll(token)
    }
  },

  async publishSchedule(token) {
    const { storeId, weekStartDate } = get()
    if (!storeId || !weekStartDate) return false
    set({ publishing: true })
    try {
      await publishStaffingSchedule({ token, storeId, weekStartDate })
      set({ publishing: false })
      await get().fetchAll(token)
      return true
    } catch {
      set({ publishing: false, error: 'Failed to publish schedule' })
      return false
    }
  },

  async generateRecommendations(token) {
    const { storeId, weekStartDate } = get()
    if (!storeId || !weekStartDate) return
    set({ generationStatus: 'generating', pollingRecommendations: true })
    try {
      await generateStaffingRecommendations({ token, storeId, weekStartDate })
    } catch {
      set({ generationStatus: 'failed', pollingRecommendations: false })
      return
    }

    try {
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
        await sleep(POLL_INTERVAL_MS)
        // Bail if the manager navigated to a different week mid-poll.
        if (get().storeId !== storeId || get().weekStartDate !== weekStartDate) return
        try {
          const result = await fetchStaffingRecommendations({ token, storeId, weekStartDate })
          set({
            recommendations: result.recommendations,
            criticalAlert: result.critical_alert,
            generationStatus: result.generation_status,
          })
          if (result.generation_status !== 'generating') return
        } catch {
          set({ generationStatus: 'failed' })
          return
        }
      }
      // Poll window exhausted but the server may still be working (e.g. a slow Gemini
      // call) — generationStatus is left at its last-known "generating" value rather
      // than lying that it failed; pollingRecommendations flipping to false (below, via
      // finally) is what re-enables the Refresh button, not a claim about server state.
    } finally {
      set({ pollingRecommendations: false })
    }
  },

  async applyRecommendation(token, recommendationId) {
    const { storeId, weekStartDate } = get()
    if (!storeId || !weekStartDate) return false
    set({ applyingId: recommendationId })
    try {
      const result = await applyStaffingRecommendation({ token, recommendationId, storeId, weekStartDate })
      set((state) => ({
        applyingId: null,
        recommendations: state.recommendations.map((r) => (r.id === recommendationId ? result.recommendation : r)),
      }))
      await get().fetchAll(token)
      return true
    } catch {
      set({ applyingId: null, error: 'Failed to apply recommendation' })
      return false
    }
  },

  async applyAllRecommendations(token) {
    const activeIds = get()
      .recommendations.filter((r) => r.status === 'active' && r.target.suggested_employee_id)
      .map((r) => r.id)
    let allOk = true
    for (const id of activeIds) {
      // Sequential, not Promise.all — each apply mutates scheduled_shifts, and running
      // them concurrently risks racing on the same (date, day_part) slot.
      const ok = await get().applyRecommendation(token, id)
      if (!ok) allOk = false
    }
    return allOk
  },

  async dismissRecommendation(token, recommendationId, reason) {
    const { storeId, weekStartDate } = get()
    if (!storeId || !weekStartDate) return false
    set({ applyingId: recommendationId })
    try {
      const updated = await dismissStaffingRecommendation({ token, recommendationId, storeId, weekStartDate, reason })
      set((state) => ({
        applyingId: null,
        recommendations: state.recommendations.map((r) => (r.id === recommendationId ? updated : r)),
        criticalAlert: state.criticalAlert?.recommendation_id === recommendationId ? null : state.criticalAlert,
      }))
      return true
    } catch {
      set({ applyingId: null, error: 'Failed to dismiss recommendation' })
      return false
    }
  },
}))
