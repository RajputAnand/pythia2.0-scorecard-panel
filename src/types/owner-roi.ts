export interface RoiAttributionParams {
  period_type?: 'week' | 'month' | 'quarter' | 'custom'
  custom_start?: string
  custom_end?: string
  view?: 'both' | 'actual' | 'projected'
}

export interface RoiAttributionResponse {
  success: boolean
  meta: {
    period: {
      start_local: string
      end_local_exclusive: string
      label: string
      timezone?: string
    }
    comparison_period: {
      start_local: string
      end_local_exclusive: string
      label: string
    }
    period_type: string
    scope: {
      type: string
      store_count: number
      store_id: string | null
    }
  }
  hero: {
    team_score: { start_score: number | null; end_score: number | null; change: number | null }
    platform_cost: { amount: number | null; monthly_rate: number | null; period_days: number | null }
    revenue_impact: {
      amount: number | null
      current_transactions: number | null
      comparison_transactions: number | null
      transaction_change: number | null
      nacs_avg_basket: number | null
      percent_change: number | null
    }
    net_roi: { amount: number | null; multiplier: number | null }
  }
  charts: {
    score_vs_transactions: RoiChartData
    hospitality_vs_dwell: RoiChartData
    checkout_vs_throughput: RoiChartData
  }
  revenue_impact_table: {
    rows: RoiRevenueImpactRow[]
    platform_cost_row: {
      label: string
      sublabel: string
      actual_cost: number | null
      projected_cost: number | null
    }
    net_roi_row: {
      label: string
      note: string
      actual_amount: number | null
      projected_amount: number | null
    }
  }
  coaching_efficiency: RoiCoachingEfficiencyRow[]
  coaching_efficiency_summary: {
    team_avg_cost_per_point: number
    insight: string | null
  }
  projection_summary: {
    trajectory_next_period_amount: number | null
    breakeven_days: number | null
    annual_roi_multiplier: number | null
    assumption_note: string
  }
}

export interface RoiChartData {
  metric_a_label: string
  metric_b_label: string
  metric_a_series: RoiChartPoint[]
  metric_b_series: RoiChartPoint[]
  metric_a_projected: RoiChartPoint | null
  metric_b_projected: RoiChartPoint | null
  correlation_r: number | null
  correlation_status: 'available' | 'insufficient_data'
  callout: string | null
}

export interface RoiChartPoint {
  period: { label: string }
  value: number
}

export interface RoiRevenueImpactRow {
  metric_key: string
  metric_label: string
  metric_sublabel: string
  score_before: number | null
  score_after: number | null
  business_outcome: string
  actual_impact: number | null
  actual_impact_status: 'available' | 'formula_not_defined'
  projected_impact: number | null
  projected_impact_status: 'available' | 'formula_not_defined'
}

export interface ShareRoiAttributionPdfParams {
  token: string
  toEmail: string
  note?: string
  senderName?: string
  pdfFile: File
}

export interface ShareRoiAttributionPdfResponse {
  success: boolean
  message: string
}

export interface RoiCoachingEfficiencyRow {
  user_id: string
  name: string
  points_gained: number
  total_cost: number
  cost_per_point: number
  issues_resolved: number
  issues_stalled: number
  status: 'good' | 'ok' | 'bad' | 'no_data'
}
