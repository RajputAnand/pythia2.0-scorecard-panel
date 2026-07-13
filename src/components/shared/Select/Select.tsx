'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SelectProps } from '@/types/select'

export default function Select({ value, options, onChange, ariaLabel }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Popup is portaled to <body> and positioned via fixed coordinates so an
  // ancestor's overflow:hidden (e.g. a table card's rounded-corner clip)
  // can't cut it off.
  useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width })
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const activeOption = options.find((o) => o.value === value)

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="cursor-pointer flex items-center gap-[7px] font-sans font-medium text-secondary bg-surface border border-border rounded-lg transition-all duration-150 hover:bg-surface-alt hover:text-primary text-[12px] px-3 py-[6px] whitespace-nowrap"
      >
        <span>{activeOption?.label ?? value}</span>
        <svg
          className={`w-[10px] h-[10px] shrink-0 text-muted transition-transform duration-200${open ? ' rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        position &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            aria-label={ariaLabel}
            style={{ position: 'fixed', top: position.top, left: position.left, minWidth: position.width }}
            className="bg-surface border border-border rounded-[10px] p-[4px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] list-none m-0 z-50"
          >
            {options.map((option) => {
              const active = option.value === value
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`rounded-md cursor-pointer transition-colors duration-100 px-[10px] py-[7px] text-[12.5px] whitespace-nowrap ${
                    active ? 'bg-accent-light text-accent font-medium' : 'text-primary hover:bg-surface-alt'
                  }`}
                >
                  {option.label}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </div>
  )
}
