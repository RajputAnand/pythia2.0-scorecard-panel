'use client'

import { ReactNode } from 'react'

export interface ToolbarProps {
  children?: ReactNode
  left?: ReactNode
  right?: ReactNode
  sticky?: boolean
  className?: string
}

export default function Toolbar({
  children,
  left,
  right,
  sticky = false,
  className = '',
}: ToolbarProps) {
  const stickyClass = sticky ? 'sticky top-[58px] z-[9]' : ''

  if (left !== undefined || right !== undefined) {
    return (
      <div
        className={`flex items-center justify-between gap-3 bg-surface border-b border-border px-4 lg:px-[30px] min-h-[50px] py-1.5 flex-wrap ${stickyClass} ${className}`.trim()}
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {left}
        </div>
        {right && (
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {right}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 bg-surface border-b border-border px-4 lg:px-[30px] min-h-[50px] py-1.5 flex-wrap ${stickyClass} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
