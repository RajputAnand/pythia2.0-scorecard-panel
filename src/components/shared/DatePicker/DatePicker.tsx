'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { DatePickerProps } from '@/types/date-picker'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function parseDate(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(value: string): string {
  const date = parseDate(value)
  if (!date) return 'Select date'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Weeks are built by walking back to the Sunday on/before the 1st of the
// month and forward to the Saturday on/after the last day, so every row is a
// full 7-day week and the grid never has a ragged first/last row.
function buildWeeks(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1)
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - start.getDay())

  const lastOfMonth = new Date(year, month + 1, 0)
  const end = new Date(lastOfMonth)
  end.setDate(end.getDate() + (6 - end.getDay()))

  const weeks: Date[][] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export default function DatePicker({ value, onChange, ariaLabel, min, max }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const selected = parseDate(value)
  const [viewYear, setViewYear] = useState(() => (selected ?? new Date()).getFullYear())
  const [viewMonth, setViewMonth] = useState(() => (selected ?? new Date()).getMonth())

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({ top: rect.bottom + 6, left: rect.left })
  }, [open])

  const handleToggle = () => {
    if (!open) {
      const current = selected ?? new Date()
      setViewYear(current.getFullYear())
      setViewMonth(current.getMonth())
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const minDate = min ? parseDate(min) : null
  const maxDate = max ? parseDate(max) : null
  const isDisabled = (date: Date) => Boolean((minDate && date < minDate) || (maxDate && date > maxDate))

  const goToMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const weeks = buildWeeks(viewYear, viewMonth)
  const todayKey = toDateKey(new Date())
  const selectedKey = selected ? toDateKey(selected) : null

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="cursor-pointer flex items-center gap-[6px] border border-border rounded-[7px] font-mono text-secondary bg-surface text-[11.5px] px-[10px] py-[5px] transition-colors duration-150 hover:border-accent focus:outline-none focus:border-accent"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-muted">
          <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1" />
          <path d="M1 4.5H11" stroke="currentColor" strokeWidth="1" />
          <path d="M3.5 1V2.5M8.5 1V2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        {formatDisplay(value)}
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={ariaLabel}
            style={{ position: 'fixed', top: position.top, left: position.left }}
            className="bg-surface border border-border rounded-[12px] p-[14px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.16),0_2px_8px_-2px_rgba(26,23,20,0.08)] z-50 w-[240px]"
          >
            <div className="flex items-center justify-between mb-[10px]">
              <span className="font-sans font-semibold text-primary text-[12.5px]">
                {new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-[2px]">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => goToMonth(-1)}
                  className="cursor-pointer flex items-center justify-center w-[22px] h-[22px] rounded-md text-secondary hover:bg-surface-alt hover:text-primary transition-colors duration-100"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M7.5 2.5L3.5 6L7.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => goToMonth(1)}
                  className="cursor-pointer flex items-center justify-center w-[22px] h-[22px] rounded-md text-secondary hover:bg-surface-alt hover:text-primary transition-colors duration-100"
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 2.5L8.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-[2px]">
              {WEEKDAY_LABELS.map((label, i) => (
                <div key={i} className="text-center font-mono text-muted text-[9.5px] py-[4px]">
                  {label}
                </div>
              ))}
            </div>

            {weeks.map((week, i) => (
              <div key={i} className="grid grid-cols-7">
                {week.map((date) => {
                  const key = toDateKey(date)
                  const inMonth = date.getMonth() === viewMonth
                  const isSelected = key === selectedKey
                  const isToday = key === todayKey
                  const disabled = isDisabled(date)

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onChange(key)
                        setOpen(false)
                      }}
                      className={`font-mono text-[11px] w-[30px] h-[30px] rounded-full transition-colors duration-100 ${
                        disabled
                          ? 'text-border cursor-not-allowed'
                          : isSelected
                            ? 'bg-accent text-white font-semibold cursor-pointer'
                            : isToday
                              ? 'text-accent font-semibold border border-accent cursor-pointer'
                              : inMonth
                                ? 'text-primary hover:bg-surface-alt cursor-pointer'
                                : 'text-muted hover:bg-surface-alt cursor-pointer'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            ))}

            <div className="flex items-center justify-between mt-[10px] pt-[10px] border-t border-border">
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
                className="cursor-pointer font-sans font-medium text-accent text-[11.5px] hover:underline"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  onChange(toDateKey(today))
                  setViewYear(today.getFullYear())
                  setViewMonth(today.getMonth())
                  setOpen(false)
                }}
                className="cursor-pointer font-sans font-medium text-accent text-[11.5px] hover:underline"
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
