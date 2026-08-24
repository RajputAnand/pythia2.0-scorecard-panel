'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Sidebar.module.css'
import type { ReactNode } from 'react'
import type { User, UserRole } from '@/types/user'
import { useUserStore } from '@/store/userStore'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { PAGE_ID_BY_HREF } from '@/lib/admin-config-data'
import { logout } from '@/actions/auth'

type NavItem = {
  label: string
  href: string
  badge?: number | null
  icon: ReactNode
  /** For Super Admin's read-only mirror pages: the real page's href this item
   * mirrors, used to look up its page-level visibility toggle instead of
   * `href` (which points at the `/super-admin/...` mirror route, not a
   * PAGE_REGISTRY entry). Omit for regular, non-mirrored nav items. */
  mirrorsHref?: string
}
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
      // {
      //   label: 'My Progress',
      //   href: '/dashboard/progress',
      //   icon: (
      //     <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      //       <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      //     </svg>
      //   ),
      // },
      // {
      //   label: 'Coaching',
      //   href: '/dashboard/coaching',
      //   badge: 2,
      //   icon: (
      //     <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      //       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      //     </svg>
      //   ),
      // },
      // {
      //   label: 'Leaderboard',
      //   href: '/dashboard/leaderboard',
      //   icon: (
      //     <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      //       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      //     </svg>
      //   ),
      // },
      // {
      //   label: 'Swag Store',
      //   href: '/dashboard/swag',
      //   icon: (
      //     <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      //       <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      //       <line x1="3" y1="6" x2="21" y2="6" />
      //       <path d="M16 10a4 4 0 0 1-8 0" />
      //     </svg>
      //   ),
      // },
    ],
  },
]

const OWNER_NAV: NavSection[] = [
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
      // {
      //   label: 'Marketing Loop',
      //   href: '/owner/marketing-loop',
      //   icon: (
      //     <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      //       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      //       <circle cx="9" cy="7" r="4" />
      //       <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      //       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      //     </svg>
      //   ),
      // },
    ],
  },
]

const MANAGER_NAV: NavSection[] = [
  {

    section: 'Navigate',
    items: [
      {
        label: 'Dashboard',
        href: '/manager/dashboard',
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
        href: '/manager/employees',
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
      {
        label: 'Unknown Identity',
        href: '/manager/unknown-identities',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      },
      {
        label: 'Video Identities',
        href: '/manager/video-identities',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="5" width="15" height="14" rx="2" />
            <path d="M17 9l5-3v12l-5-3" />
          </svg>
        ),
      },
    ],
  },
]

const SUPERADMIN_NAV: NavSection[] = [
  {
    section: 'Super Admin',
    items: [
      {
        label: 'KPI Visibility',
        href: '/super-admin/kpi-visibility',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
      },
      {
        label: 'Device Health',
        href: '/super-admin/device-health',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8M8 10h4" strokeLinecap="round" />
            <circle cx="16" cy="16" r="2" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Manager View',
    items: [
      {
        label: 'Dashboard',
        href: '/super-admin/manager/dashboard',
        mirrorsHref: '/manager/dashboard',
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
        href: '/super-admin/manager/employees',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
          </svg>
        ),
      },
      {
        label: 'Coach Tracker',
        href: '/super-admin/manager/coaching-tracker',
        mirrorsHref: '/manager/coaching-tracker',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        label: 'Staffing',
        href: '/super-admin/manager/staffing-intelligence',
        mirrorsHref: '/manager/staffing-intelligence',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        label: 'Unknown Identity',
        href: '/super-admin/manager/unknown-identities',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Employee View',
    items: [
      {
        label: 'Overview',
        href: '/super-admin/employee/overview',
        mirrorsHref: '/dashboard/overview',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Owner View',
    items: [
      {
        label: 'ROI Attribution',
        href: '/super-admin/owner/roi-attribution',
        mirrorsHref: '/owner/roi-attribution',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
      {
        label: 'Benchmarking',
        href: '/super-admin/owner/benchmarking',
        mirrorsHref: '/owner/benchmarking',
        icon: (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
          </svg>
        ),
      },
      // {
      //   label: 'Marketing Loop',
      //   href: '/super-admin/owner/marketing-loop',
      //   mirrorsHref: '/owner/marketing-loop',
      //   icon: (
      //     <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      //       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      //       <circle cx="9" cy="7" r="4" />
      //       <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      //       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      //     </svg>
      //   ),
      // },
    ],
  },
]

const NAV_BY_ROLE: Record<string, NavSection[]> = {
  employee: EMPLOYEE_NAV,
  owner: OWNER_NAV,
  manager: MANAGER_NAV,
  superadmin: SUPERADMIN_NAV,
}

const VIEW_DEFAULT_ROUTES: Record<UserRole, string> = {
  owner: '/owner/roi-attribution',
  manager: '/manager/coaching-tracker',
  employee: '/dashboard/overview',
  superadmin: '/super-admin/kpi-visibility',
}

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeView, setActiveView] = useState<UserRole>(() => {
    if (user.role !== 'owner') return user.role
    return pathname.startsWith('/manager') ? 'manager' : 'owner'
  })
  const [isPending, startTransition] = useTransition()

  const currentScore = useUserStore((s) => s.currentScore)
  const storePoints = useUserStore((s) => s.points)
  const setPoints = useUserStore((s) => s.setPoints)
  const currentStore = useUserStore((s) => s.currentStore)
  const points = storePoints ?? (user.points ?? 0)

  const pageVisibility = useAdminConfigStore((s) => s.visibility)
  const fetchPageVisibility = useAdminConfigStore((s) => s.fetchVisibility)

  useEffect(() => {
    if (user.points != null) setPoints(user.points)
  }, [user.points, setPoints])

  useEffect(() => {
    if (!user.token) return
    fetchPageVisibility(user.token)
  }, [fetchPageVisibility, user.token])

  // Drop nav items whose page has been turned off by the Super Admin, and
  // drop any section left with no items as a result.
  const navSections = NAV_BY_ROLE[activeView]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const pageId = PAGE_ID_BY_HREF[item.mirrorsHref ?? item.href]
        return !pageId || (pageVisibility[pageId] ?? true)
      }),
    }))
    .filter((section) => section.items.length > 0)

  function handleViewToggle(view: UserRole) {
    if (user.role !== 'owner') return
    setActiveView(view)
    startTransition(() => {
      router.push(VIEW_DEFAULT_ROUTES[view])
    })
  }

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
          className="flex items-center gap-[10px] mx-3 mb-3 rounded-[10px] border px-[14px] py-[12px]"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-light), #D0EAD8)', borderColor: '#B8D9C6' }}
        >
          <div className="flex items-center justify-center shrink-0 rounded-full bg-accent text-white font-bold w-9 h-9 text-[12px]">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold text-accent truncate">{user.name}</div>
            <div className="text-accent-mid text-[10.5px] truncate">
              {user.jobTitle}
              {currentStore && ` · ${currentStore.name}`}
            </div>
          </div>
          {(currentScore ?? user.score) != null && (
            <div className="ml-auto text-right shrink-0">
              <div className="font-mono font-bold text-accent text-[18px]">{currentScore ?? user.score}</div>
              <div className="font-mono font-bold text-[11px]" style={{ color: '#F5C842' }}>{points.toLocaleString('en-US')} pts</div>
            </div>
          )}
        </div>
      ) : user.role === 'superadmin' ? null : (
        <>
          {user.role === 'owner' && (
            <div className="mx-3 pt-4 border-t border-border mb-4">
              <div className="text-muted uppercase tracking-[.08em] text-[10px] mb-2 px-[2px]">Current View</div>
              <button
                className={`${styles.toggleBtn} ${activeView === 'owner' ? styles.toggleBtnActive : ''} ${isPending ? 'opacity-60' : ''}`}
                onClick={() => handleViewToggle('owner')}
                disabled={isPending}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Owner View
              </button>
              <button
                className={`${styles.toggleBtn} ${activeView === 'manager' ? styles.toggleBtnActive : ''} ${isPending ? 'opacity-60' : ''}`}
                onClick={() => handleViewToggle('manager')}
                disabled={isPending}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                </svg>
                Manager View
              </button>
            </div>
          )}
          <div className="flex items-center gap-[9px] mx-3 mb-3 rounded-[10px] bg-surface-alt px-[12px] py-[10px]">
            <div className={styles.liveDot} />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium truncate">{currentStore?.name ?? 'Select store'}</div>
              <div className="text-muted text-[10.5px] truncate">{currentStore?.location ?? '—'}</div>
            </div>
          </div>
        </>
      )}

      {/* Logout */}
      <form action={logout.bind(null, user)} className="mx-3 mb-4">
        <button
          type="submit"
          className="w-full flex items-center gap-2 px-3 py-[9px] rounded-lg text-[12.5px] text-muted hover:text-danger hover:bg-danger/8 transition-colors cursor-pointer"
        >
          <svg className="shrink-0 w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </form>
    </aside>
  )
}
