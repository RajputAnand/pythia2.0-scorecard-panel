import { ReactNode } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-surface border-b border-border px-[30px] h-[58px]">
      <div className="flex items-center gap-[14px]">
        <span className="font-semibold text-[15.5px]">{title}</span>
        {subtitle && (
          <span className="font-mono text-secondary bg-surface-alt border border-border rounded-[20px] text-[10.5px] px-[10px] py-[4px]">
            {subtitle}
          </span>
        )}
      </div>
      {children && <div className="flex items-center gap-[10px]">{children}</div>}
    </header>
  )
}

export { styles as headerStyles }
