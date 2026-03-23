'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'
import { DEMO_USER } from '@/lib/demo-user'
import type { ReactNode } from 'react'

type NavItem = { label: string; href: string; badge?: number | null; icon: ReactNode }
type NavSection = { section: string; items: NavItem[] }

const EMPLOYEE_NAV: NavSection[] = [
  {
    section: 'My Dashboard',
    items: [
      {
        label: 'Overview',
        href: '/dashboard/overview',
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
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
      {
        label: 'Swag Store',
        href: '/dashboard/swag',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        ),
      },
    ],
  },
]

const OWNER_NAV: NavSection[] = [
  {
    section: 'Navigate',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard/overview',
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
        label: 'Employees',
        href: '/dashboard/employees',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Owner Tools',
    items: [
      {
        label: 'ROI Attribution',
        href: '/dashboard/roi-attribution',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
      {
        label: 'Benchmarking',
        href: '/dashboard/benchmarking',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
          </svg>
        ),
      },
      {
        label: 'Marketing Loop',
        href: '/dashboard/marketing-loop',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
]

const NAV_BY_ROLE: Record<string, NavSection[]> = {
  employee: EMPLOYEE_NAV,
  owner: OWNER_NAV,
  manager: OWNER_NAV,
}

export default function Sidebar() {
  const pathname = usePathname()
  const [activeView, setActiveView] = useState<'owner' | 'manager'>('owner')
  const user = DEMO_USER
  const navSections = NAV_BY_ROLE[user.role] ?? EMPLOYEE_NAV

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
        {navSections.map((section) => (
          <div key={section.section}>
            <div className={styles.navLabel}>{section.section}</div>
            {section.items.map((item) => {
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
          </div>
        ))}
      </nav>

      {/* Bottom widget — role-specific */}
      {user.role === 'employee' ? (
        <div className={styles.empPill}>
          <div className={styles.empAvatar}>{user.initials}</div>
          <div>
            <div className={styles.empName}>{user.name}</div>
            <div className={styles.empRole}>{user.jobTitle} · {user.storeName}</div>
          </div>
          {user.score != null && <div className={styles.empScore}>{user.score}</div>}
        </div>
      ) : (
        <>
          <div className={styles.viewToggle}>
            <div className={styles.toggleLabel}>Current View</div>
            <button
              className={`${styles.toggleBtn} ${activeView === 'owner' ? styles.toggleBtnActive : ''}`}
              onClick={() => setActiveView('owner')}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Owner View
            </button>
            <button
              className={`${styles.toggleBtn} ${activeView === 'manager' ? styles.toggleBtnActive : ''}`}
              onClick={() => setActiveView('manager')}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              </svg>
              Manager View
            </button>
          </div>
          <div className={styles.storePill}>
            <div className={styles.liveDot} />
            <div>
              <div className={styles.storeName}>{user.storeName}</div>
              <div className={styles.storeLoc}>{user.storeLoc} · {user.nodesOnline} nodes online</div>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
