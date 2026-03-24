'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Sidebar.module.css'
import { DEMO_USER } from '@/lib/demo-user'
import type { ReactNode } from 'react'
import { UserRole } from '@/types/user'
import { useSwagStore } from '@/store/swagStore'

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
        href: '#owner-dashboard',
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
        href: '#owner-employee',
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
        href: '/owner/roi-attribution',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
      {
        label: 'Benchmarking',
        href: '/owner/benchmarking',
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
        href: '/owner/marketing-loop',
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

const MANAGER_NAV: NavSection[] = [
  {

    section: 'Navigate',
    items: [
      {
        label: 'Dashboard',
        href: '#manager-dashboard',
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
        href: '#manager-employee',
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
    section: 'Manager Tools',
    items: [
      {
        label: 'Coach Tracker',
        href: '/manager/coaching-tracker',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        label: 'Staffing',
        href: '/manager/staffing-intelligence',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
    ],
  },
]

const NAV_BY_ROLE: Record<string, NavSection[]> = {
  employee: EMPLOYEE_NAV,
  owner: OWNER_NAV,
  manager: MANAGER_NAV,
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = DEMO_USER
  const [activeView, setActiveView] = useState<UserRole>(user.role)

  const navSections = NAV_BY_ROLE[activeView]
  const points = useSwagStore((s) => s.points)

  // function handleViewToggle(view: UserRole) {
  //   if (user.role != "owner") return
  //   setActiveView(view)
  //   if (view === 'owner') router.push('/owner/roi-attribution')
  //   else router.push('/manager/coaching-tracker')
  // }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col bg-surface border-r border-border w-[210px]">
      {/* Logo */}
      <div className="flex items-center gap-[10px] px-5 border-b border-border pt-[22px] pb-[20px]">
        <div className="flex items-center justify-center shrink-0 rounded-[9px] bg-primary w-8 h-8">
          <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path stroke="white" strokeWidth="1.5" d="M12 2v3M12 19v3M2 12h3M19 12h3" fill="none" />
          </svg>
        </div>
        <div>
          <div className="text-[13.5px] font-semibold">Pythia</div>
          <div className="text-[10px] text-muted mt-px">Scorecard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        {navSections.map((section) => (
          <div key={section.section}>
            <div className="block px-2 uppercase text-muted font-medium tracking-[.1em] text-[9.5px] mt-[14px] mb-[5px]">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[9px] px-2 py-[9px] rounded-lg text-[13px] cursor-pointer transition-all duration-150 no-underline hover:bg-surface-alt hover:text-primary ${isActive ? 'bg-accent-light text-accent font-medium' : 'text-secondary'
                    }`}
                >
                  <span className={`shrink-0 w-[15px] h-[15px] ${isActive ? 'opacity-100' : 'opacity-75'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto font-mono font-bold text-white bg-danger rounded-[10px] text-[9.5px] px-[6px] py-px">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom widget — role-specific */}
      {user.role === 'employee' ? (
        <div
          className="flex items-center gap-[10px] mx-3 mb-5 rounded-[10px] border px-[14px] py-[12px]"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-light), #D0EAD8)', borderColor: '#B8D9C6' }}
        >
          <div className="flex items-center justify-center shrink-0 rounded-full bg-accent text-white font-bold w-9 h-9 text-[12px]">
            {user.initials}
          </div>
          <div>
            <div className="text-[12.5px] font-semibold text-accent">{user.name}</div>
            <div className="text-accent-mid text-[10.5px]">{user.jobTitle} · {user.storeName}</div>
          </div>
          {user.score != null && (
            <div className="ml-auto text-right">
              <div className="font-mono font-bold text-accent text-[18px]">{user.score}</div>
              <div className="font-mono font-bold text-[11px]" style={{ color: '#F5C842' }}>{points.toLocaleString()} pts</div>
            </div>
          )}
        </div>
      ) : (
        <>
          {user.role === 'owner' && (
            <div className="mx-3 pt-4 border-t border-border mb-4">
              <div className="text-muted uppercase tracking-[.08em] text-[10px] mb-2 px-[2px]">Current View</div>
              <button
                className={`${styles.toggleBtn} ${activeView === 'owner' ? styles.toggleBtnActive : ''}`}
                // onClick={() => handleViewToggle('owner')}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Owner View
              </button>
              <button
                className={`${styles.toggleBtn} ${activeView === 'manager' ? styles.toggleBtnActive : ''}`}
                // onClick={() => handleViewToggle('manager')}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                </svg>
                Manager View
              </button>
            </div>
          )}
          <div className="flex items-center gap-[9px] mx-3 mb-5 rounded-[10px] bg-surface-alt px-[12px] py-[10px]">
            <div className={styles.liveDot} />
            <div>
              <div className="text-[12px] font-medium">{user.storeName}</div>
              <div className="text-muted text-[10.5px]">{user.storeLoc} · {user.nodesOnline} nodes online</div>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
