import { ReactNode } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.dateChip}>{subtitle}</span>}
      </div>
      {children && <div className={styles.right}>{children}</div>}
    </header>
  )
}
