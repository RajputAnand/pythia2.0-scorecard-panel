import Sidebar from '@/components/Sidebar/Sidebar'
import styles from './layout.module.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>{children}</div>
    </div>
  )
}
