import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type {
  CoachingEffectivenessRow,
  CoachingEmployeeChip,
  CoachingEmployeeDetail,
  CoachingSummary,
  CoachingView,
  ManagerActionRequestBody,
  ManagerCoachingPlan,
  ManagerPlanStatus,
} from '@/types/coaching-plan'
import { PREVIEW_COACHING_SUMMARY } from '@/lib/kpi-preview-data'

const MOCK_PLANS: ManagerCoachingPlan[] = [
  { plan_id: 'demo-plan-101', escalation_id: 'demo-escalation-101', signal_id: 'demo-signal-101', user_id: 'demo-employee-101', store_id: 'STORE-001', category: 'Hospitality', plan: { opening_recognition: 'Recognize Marcus for steady customer engagement.', what_to_notice: 'Greeting consistency varies during busy periods.', why_it_matters: 'A warm greeting improves the first impression.', what_to_ask: 'What helps you stay present during a rush?', what_to_practice: 'Use the welcome checklist on the next shift.', how_to_follow_up: 'Review customer feedback next week.', confidence_note: 'Based on recent demo observations.' }, status: 'in_progress', cost: 1, actions: [], created_at: '2026-05-12T10:00:00Z', updated_at: '2026-05-13T10:00:00Z' },
  { plan_id: 'demo-plan-102', escalation_id: 'demo-escalation-102', signal_id: 'demo-signal-102', user_id: 'demo-employee-102', store_id: 'STORE-001', category: 'Product Knowledge', plan: { opening_recognition: 'Jessica has made progress explaining product features.', what_to_notice: 'Some product comparisons need more confidence.', why_it_matters: 'Clear recommendations help customers choose.', what_to_ask: 'Which product differences are hardest to explain?', what_to_practice: 'Practice two product comparisons with a teammate.', how_to_follow_up: 'Check in after three shifts.', confidence_note: 'Based on recent demo observations.' }, status: 'open', cost: 1, actions: [], created_at: '2026-05-14T10:00:00Z', updated_at: '2026-05-14T10:00:00Z' },
  { plan_id: 'demo-plan-103', escalation_id: 'demo-escalation-103', signal_id: 'demo-signal-103', user_id: 'demo-employee-103', store_id: 'STORE-001', category: 'Checkout Speed', plan: { opening_recognition: 'Avery remains calm while supporting customers.', what_to_notice: 'Checkout speed slows when the queue grows.', why_it_matters: 'Shorter waits improve the close of a visit.', what_to_ask: 'Which register steps interrupt your flow?', what_to_practice: 'Review the quick checkout sequence.', how_to_follow_up: 'Compare timing at the next one-to-one.', confidence_note: 'Based on recent demo observations.' }, status: 'resolved', cost: 1, actions: [], created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-10T10:00:00Z', resolved_at: '2026-05-10T10:00:00Z' },
]

const MOCK_EMPLOYEES: CoachingEmployeeChip[] = [
  { user_id: 'demo-employee-101', name: 'Marcus Rivera', role_title: 'Sales Associate', health: 'amber', total_issues: 2 },
  { user_id: 'demo-employee-102', name: 'Jessica Chen', role_title: 'Shift Lead', health: 'green', total_issues: 1 },
  { user_id: 'demo-employee-103', name: 'Avery Patel', role_title: 'Sales Associate', health: 'red', total_issues: 3 },
]

interface ListSignalsResponse {
  success: boolean
  count: number
  signals: ManagerCoachingPlan[]
}

interface SignalResponse {
  success: boolean
  signal: ManagerCoachingPlan
}

export interface FetchManagerCoachingPlansParams {
  token: string
  employeeId?: string
  status?: ManagerPlanStatus | ManagerPlanStatus[]
  storeId?: string
  startDate?: string
  endDate?: string
  view?: string
}

export async function fetchManagerCoachingPlans({
  token,
  employeeId,
  status,
  storeId,
  startDate,
  endDate,
  view,
}: FetchManagerCoachingPlansParams): Promise<ManagerCoachingPlan[]> {
  if (token.includes('mock')) {
    return MOCK_PLANS.filter((plan) => (!employeeId || plan.user_id === employeeId) && (!storeId || plan.store_id === storeId) && (!status || (Array.isArray(status) ? status.includes(plan.status) : status === plan.status)))
  }
  const { data } = await pythia2Client.get<ListSignalsResponse>(PYTHIA_2_API.managerCoaching.signals, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      employee_id: employeeId || undefined,
      status: Array.isArray(status) ? status.join(',') : status || undefined,
      store_id: storeId || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      view: view || undefined,
    },
  })
  return data.signals || []
}

export interface ApplyManagerPlanActionParams {
  token: string
  planId: string
  body: ManagerActionRequestBody
}

export async function applyManagerPlanAction({
  token,
  planId,
  body,
}: ApplyManagerPlanActionParams): Promise<ManagerCoachingPlan> {
  if (token.includes('mock')) {
    const plan = MOCK_PLANS.find((item) => item.plan_id === planId)
    if (!plan) throw new Error('Demo coaching plan not found')
    if (body.action === 'resolved') plan.status = 'resolved'
    if (body.action === 'dismissed') plan.status = 'dismissed'
    if (body.edits) plan.plan = { ...plan.plan, ...body.edits }
    plan.updated_at = new Date().toISOString()
    return plan
  }
  const { data } = await pythia2Client.patch<SignalResponse>(PYTHIA_2_API.managerCoaching.signal(planId), body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.signal
}

interface SummaryResponse extends CoachingSummary {
  success: boolean
}

interface EffectivenessResponse {
  success: boolean
  count: number
  categories: CoachingEffectivenessRow[]
}

interface EmployeesResponse {
  success: boolean
  count: number
  employees: CoachingEmployeeChip[]
}

interface EmployeeDetailResponse extends CoachingEmployeeDetail {
  success: boolean
}

export interface FetchCoachingViewParams {
  token: string
  view?: CoachingView
  storeId?: string
  startDate?: string
  endDate?: string
}

export async function fetchCoachingSummary({
  token,
  view = 'month',
  storeId,
  startDate,
  endDate,
}: FetchCoachingViewParams): Promise<CoachingSummary> {
  if (token.includes('mock')) {
    if (startDate && endDate) {
      return {
        ...PREVIEW_COACHING_SUMMARY,
        view: 'custom',
        month_start: startDate,
      }
    }
    return PREVIEW_COACHING_SUMMARY
  }
  const { data } = await pythia2Client.get<SummaryResponse>(PYTHIA_2_API.managerCoaching.summary, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      view,
      store_id: storeId || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    },
  })
  return data
}

export async function fetchCoachingEffectiveness({
  token,
  view = 'month',
  storeId,
  startDate,
  endDate,
}: FetchCoachingViewParams): Promise<CoachingEffectivenessRow[]> {
  if (token.includes('mock')) {
    return [
      { category: 'Hospitality', total: 4, resolved: 2, in_progress: 1, stalled: 1, resolved_pct: 50, avg_weeks_to_resolve: 2.5 },
      { category: 'Product Knowledge', total: 3, resolved: 2, in_progress: 1, stalled: 0, resolved_pct: 67, avg_weeks_to_resolve: 2 },
      { category: 'Checkout Speed', total: 2, resolved: 1, in_progress: 1, stalled: 0, resolved_pct: 50, avg_weeks_to_resolve: 3 },
    ]
  }
  const { data } = await pythia2Client.get<EffectivenessResponse>(PYTHIA_2_API.managerCoaching.effectiveness, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      view,
      store_id: storeId || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    },
  })
  return data.categories || []
}

export interface FetchCoachingEmployeesParams {
  token: string
  storeId?: string
  startDate?: string
  endDate?: string
  view?: CoachingView
}

export async function fetchCoachingEmployees({
  token,
  storeId,
  startDate,
  endDate,
  view,
}: FetchCoachingEmployeesParams): Promise<CoachingEmployeeChip[]> {
  if (token.includes('mock')) {
    return MOCK_EMPLOYEES.filter((employee) => !storeId || storeId === 'STORE-001')
  }
  const { data } = await pythia2Client.get<EmployeesResponse>(PYTHIA_2_API.managerCoaching.employees, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      store_id: storeId || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      view: view || undefined,
    },
  })
  return data.employees || []
}

export interface FetchEmployeeCoachingDetailParams {
  token: string
  userId: string
  days?: number
  startDate?: string
  endDate?: string
  view?: string
  storeId?: string
}

export async function fetchEmployeeCoachingDetail({
  token,
  userId,
  days,
  startDate,
  endDate,
  view,
  storeId,
}: FetchEmployeeCoachingDetailParams): Promise<CoachingEmployeeDetail> {
  if (token.includes('mock')) {
    const employee = MOCK_EMPLOYEES.find((item) => item.user_id === userId) ?? MOCK_EMPLOYEES[0]
    const plans = MOCK_PLANS.filter((plan) => plan.user_id === employee.user_id)
    return {
      user_id: employee.user_id, days: days || 30,
      summary: PREVIEW_COACHING_SUMMARY,
      signals: plans.map((plan) => ({ signal_id: plan.signal_id, category: plan.category, issue_title: `${plan.category} coaching`, coach_quote: plan.plan.what_to_notice, status: plan.status === 'resolved' ? 'resolved' : plan.status === 'in_progress' ? 'in_progress' : 'stalled', first_score: 70, current_score: 78, score_delta: 8, weeks_tracked: 3, first_flagged_at: plan.created_at, resolved_at: plan.resolved_at ?? null })),
      categories: [{ category: 'Hospitality', total: 2, resolved: 1, in_progress: 1, stalled: 0, resolved_pct: 50, avg_weeks_to_resolve: 2 }],
    }
  }
  const { data } = await pythia2Client.get<EmployeeDetailResponse>(PYTHIA_2_API.managerCoaching.employeeDetail(userId), {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      days: days ?? undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      view: view || undefined,
      store_id: storeId || undefined,
    },
  })
  return data
}
