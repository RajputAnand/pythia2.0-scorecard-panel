'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { applyManagerPlanAction } from '@/queries/manager-coaching'
import { extractApiErrorMessage } from '@/utils/common'
import { useToast } from '@/context/ToastContext'
import type { UseStalledCoachingPlansResult } from '@/hooks/useStalledCoachingPlans'
import type { ConversationPlan, ManagerCoachingPlan, ManagerPlanStatus } from '@/types/coaching-plan'

const PLAN_FIELDS: { key: keyof ConversationPlan; label: string }[] = [
  { key: 'opening_recognition', label: 'Opening Recognition' },
  { key: 'what_to_notice', label: 'What to Notice' },
  { key: 'why_it_matters', label: 'Why It Matters' },
  { key: 'what_to_ask', label: 'What to Ask' },
  { key: 'what_to_practice', label: 'What to Practice' },
  { key: 'how_to_follow_up', label: 'How to Follow Up' },
  { key: 'confidence_note', label: 'Confidence Note' },
]

const statusPillClass: Record<ManagerPlanStatus, string> = {
  open: 'bg-danger-light text-danger',
  acknowledged: 'bg-amber-light text-amber',
  in_progress: 'bg-amber-light text-amber',
  resolved: 'bg-accent-light text-accent',
  dismissed: 'bg-surface-alt text-muted',
}

const statusLabel: Record<ManagerPlanStatus, string> = {
  open: 'Needs Action',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

function weeksSince(dateStr: string): number {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  return Math.max(1, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)))
}

function PanelSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col animate-pulse">
      <div className="flex gap-2 px-[22px] py-[14px] border-b border-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-[30px] bg-border" />
        ))}
      </div>
      <div className="p-[22px] flex flex-col gap-3">
        <div className="h-40 w-full rounded-xl bg-border" />
      </div>
    </div>
  )
}

function PanelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">⚠️</span>
      <p className="font-semibold text-[14px]">Failed to load coaching plans</p>
      <p className="text-[12px] text-muted">Check your connection and try again.</p>
      <button
        className="mt-1 rounded-[8px] border-0 bg-accent px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-85 cursor-pointer"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}

function PanelEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">🎉</span>
      <p className="font-semibold text-[13px]">No stalled coaching plans</p>
      <p className="text-[11.5px] text-muted">Every AI-escalated issue currently has a manager decision on file.</p>
    </div>
  )
}

interface StalledPlansPanelProps {
  data: UseStalledCoachingPlansResult
}

export default function StalledPlansPanel({ data }: StalledPlansPanelProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()

  const { isLoading, isError, groups, retry, patchPlan } = data
  const [activeUserId, setActiveUserId] = useState<string | null>(null)

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<ConversationPlan | null>(null)
  const [editReason, setEditReason] = useState('')
  const [actionPendingId, setActionPendingId] = useState<string | null>(null)

  useEffect(() => {
    if (activeUserId && groups.some((g) => g.userId === activeUserId)) return
    if (groups.length > 0) setActiveUserId(groups[0].userId)
  }, [groups, activeUserId])

  const activeGroup = groups.find((g) => g.userId === activeUserId) ?? null

  function startEdit(plan: ManagerCoachingPlan) {
    setEditingPlanId(plan.plan_id)
    setEditDraft({ ...plan.plan })
    setEditReason('')
  }

  function cancelEdit() {
    setEditingPlanId(null)
    setEditDraft(null)
    setEditReason('')
  }

  async function saveEdit(plan: ManagerCoachingPlan) {
    if (!token || !editDraft) return
    if (!editReason.trim()) {
      showToast('A reason is required to save an edit.')
      return
    }
    setActionPendingId(plan.plan_id)
    try {
      const updated = await applyManagerPlanAction({
        token,
        planId: plan.plan_id,
        body: { action: 'edited', reason: editReason.trim(), edits: editDraft },
      })
      patchPlan(updated)
      cancelEdit()
      showToast('Coaching plan updated.')
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to update plan. Please try again.'))
    } finally {
      setActionPendingId(null)
    }
  }

  async function resolvePlan(plan: ManagerCoachingPlan) {
    if (!token) return
    setActionPendingId(plan.plan_id)
    try {
      const updated = await applyManagerPlanAction({
        token,
        planId: plan.plan_id,
        body: { action: 'resolved' },
      })
      patchPlan(updated)
      showToast('Marked as resolved.')
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to resolve plan. Please try again.'))
    } finally {
      setActionPendingId(null)
    }
  }

  if (isError) return <PanelError onRetry={retry} />
  if (isLoading) return <PanelSkeleton />
  if (groups.length === 0) return <PanelEmpty />

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col">
      {/* Employee Selector */}
      <div className="flex gap-2 px-[22px] py-[14px] border-b border-border overflow-x-auto">
        {groups.map((group) => (
          <button
            key={group.userId}
            onClick={() => setActiveUserId(group.userId)}
            className={`flex items-center gap-2 px-[14px] py-[7px] rounded-[30px] border cursor-pointer transition-all duration-150 whitespace-nowrap select-none font-sans ${
              activeUserId === group.userId
                ? 'bg-primary border-primary'
                : 'bg-surface border-border hover:border-accent'
            }`}
          >
            <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 bg-accent">
              {group.initials}
            </div>
            <span
              className={`text-[12.5px] font-medium ${activeUserId === group.userId ? 'text-white' : 'text-secondary'}`}
            >
              {group.name}
            </span>
            <div className="w-2 h-2 rounded-full shrink-0 bg-danger" />
          </button>
        ))}
      </div>

      {/* Active Employee's Plans */}
      {activeGroup && (
        <div className="flex flex-col gap-4 p-[22px]">
          {activeGroup.plans.map((plan) => {
            const isEditing = editingPlanId === plan.plan_id
            const isPending = actionPendingId === plan.plan_id

            return (
              <div key={plan.plan_id} className="border border-border rounded-[12px] overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-[16px] py-[12px] bg-surface-alt border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-[3px] rounded-[5px] bg-surface text-secondary uppercase tracking-wide">
                      {plan.category}
                    </span>
                    <span className={`text-[10.5px] font-semibold px-2 py-[3px] rounded-[5px] ${statusPillClass[plan.status]}`}>
                      {statusLabel[plan.status]}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted font-mono">
                    Escalated {weeksSince(plan.created_at)}+ week{weeksSince(plan.created_at) === 1 ? '' : 's'} ago
                  </span>
                </div>

                <div className="flex flex-col gap-3 px-[16px] py-[16px]">
                  {PLAN_FIELDS.map(({ key, label }) => {
                    if (!isEditing && !plan.plan[key]) return null
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-[.07em]">{label}</span>
                        {isEditing ? (
                          <textarea
                            value={editDraft?.[key] ?? ''}
                            onChange={(e) => setEditDraft((d) => (d ? { ...d, [key]: e.target.value } : d))}
                            rows={key === 'confidence_note' ? 2 : 3}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] outline-none focus:border-accent transition-colors duration-150 resize-y"
                          />
                        ) : (
                          <p className={`text-[12.5px] leading-[1.5] ${key === 'confidence_note' ? 'text-muted italic' : 'text-primary'}`}>
                            {plan.plan[key]}
                          </p>
                        )}
                      </div>
                    )
                  })}

                  {isEditing && (
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-[.07em]">
                        Reason for edit (required)
                      </span>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="e.g. Adjusted wording to match how I actually coach this employee"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] outline-none focus:border-accent transition-colors duration-150"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          disabled={isPending}
                          className="text-[12px] font-semibold text-secondary px-[14px] py-[7px] rounded-lg border border-border bg-surface hover:bg-surface-alt disabled:opacity-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(plan)}
                          disabled={isPending}
                          className="text-[12px] font-semibold text-white px-[14px] py-[7px] rounded-lg border-0 bg-primary hover:opacity-85 disabled:opacity-50 cursor-pointer"
                        >
                          {isPending ? 'Saving…' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(plan)}
                          disabled={isPending}
                          className="text-[12px] font-semibold text-secondary px-[14px] py-[7px] rounded-lg border border-border bg-surface hover:bg-surface-alt disabled:opacity-50 disabled:cursor-default cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => resolvePlan(plan)}
                          disabled={isPending}
                          className="text-[12px] font-semibold text-white px-[14px] py-[7px] rounded-lg border-0 bg-accent hover:opacity-85 disabled:opacity-50 disabled:cursor-default cursor-pointer"
                        >
                          {isPending ? 'Resolving…' : 'Resolve'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
