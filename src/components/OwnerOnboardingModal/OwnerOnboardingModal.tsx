'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface OnboardingTip {
  id: string
  step: number
  category: string
  title: string
  subtitle: string
  route: string
  routeLabel: string
  badgeColor: {
    bg: string
    text: string
    border: string
    iconBg: string
  }
  keyPoints: string[]
  icon: React.ReactNode
}

export const OWNER_TIPS: OnboardingTip[] = [
  {
    id: 'stores',
    step: 1,
    category: 'Infrastructure & Hardware',
    title: 'Create & Configure Stores',
    subtitle: 'Register physical store locations and link on-site sensor hardware for real-time customer monitoring.',
    route: '/owner/stores',
    routeLabel: 'Go to Store Management',
    badgeColor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    keyPoints: [
      'Add store numbers, official names, street addresses, and local timezones.',
      'Generate edge device pairing codes (e.g. PAIR-1042-ABCD) to connect Raspberry Pi sensors.',
      'Monitor live camera and microphone health telemetry for drive-thrus and front registers.',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75M4.5 10.5V20.25a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75V10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: 'managers',
    step: 2,
    category: 'Store Leadership',
    title: 'Assign Store Managers',
    subtitle: 'Appoint store managers to lead daily operations, run coaching workflows, and review team KPIs.',
    route: '/owner/users?role=manager',
    routeLabel: 'Manage Store Managers',
    badgeColor: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    keyPoints: [
      'Create manager accounts and assign each to one or multiple store locations.',
      'Managers gain dedicated tools: Coaching Effectiveness Tracker, Staffing AI, and Swag fulfillment.',
      'Track manager coaching activity and shift escalation responses across your network.',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v1.069m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
  },
  {
    id: 'employees',
    step: 3,
    category: 'Frontline Staffing',
    title: 'Onboard Frontline Employees',
    subtitle: 'Add cashiers, drive-thru attendants, and crew members to enable automated speech & face attribution.',
    route: '/owner/users?role=employee',
    routeLabel: 'Manage Employees',
    badgeColor: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      iconBg: 'bg-teal-100 text-teal-700',
    },
    keyPoints: [
      'Register employee rosters and assign them to specific shift store locations.',
      'On-device AI automatically attributes customer conversations and faces to individual staff members.',
      'Track hospitality scores, suggestive upselling rates, and speed-of-service in real time.',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: 'co-owners',
    step: 4,
    category: 'Executive Management',
    title: 'Invite Co-Owners & Delegate Billing',
    subtitle: 'Provision partner accounts and control who can manage Stripe subscriptions and invoices.',
    route: '/owner/users?role=owner',
    routeLabel: 'Invite Co-Owners',
    badgeColor: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100 text-purple-700',
    },
    keyPoints: [
      'Invite executive co-owners or regional partners with access to all organization stores.',
      'Toggle subscription management permission to delegate Stripe customer billing access.',
      'Ensure secure credential management with temporary reveal passwords and instant deactivation.',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    id: 'roi',
    step: 5,
    category: 'Business Intelligence',
    title: 'Track Real-Time ROI Attribution',
    subtitle: 'Correlate employee hospitality performance with direct financial returns, ticket sizes, and speed.',
    route: '/owner/roi-attribution',
    routeLabel: 'Explore ROI Attribution',
    badgeColor: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    keyPoints: [
      'View dynamic charts linking hospitality score improvements to revenue lift and shorter dwell times.',
      'Benchmark performance across stores to spotlight top-performing locations.',
      'Generate multi-page non-breaking A4 PDF summaries formatted for investor and leadership reporting.',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    id: 'swag',
    step: 6,
    category: 'Culture & Gamification',
    title: 'Motivate Staff with Swag Rewards',
    subtitle: 'Turn great service into a game by offering merchandise, apparel, and rewards redeemed via score points.',
    route: '/owner/swag-store',
    routeLabel: 'Configure Swag Store',
    badgeColor: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
    },
    keyPoints: [
      'Create custom branded rewards (apparel, mugs, gift cards) with points costs and inventory counts.',
      'Employees automatically earn reward points when delivering exceptional customer service.',
      'Managers verify and fulfill orders directly from their panel with real-time balance deductions.',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
]

interface OwnerOnboardingModalProps {
  isOpen: boolean
  initialStepIndex?: number
  onClose: () => void
  onComplete?: () => void
}

export default function OwnerOnboardingModal({
  isOpen,
  initialStepIndex = 0,
  onClose,
  onComplete,
}: OwnerOnboardingModalProps) {
  const router = useRouter()
  const currentIndex = Math.max(0, Math.min(initialStepIndex, OWNER_TIPS.length - 1))
  const activeTip = OWNER_TIPS[currentIndex]

  function handleSelectStep(stepIdx: number) {
    if (stepIdx < 0 || stepIdx >= OWNER_TIPS.length) return
    // Trigger step change in parent or local state
    const event = new CustomEvent('pythia-owner-guide-step', { detail: { step: stepIdx } })
    window.dispatchEvent(event)
  }

  function handleNavigate(route: string) {
    onClose()
    if (onComplete) onComplete()
    router.push(route)
  }

  function handleFinish() {
    if (onComplete) onComplete()
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < OWNER_TIPS.length - 1) {
          handleSelectStep(currentIndex + 1)
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          handleSelectStep(currentIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, onClose])

  if (!isOpen) return null

  const isFirst = currentIndex === 0
  const isLast = currentIndex === OWNER_TIPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] px-4 py-6 overflow-y-auto transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Owner Panel Guide"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Header Bar */}
        <div className="w-full bg-surface-alt h-1.5 flex">
          {OWNER_TIPS.map((tip, idx) => (
            <div
              key={tip.id}
              className={`h-full transition-all duration-300 ${
                idx <= currentIndex ? 'bg-accent' : 'bg-transparent'
              }`}
              style={{ width: `${100 / OWNER_TIPS.length}%` }}
            />
          ))}
        </div>

        {/* Modal Top Nav */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${activeTip.badgeColor.bg} ${activeTip.badgeColor.text} ${activeTip.badgeColor.border}`}>
              Step {activeTip.step} of {OWNER_TIPS.length} • {activeTip.category}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-muted hover:text-primary cursor-pointer p-1.5 rounded-lg hover:bg-surface-alt transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Carousel Slide Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center p-3 shadow-xs ${activeTip.badgeColor.iconBg}`}>
              {activeTip.icon}
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[19px] font-bold text-primary tracking-tight">
                {activeTip.title}
              </h2>
              <p className="text-[13.5px] text-secondary leading-snug">
                {activeTip.subtitle}
              </p>
            </div>
          </div>

          {/* Key Insights / Instructions */}
          <div className="bg-surface-alt/70 border border-border/80 rounded-xl p-4 flex flex-col gap-2.5 mt-1">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              What you can do here
            </span>
            <ul className="flex flex-col gap-2">
              {activeTip.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-primary leading-relaxed">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[10px] font-bold mt-0.5">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Direct Link to Section */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => handleNavigate(activeTip.route)}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-accent hover:text-accent-mid cursor-pointer transition-colors group"
            >
              <span>{activeTip.routeLabel}</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            <span className="text-[12px] text-muted font-mono">
              {currentIndex + 1} / {OWNER_TIPS.length}
            </span>
          </div>
        </div>

        {/* Carousel Bottom Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-alt/40 border-t border-border">
          {/* Previous Button */}
          <button
            type="button"
            disabled={isFirst}
            onClick={() => handleSelectStep(currentIndex - 1)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-all ${
              isFirst
                ? 'opacity-35 cursor-not-allowed text-muted'
                : 'text-secondary hover:text-primary hover:bg-surface cursor-pointer border border-border/70'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Previous</span>
          </button>

          {/* Clickable Dot Indicators */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Tips navigation">
            {OWNER_TIPS.map((tip, idx) => (
              <button
                key={tip.id}
                type="button"
                role="tab"
                aria-selected={idx === currentIndex}
                aria-label={`Jump to tip ${tip.step}: ${tip.title}`}
                onClick={() => handleSelectStep(idx)}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-accent'
                    : 'w-2 h-2 bg-border hover:bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          {isLast ? (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-medium bg-accent text-white hover:opacity-90 cursor-pointer shadow-xs transition-all"
            >
              <span>Got it, Get Started!</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectStep(currentIndex + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-medium bg-primary text-white hover:opacity-90 cursor-pointer shadow-xs transition-all"
            >
              <span>Next Tip</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
