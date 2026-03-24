export type PillVariant = 'hosp' | 'checkout' | 'time'
export type StatusVariant = 'active' | 'done'

export interface CoachingItem {
  id: string
  type: PillVariant
  typeLabel: string
  title: string
  status: StatusVariant
  statusLabel: string
  /** Use **text** for bold segments */
  what: string
  /** Use **text** for bold segments */
  tip: string
  defaultOpen?: boolean
}
