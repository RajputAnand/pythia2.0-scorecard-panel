'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import styles from './Header.module.css'
import { useUserStore } from '@/store/userStore'
import { useTenantStore, isMultiTenantEnabled } from '@/store/tenantStore'
import { logout } from '@/actions/auth'
import { createStripeCustomerPortalSession } from '@/actions/stripe'
import type { User } from '@/types/user'

interface HeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

function formatRole(role?: string): string {
  switch (role) {
    case 'employee':
      return 'Employee'
    case 'manager':
      return 'Store Manager'
    case 'owner':
      return 'Store Owner'
    case 'superadmin':
      return 'Super Admin'
    default:
      return role || 'User'
  }
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const showStoreSelector = role === 'owner' || role === 'manager' || role === 'superadmin'
  const mtEnabled = isMultiTenantEnabled()

  const { stores, currentStore, setCurrentStore } = useUserStore()
  const { tenants, activeTenant, setActiveTenant } = useTenantStore()

  // Store Dropdown open/close
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Tenant Dropdown open/close (Super Admin)
  const [tenantOpen, setTenantOpen] = useState(false)
  const tenantDropdownRef = useRef<HTMLDivElement>(null)

  // Profile Dropdown open/close
  const [profileOpen, setProfileOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open && !tenantOpen && !profileOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
      if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(e.target as Node)) {
        setTenantOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setTenantOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [open, tenantOpen, profileOpen])

  async function handleManagePayments() {
    setIsOpeningPortal(true)
    setPortalError(null)
    try {
      const res = await createStripeCustomerPortalSession(window.location.href)
      if (res.success && res.url) {
        setProfileOpen(false)
        window.location.href = res.url
      } else {
        setPortalError(res.error || 'Unable to open Stripe Customer Portal.')
      }
    } catch {
      setPortalError('Failed to initialize Stripe Customer Portal.')
    } finally {
      setIsOpeningPortal(false)
    }
  }

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

      <div className="flex items-center gap-[10px]">
        {/* Tenant Switcher — Super Admin only when Multi-Tenant is enabled */}
        {role === 'superadmin' && mtEnabled && tenants.length > 0 && (
          <div ref={tenantDropdownRef} className="relative">
            <button
              id="tenant-selector-trigger"
              className="cursor-pointer flex items-center gap-[7px] font-sans font-medium text-secondary bg-surface-alt border border-border rounded-lg transition-all duration-150 hover:bg-border hover:text-primary text-[12.5px] px-[12px] py-[6px] whitespace-nowrap"
              onClick={() => setTenantOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={tenantOpen}
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="max-w-[150px] overflow-hidden text-ellipsis">
                {activeTenant?.name ?? 'Select Tenant'}
              </span>
              <svg
                className={`w-[11px] h-[11px] shrink-0 text-muted transition-transform duration-200${
                  tenantOpen ? ' rotate-180' : ''
                }`}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {tenantOpen && (
              <ul
                role="listbox"
                aria-label="Select tenant"
                className="absolute top-[calc(100%+6px)] right-0 min-w-[220px] bg-surface border border-border rounded-[10px] p-[4px] shadow-lg list-none m-0 z-50 divide-y divide-border/40"
              >
                {tenants.map((t) => {
                  const active = t.id === activeTenant?.id
                  return (
                    <li
                      key={t.id}
                      role="option"
                      aria-selected={active}
                      className={`flex items-center gap-2 rounded-md cursor-pointer transition-colors duration-100 px-[10px] py-[9px] ${
                        active ? 'bg-accent-light' : 'hover:bg-surface-alt'
                      }`}
                      onClick={() => {
                        setActiveTenant(t)
                        setTenantOpen(false)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-sans font-medium text-[13px] truncate ${
                            active ? 'text-accent' : 'text-primary'
                          }`}
                        >
                          {t.name}
                        </div>
                        <div className="text-[10.5px] text-muted font-mono">{t.code}</div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase shrink-0 ${
                          t.status === 'active'
                            ? 'bg-accent-light text-accent'
                            : 'bg-warning/15 text-warning font-mono'
                        }`}
                      >
                        {t.status}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {/* Store selector — owner, manager, and super admin */}
        {showStoreSelector && stores.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              id="store-selector-trigger"
              className="cursor-pointer flex items-center gap-[7px] font-sans font-medium text-secondary bg-surface-alt border border-border rounded-lg transition-all duration-150 hover:bg-border hover:text-primary text-[12.5px] px-[12px] py-[6px] whitespace-nowrap"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <svg
                className="w-[14px] h-[14px] shrink-0 text-accent"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 6.5V13.5C1.5 13.776 1.724 14 2 14H6V10H10V14H14C14.276 14 14.5 13.776 14.5 13.5V6.5"
                  stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d="M0.5 6.5L2.5 2H13.5L15.5 6.5"
                  stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d="M0.5 6.5C0.5 7.328 1.172 8 2 8C2.828 8 3.5 7.328 3.5 6.5C3.5 7.328 4.172 8 5 8C5.828 8 6.5 7.328 6.5 6.5C6.5 7.328 7.172 8 8 8C8.828 8 9.5 7.328 9.5 6.5C9.5 7.328 10.172 8 11 8C11.828 8 12.5 7.328 12.5 6.5C12.5 7.328 13.172 8 14 8C14.828 8 15.5 7.328 15.5 6.5"
                  stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>

              <span className="max-w-[160px] overflow-hidden text-ellipsis">
                {currentStore?.name ?? 'Select store'}
              </span>

              <svg
                className={`w-[11px] h-[11px] shrink-0 text-muted transition-transform duration-200${open ? ' rotate-180' : ''}`}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <ul
                role="listbox"
                aria-label="Select store"
                className="absolute top-[calc(100%+6px)] right-0 min-w-[220px] bg-surface border border-border rounded-[10px] p-[4px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] list-none m-0 z-50"
              >
                {stores.map((store) => {
                  const active = store._id === currentStore?._id
                  return (
                    <li
                      key={store._id}
                      role="option"
                      aria-selected={active}
                      className={`flex items-center gap-2 rounded-md cursor-pointer transition-colors duration-100 px-[10px] py-[9px] ${active ? 'bg-accent-light' : 'hover:bg-surface-alt'}`}
                      onClick={() => {
                        setCurrentStore(store)
                        setOpen(false)
                      }}
                    >
                      <span className={`font-sans font-medium text-[13px] flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${active ? 'text-accent' : 'text-primary'}`}>
                        {store.name}
                      </span>
                      <span className="font-sans text-secondary text-[11px] whitespace-nowrap shrink-0">
                        {store.location}
                      </span>
                      {active && (
                        <svg className="w-[12px] h-[12px] shrink-0 text-accent ml-1" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {children && <>{children}</>}

        {/* User Profile DP & Dropdown Menu */}
        {session?.user && (
          <div ref={profileDropdownRef} className="relative ml-1">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="User profile menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="flex items-center justify-center rounded-full bg-accent text-white font-bold w-[34px] h-[34px] text-[12px] cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-accent/30 focus:outline-none"
            >
              {session.user.initials || session.user.name?.slice(0, 2).toUpperCase() || 'U'}
            </button>

            {profileOpen && (
              <div
                role="menu"
                aria-label="User profile options"
                className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] w-max max-w-[260px] z-50 bg-surface border border-border rounded-xl p-1.5 shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] space-y-1"
              >
                <div className="px-2.5 py-1.5 border-b border-border/70 mb-1">
                  <div className="text-[12.5px] font-semibold text-primary truncate">
                    {session.user.name}
                  </div>
                  <div className="text-[10.5px] text-muted truncate">
                    {session.user.email || session.user.jobTitle || formatRole(session.user.role)}
                  </div>
                </div>

                {portalError && (
                  <div className="px-2.5 py-1 text-[11px] text-danger bg-danger/10 rounded-md">
                    {portalError}
                  </div>
                )}

                {role === 'owner' && (
                  <>
                    <button
                      type="button"
                      onClick={handleManagePayments}
                      disabled={isOpeningPortal}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium text-secondary hover:text-primary hover:bg-surface-alt transition-colors cursor-pointer text-left disabled:opacity-50"
                    >
                      {isOpeningPortal ? (
                        <svg className="shrink-0 w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg
                          className="shrink-0 w-4 h-4 text-secondary"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      )}
                      <span className="flex-1 min-w-0 leading-snug">
                        {isOpeningPortal ? 'Opening Portal...' : 'Manage Subscription'}
                      </span>
                    </button>
                    <div className="h-px bg-border/60 mx-1 my-0.5" />
                  </>
                )}

                <form action={logout.bind(null, session.user as unknown as User)} className="w-full">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left"
                  >
                    <svg
                      className="shrink-0 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export { styles as headerStyles }
