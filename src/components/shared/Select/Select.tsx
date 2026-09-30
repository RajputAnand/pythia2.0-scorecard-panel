'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SelectProps } from '@/types/select'

export default function Select({
  value,
  options,
  onChange,
  ariaLabel,
  fullWidth = false,
  className = '',
  triggerClassName = '',
}: SelectProps) {
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

  const activeOption = options.find((o) => o.value === value)

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={
          fullWidth
            ? `cursor-pointer w-full flex items-center justify-between gap-[7px] font-sans font-medium text-primary bg-surface-alt border border-border rounded-lg transition-all duration-150 hover:border-accent text-[12.5px] px-3 py-2 ${triggerClassName}`
            : `cursor-pointer flex items-center gap-[7px] font-sans font-medium text-secondary bg-surface border border-border rounded-lg transition-all duration-150 hover:bg-surface-alt hover:text-primary text-[12px] px-3 py-[6px] whitespace-nowrap ${triggerClassName}`
        }
      >
        <span>{activeOption?.label ?? value}</span>
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
            aria-label={ariaLabel}
            style={{
              position: 'fixed',
              ...(position.top !== undefined ? { top: `${position.top}px` } : {}),
              ...(position.bottom !== undefined ? { bottom: `${position.bottom}px` } : {}),
              left: `${position.left}px`,
              minWidth: `${position.width}px`,
              maxHeight: `${position.maxHeight}px`,
            }}
            className="bg-surface border border-border rounded-[10px] p-[4px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] list-none m-0 z-[9999] overflow-y-auto"
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
