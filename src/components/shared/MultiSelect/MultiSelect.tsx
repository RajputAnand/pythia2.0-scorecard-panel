'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MultiSelectProps } from '@/types/select'

export default function MultiSelect({
  values,
  options,
  onChange,
  placeholder = 'Select…',
  ariaLabel,
  invalid = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{
    top?: number
    bottom?: number
    left: number
    width: number
    maxHeight: number
  } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const spaceBelow = viewportHeight - rect.bottom - 10
      const spaceAbove = rect.top - 10

      // Open upwards if space below is limited (< 220px) and there is more space above
      const openUpwards = spaceBelow < 220 && spaceAbove > spaceBelow
      const maxHeight = Math.max(100, Math.min(240, openUpwards ? spaceAbove : spaceBelow))
      const left = Math.max(8, Math.min(rect.left, viewportWidth - rect.width - 8))

      if (openUpwards) {
        setPosition({
          bottom: viewportHeight - rect.top + 6,
          left,
          width: rect.width,
          maxHeight,
        })
      } else {
        setPosition({
          top: rect.bottom + 6,
          left,
          width: rect.width,
          maxHeight,
        })
      }
    }

    updatePosition()

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  const selected = options.filter((o) => values.includes(o.value))
  const label =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
        ? selected.map((o) => o.label).join(', ')
        : `${selected.length} stores selected`

  function toggle(value: string | number) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`w-full flex items-center justify-between gap-2 bg-surface-alt border rounded-lg px-3 py-[10px] text-[13.5px] text-left transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer ${
          invalid ? 'border-danger' : 'border-border'
        }`}
      >
        <span className={selected.length === 0 ? 'text-gray-800' : 'text-primary'}>{label}</span>
        <svg
          className={`w-[10px] h-[10px] shrink-0 text-gray-800 transition-transform duration-200${open ? ' rotate-180' : ''}`}
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
            aria-multiselectable="true"
            aria-label={ariaLabel}
            style={{
              position: 'fixed',
              ...(position.top !== undefined ? { top: `${position.top}px` } : {}),
              ...(position.bottom !== undefined ? { bottom: `${position.bottom}px` } : {}),
              left: `${position.left}px`,
              minWidth: `${position.width}px`,
              maxWidth: `${position.width}px`,
              maxHeight: `${position.maxHeight}px`,
            }}
            className="overflow-y-auto bg-surface border border-border rounded-[10px] p-[4px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] list-none m-0 z-[60]"
          >
            {options.map((option) => {
              const active = values.includes(option.value)
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={active}
                  onClick={() => toggle(option.value)}
                  className={`flex items-center gap-2 rounded-md cursor-pointer transition-colors duration-100 px-[10px] py-[7px] text-[12.5px] ${
                    active ? 'bg-accent-light text-accent font-medium' : 'text-primary hover:bg-surface-alt'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-[15px] h-[15px] shrink-0 rounded-[4px] border ${
                      active ? 'bg-accent border-accent text-white' : 'border-border bg-surface'
                    }`}
                  >
                    {active && (
                      <svg className="w-[10px] h-[10px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{option.label}</span>
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </div>
  )
}
