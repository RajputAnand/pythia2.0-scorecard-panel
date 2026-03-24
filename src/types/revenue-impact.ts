export interface RevenueImpactRow {
  metric: string
  sub: string
  scoreBefore: string
  scoreAfter: string
  scoreColor: string
  barWidth: string
  barColor: string
  outcome: string
  actual: string
  projected: string
}

export interface RevenueImpactCostRow {
  label: string
  sub: string
  outcome: string
  cost: string
}

export interface RevenueImpactNetRoiRow {
  label: string
  outcome: string
  actual: string
  projected: string
}

export interface RevenueImpactData {
  title: string
  subtitle: string
  badge: string
  rows: RevenueImpactRow[]
  costRow: RevenueImpactCostRow
  netRoiRow: RevenueImpactNetRoiRow
}
