'use client'

import { useState } from 'react'
import type { CredentialsRevealProps } from '@/types/credentials-reveal'

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // clipboard access denied — the value is still visible to copy manually
    }
  }

  return (
    <div className="w-full flex flex-col gap-1 text-left">
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-alt px-3 py-[10px]">
        <code className="text-[14px] font-mono font-semibold text-primary tracking-wide truncate">{value}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-[11.5px] font-semibold text-accent hover:text-accent-mid cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function CredentialsReveal({ heading, message, userId, password, actionLabel, onAction }: CredentialsRevealProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-accent-light">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path
            d="M5 13l4 4L19 7"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-[16px] font-semibold text-primary">{heading}</h2>
      <p className="text-[12.5px] text-secondary leading-relaxed">{message}</p>

      <div className="w-full flex flex-col gap-3">
        <CopyField label="User ID" value={userId} />
        <CopyField label="Temporary password" value={password} />
      </div>

      <button
        type="button"
        onClick={onAction}
        className="w-full bg-accent text-white font-semibold text-[13.5px] rounded-lg py-[11px] hover:bg-accent-mid transition-colors cursor-pointer mt-1"
      >
        {actionLabel}
      </button>
    </div>
  )
}
