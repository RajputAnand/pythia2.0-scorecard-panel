'use client'

import { useState, useEffect } from 'react'
import type { User } from '@/types/user'
import OwnerOnboardingModal, { OWNER_TIPS } from '@/components/OwnerOnboardingModal/OwnerOnboardingModal'

interface OwnerOnboardingBannerProps {
  user?: User
}

export default function OwnerOnboardingBanner({ user }: OwnerOnboardingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const role = (user?.role || '').toLowerCase()
  const isFirstLogin = Boolean(user?.first_login)
  const storageKey = `pythia_owner_guide_dismissed_${user?.id || user?.email || 'owner'}`

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const dismissed = localStorage.getItem(storageKey) === 'true'
        if (dismissed) {
          setIsDismissed(true)
        }
      } catch {}
    }, 0)

    // Listen to custom step changes emitted from inside the modal
    function handleStepEvent(e: Event) {
      const customEvent = e as CustomEvent<{ step: number }>
      if (typeof customEvent.detail?.step === 'number') {
        setStepIndex(customEvent.detail.step)
      }
    }

    // Listen to global open event
    function handleOpenEvent(e: Event) {
      const customEvent = e as CustomEvent<{ step?: number }>
      if (typeof customEvent.detail?.step === 'number') {
        setStepIndex(customEvent.detail.step)
      }
      setIsModalOpen(true)
    }

    window.addEventListener('pythia-owner-guide-step', handleStepEvent)
    window.addEventListener('pythia-open-owner-guide', handleOpenEvent)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('pythia-owner-guide-step', handleStepEvent)
      window.removeEventListener('pythia-open-owner-guide', handleOpenEvent)
    }
  }, [storageKey])

  // ONLY show if:
  // 1. Role is owner (or owner path)
  // 2. first_login flag is strictly true in the user object
  // 3. Not dismissed or closed
  if (role && role !== 'owner') return null
  if (!isFirstLogin) return null
  if (isDismissed) return null

  function handleDismiss() {
    setIsDismissed(true)
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {}
  }

  function handleOpenGuide(initialIdx = 0) {
    setStepIndex(initialIdx)
    setIsModalOpen(true)
  }

  const displayName = user?.name ? user.name.split(' ')[0] : 'Store Owner'

  return (
    <>
      {/* Onboarding Banner */}
      <div className="mx-[30px] mt-4 mb-1">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-light/90 via-surface to-surface border border-accent/30 p-5 shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Top decorative accent pill */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-accent text-white shadow-2xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Owner Welcome Guide
              </span>
              <span className="text-[12px] font-medium text-secondary hidden sm:inline">
                How to use your Pythia Owner Panel
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="text-muted hover:text-primary cursor-pointer p-1 rounded-md hover:bg-surface-alt transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Banner Headline & Description */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-2xl">
              <h2 className="text-[16px] font-bold text-primary tracking-tight">
                Welcome to Pythia, {displayName}!
              </h2>
              <p className="text-[13px] text-secondary leading-relaxed">
                Get your organization ready by following key setup steps: create your stores, assign managers, onboard frontline staff, and discover real-time ROI attribution.
              </p>
            </div>

            {/* Main Call to Action Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenGuide(0)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-accent hover:bg-accent-mid shadow-xs cursor-pointer transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Launch Interactive Guide</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl text-[12.5px] font-medium text-secondary hover:text-primary hover:bg-surface-alt border border-border/80 cursor-pointer transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Quick-Jump Step Cards / Chips */}
          <div className="mt-4 pt-3.5 border-t border-accent/15">
            <div className="text-[11.5px] font-medium text-secondary mb-2 uppercase tracking-wider">
              Explore Setup Topics:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {OWNER_TIPS.map((tip, idx) => (
                <button
                  key={tip.id}
                  type="button"
                  onClick={() => handleOpenGuide(idx)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface/90 hover:bg-surface border border-border hover:border-accent/40 shadow-2xs hover:shadow-xs transition-all text-left cursor-pointer group"
                >
                  <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold ${tip.badgeColor.bg} ${tip.badgeColor.text}`}>
                    {tip.step}
                  </span>
                  <span className="text-[12px] font-medium text-primary group-hover:text-accent truncate">
                    {tip.title.replace(/^\d+\.\s*/, '')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-step Carousel Modal */}
      <OwnerOnboardingModal
        isOpen={isModalOpen}
        initialStepIndex={stepIndex}
        onClose={() => {
          setIsModalOpen(false)
          handleDismiss()
        }}
        onComplete={() => {
          setIsModalOpen(false)
          handleDismiss()
        }}
      />
    </>
  )
}
