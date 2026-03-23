import { ReactNode } from 'react'
import styles from './Panel.module.css'

interface PanelProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  children: ReactNode
  noPadding?: boolean
}

export default function Panel({ title, subtitle, badge, children, noPadding }: PanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>{title}</p>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
        </div>
        {badge}
      </div>
      <div className={noPadding ? '' : styles.body}>{children}</div>
    </div>
  )
}
