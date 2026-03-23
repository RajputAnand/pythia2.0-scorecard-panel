'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/dashboard/overview',
    badge: null,
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'My Progress',
    href: '/dashboard/progress',
    badge: null,
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Coaching',
    href: '/dashboard/coaching',
    badge: 2,
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Leaderboard',
    href: '/dashboard/leaderboard',
    badge: null,
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: 'Swag Store',
    href: '/dashboard/swag',
    badge: null,
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path stroke="white" strokeWidth="1.5" d="M12 2v3M12 19v3M2 12h3M19 12h3" fill="none" />
          </svg>
        </div>
        <div>
          <div className={styles.logoText}>Pythia</div>
          <div className={styles.logoSub}>Scorecard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLabel}>My Dashboard</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={`${styles.navIcon} ${isActive ? styles.navIconActive : ''}`}>
                {item.icon}
              </span>
              {item.label}
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Employee pill */}
      <div className={styles.empPill}>
        <div className={styles.empAvatar}>MR</div>
        <div>
          <div className={styles.empName}>Marcus R.</div>
          <div className={styles.empRole}>Cashier · Main St.</div>
        </div>
        <div className={styles.empScore}>84</div>
      </div>
    </aside>
  )
}
