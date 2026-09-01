import type { RoiAttributionParams, RoiAttributionResponse } from '@/types/owner-roi'
import type {
  BenchmarkingAllStoreDataResponse,
  BenchmarkingNetworkIntelligenceResponse,
} from '@/types/benchmarking'

export function fakeGetRoiAttribution(params?: RoiAttributionParams): Promise<RoiAttributionResponse> {
  const periodLabel =
    params?.period_type === 'week'
      ? 'Aug 25 – Aug 31, 2026'
      : params?.period_type === 'quarter'
      ? 'Q3 2026'
      : 'August 2026'

  return Promise.resolve({
    success: true,
    meta: {
      period: {
        start_local: '2026-08-01T00:00:00',
        end_local_exclusive: '2026-09-01T00:00:00',
        label: periodLabel,
        timezone: 'America/New_York',
      },
      comparison_period: {
        start_local: '2026-07-01T00:00:00',
        end_local_exclusive: '2026-08-01T00:00:00',
        label: 'July 2026',
      },
      period_type: params?.period_type || 'month',
      scope: {
        type: 'all_stores',
        store_count: 5,
        store_id: null,
      },
    },
    hero: {
      team_score: {
        start_score: 72.4,
        end_score: 84.1,
        change: 11.7,
      },
      platform_cost: {
        amount: 2400,
        monthly_rate: 2400,
        period_days: 30,
      },
      revenue_impact: {
        amount: 14850,
        current_transactions: 12450,
        comparison_transactions: 11100,
        transaction_change: 1350,
        nacs_avg_basket: 11.0,
        percent_change: 12.16,
      },
      net_roi: {
        amount: 12450,
        multiplier: 5.19,
      },
    },
    charts: {
      score_vs_transactions: {
        metric_a_label: 'Team Performance Score',
        metric_b_label: 'Transaction Volume',
        metric_a_series: [
          { period: { label: 'Week 1' }, value: 72 },
          { period: { label: 'Week 2' }, value: 76 },
          { period: { label: 'Week 3' }, value: 80 },
          { period: { label: 'Week 4' }, value: 84 },
        ],
        metric_b_series: [
          { period: { label: 'Week 1' }, value: 2900 },
          { period: { label: 'Week 2' }, value: 3050 },
          { period: { label: 'Week 3' }, value: 3200 },
          { period: { label: 'Week 4' }, value: 3300 },
        ],
        metric_a_projected: { period: { label: 'Projected' }, value: 88 },
        metric_b_projected: { period: { label: 'Projected' }, value: 3500 },
        correlation_r: 0.94,
        correlation_status: 'available',
        callout: 'Strong positive correlation between coaching score and weekly sales count.',
      },
      hospitality_vs_dwell: {
        metric_a_label: 'Hospitality Index',
        metric_b_label: 'Dwell Time (min)',
        metric_a_series: [
          { period: { label: 'Week 1' }, value: 68 },
          { period: { label: 'Week 2' }, value: 74 },
          { period: { label: 'Week 3' }, value: 79 },
          { period: { label: 'Week 4' }, value: 83 },
        ],
        metric_b_series: [
          { period: { label: 'Week 1' }, value: 4.2 },
          { period: { label: 'Week 2' }, value: 5.1 },
          { period: { label: 'Week 3' }, value: 5.8 },
          { period: { label: 'Week 4' }, value: 6.4 },
        ],
        metric_a_projected: { period: { label: 'Projected' }, value: 87 },
        metric_b_projected: { period: { label: 'Projected' }, value: 7.0 },
        correlation_r: 0.89,
        correlation_status: 'available',
        callout: 'Higher hospitality scores correlate with +2.2 mins higher customer dwell time.',
      },
      checkout_vs_throughput: {
        metric_a_label: 'Checkout Speed (sec)',
        metric_b_label: 'Hourly Throughput',
        metric_a_series: [
          { period: { label: 'Week 1' }, value: 48 },
          { period: { label: 'Week 2' }, value: 42 },
          { period: { label: 'Week 3' }, value: 38 },
          { period: { label: 'Week 4' }, value: 32 },
        ],
        metric_b_series: [
          { period: { label: 'Week 1' }, value: 45 },
          { period: { label: 'Week 2' }, value: 52 },
          { period: { label: 'Week 3' }, value: 58 },
          { period: { label: 'Week 4' }, value: 66 },
        ],
        metric_a_projected: { period: { label: 'Projected' }, value: 28 },
        metric_b_projected: { period: { label: 'Projected' }, value: 72 },
        correlation_r: -0.96,
        correlation_status: 'available',
        callout: '16-second faster checkout yielded +21 more customers served per peak hour.',
      },
    },
    revenue_impact_table: {
      rows: [
        {
          metric_key: 'hospitality',
          metric_label: 'Hospitality & Greeting',
          metric_sublabel: 'Customer engagement at entrance',
          score_before: 68,
          score_after: 83,
          business_outcome: '+15.2% dwell & upsell rate',
          actual_impact: 6200,
          actual_impact_status: 'available',
          projected_impact: 7800,
          projected_impact_status: 'available',
        },
        {
          metric_key: 'checkout_speed',
          metric_label: 'Queue & Checkout Speed',
          metric_sublabel: 'Reduced bottleneck at register',
          score_before: 72,
          score_after: 86,
          business_outcome: '+460 peak transactions',
          actual_impact: 5100,
          actual_impact_status: 'available',
          projected_impact: 6400,
          projected_impact_status: 'available',
        },
        {
          metric_key: 'store_cleanliness',
          metric_label: 'Merchandising & Restock',
          metric_sublabel: 'Shelf availability and tidy aisles',
          score_before: 75,
          score_after: 84,
          business_outcome: '+3.4% basket size',
          actual_impact: 3550,
          actual_impact_status: 'available',
          projected_impact: 4200,
          projected_impact_status: 'available',
        },
      ],
      platform_cost_row: {
        label: 'Pythia Platform & Sensor License',
        sublabel: '5 Store Locations ($480/mo/store)',
        actual_cost: 2400,
        projected_cost: 2400,
      },
      net_roi_row: {
        label: 'Net Attributable ROI',
        note: 'Revenue gained minus platform subscription',
        actual_amount: 12450,
        projected_amount: 16000,
      },
    },
    coaching_efficiency: [
      {
        user_id: 'MGR-01',
        name: 'Sarah Connor (Northside)',
        points_gained: 14,
        total_cost: 480,
        moments: 28,
        cost_per_moment: 17.14,
        score_delta: 12.5,
        score_delta_status: 'available',
        cost_per_score_point: 38.4,
        cost_per_score_point_status: 'available',
        issues_resolved: 18,
        issues_stalled: 2,
        status: 'good',
      },
      {
        user_id: 'MGR-02',
        name: 'David Miller (Uptown)',
        points_gained: 9,
        total_cost: 480,
        moments: 20,
        cost_per_moment: 24.0,
        score_delta: 8.2,
        score_delta_status: 'available',
        cost_per_score_point: 58.5,
        cost_per_score_point_status: 'available',
        issues_resolved: 12,
        issues_stalled: 3,
        status: 'good',
      },
      {
        user_id: 'MGR-03',
        name: 'Alex Johnson (Westside)',
        points_gained: 5,
        total_cost: 480,
        moments: 14,
        cost_per_moment: 34.28,
        score_delta: 4.1,
        score_delta_status: 'available',
        cost_per_score_point: 117.0,
        cost_per_score_point_status: 'available',
        issues_resolved: 8,
        issues_stalled: 5,
        status: 'ok',
      },
    ],
    coaching_efficiency_summary: {
      team_avg_cost_per_moment: 22.4,
      insight: 'Northside coaching frequency led to 2.4x faster score recovery on stalled metrics.',
    },
    projection_summary: {
      trajectory_next_period_amount: 16000,
      breakeven_days: 6,
      annual_roi_multiplier: 5.8,
      assumption_note: 'Projections based on historical store performance trend and NACS baseline basket size ($11.00).',
    },
  })
}

export function fakeGetAllStoreData(): Promise<BenchmarkingAllStoreDataResponse> {
  return Promise.resolve({
    success: true,
    meta: {
      metric: 'overall',
      sort_order: 'desc',
      period: { start_local: '2026-08-01', end_local_exclusive: '2026-09-01', label: 'August 2026', timezone: 'America/New_York' },
      comparison_period: { label: 'July 2026' },
      scope: { type: 'all_stores', store_count: 5, store_id: null },
      filter: { mode: 'all', display_total: 5, selected_store_id: 'STORE-001' },
      total: 5,
      offset: 0,
      limit: 15,
    },
    selected_store: null,
    data: [
      {
        rank: 1,
        store_id: 'STORE-001',
        overall: 84.5,
        hospitality: 86,
        checkout: 88,
        time_to_svc: 78,
        transaction_count: 3300,
        mom_change: 3.5,
        mom_percent_change: 4.2,
        trend_status: 'up',
        overall_percentile: 90,
        overall_percentile_display: '90th',
        overall_percentile_band: 'top_10',
        overall_percentile_status: 'good',
      },
      {
        rank: 2,
        store_id: 'STORE-002',
        overall: 81.2,
        hospitality: 83,
        checkout: 82,
        time_to_svc: 76,
        transaction_count: 2950,
        mom_change: 1.8,
        mom_percent_change: 2.1,
        trend_status: 'up',
        overall_percentile: 75,
        overall_percentile_display: '75th',
        overall_percentile_band: 'top_25',
        overall_percentile_status: 'good',
      },
    ],
  })
}

export function fakeGetNetworkIntelligence(storeId: string): Promise<BenchmarkingNetworkIntelligenceResponse> {
  return Promise.resolve({
    success: true,
    meta: {
      period: { label: 'August 2026' },
      scope: { type: 'network', store_count: 5 },
      selected_store_id: storeId,
      top_performer_ids: ['STORE-001'],
      generated_by: 'Pythia Benchmarking AI',
      cached: true,
    },
    cards: {
      greeting: {
        title: 'Greeting Speed & Hospitality',
        description: 'Store 001 is performing in the top 10% for on-time greeting speed.',
        your_gap: '+12% vs network avg',
        top_avg_seconds: 2.1,
        your_avg_seconds: 2.4,
      },
    },
  })
}
