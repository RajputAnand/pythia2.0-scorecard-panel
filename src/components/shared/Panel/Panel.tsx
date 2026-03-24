import { ReactNode } from 'react'

interface PanelProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  children: ReactNode
  noPadding?: boolean
}

export default function Panel({ title, subtitle, badge, children, noPadding }: PanelProps) {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-start justify-between gap-[10px] border-b border-border px-5 py-[15px]">
        <div>
          <p className="font-semibold text-[13.5px]">{title}</p>
          {subtitle && <p className="text-muted text-[11.5px] mt-0.5">{subtitle}</p>}
        </div>
        {badge}
      </div>
      <div className={noPadding ? '' : 'px-5 py-[18px]'}>{children}</div>
    </div>
  )
}
