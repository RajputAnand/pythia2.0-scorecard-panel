export interface BenchmarkingStoreData {
  rank: number
  store_id: string
  overall: number | null
  hospitality: number | null
  checkout: number | null
  time_to_svc: number | null
  transaction_count: number | null
  mom_change: number | null
  mom_percent_change: number | null
  trend_status: string
  overall_percentile: number | null
  overall_percentile_display: string
  overall_percentile_band: string
  overall_percentile_status: string
}

export interface SelectedStoreBenchmarkingData {
  store_id: string
  overall: number | null
  hospitality: number | null
  checkout: number | null
  time_to_svc: number | null
  transaction_count: number | null

  rank: number | null
  cohort_size: number
  hospitality_rank: number | null
  hospitality_cohort_size: number
  checkout_rank: number | null
  checkout_cohort_size: number
  time_to_svc_rank: number | null
  time_to_svc_cohort_size: number

  overall_percentile: number | null
  overall_percentile_display: string
  overall_percentile_band: string
  overall_percentile_status: string

  rank_movement: {
    previous_rank: number | null
    rank_change: number | null
    status: string
  }

  rank_history: {
    period: { label: string }
    rank: number | null
    cohort_size: number
    status: string
  }[]

  top_performer: {
    store_id: string
    overall: number | null
    hospitality: number | null
    checkout: number | null
    time_to_svc: number | null
    rank: number | null
    cohort_size: number
    overall_percentile: number | null
    overall_percentile_display: string
    overall_percentile_band: string
    overall_percentile_status: string
  }

  gaps: {
    overall: number | null
    hospitality: number | null
    checkout: number | null
    time_to_svc: number | null
    biggest_gap_metric: string | null
    biggest_gap_value: number | null
  }

  rank_movement_board: {
    months: { label: string }[]
    rows: {
      store_id: string
      current_rank: number | null
      is_selected_store: boolean
      is_top_performer: boolean
      is_nearest_competitor: boolean
      history: { rank: number | null; status?: string }[]
    }[]
  }
}

export interface BenchmarkingAllStoreDataResponse {
  success: boolean
  meta: {
    metric: string
    sort_order: string
    period: { start_local: string; end_local_exclusive: string; label: string; timezone: string }
    comparison_period: { label: string }
    scope: { type: string; store_count: number; store_id: string | null }
    filter: { mode: string; display_total: number; selected_store_id: string }
    total: number
    offset: number
    limit: number
  }
  selected_store: SelectedStoreBenchmarkingData | null
  data: BenchmarkingStoreData[]
}

export interface BenchmarkingNetworkIntelligenceResponse {
  success: boolean
  meta: {
    period: { label: string }
    scope: { type: string; store_count: number }
    selected_store_id: string
    top_performer_ids: string[]
    generated_by: string
    cached: boolean
  }
  cards: {
    checkout?: { title: string; description: string; your_gap: string; top_avg_seconds?: number | null; your_avg_seconds?: number | null }
    greeting?: { title: string; description: string; your_gap: string; top_avg_seconds?: number | null; your_avg_seconds?: number | null; top_consistency_pct?: number | null; your_consistency_pct?: number | null }
    dead_air?: { title: string; description: string; your_gap: string; top_avg_silent_pct?: number | null; your_avg_silent_pct?: number | null }
    coaching?: { title: string; description: string; your_gap: string; top_avg_weeks?: number | null; your_avg_weeks?: number | null; your_stalled_count?: number; your_resolved_count?: number }
    staff_floor?: { title: string; description: string; your_gap: string; threshold?: number | null; top_all_above_floor?: boolean; your_below_threshold_count?: number; your_below_threshold_employees?: { name: string; score: number }[] }
  }
}
