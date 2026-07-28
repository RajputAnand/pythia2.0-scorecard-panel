export type PillVariant = 'up' | 'down' | 'neutral'
export type ValueVariant = 'green' | 'amber' | ''

export interface RoiStat {
  label: string
  value: string
  valueVariant: ValueVariant
  pill: string
  pillVariant: PillVariant
  sub: string
}
