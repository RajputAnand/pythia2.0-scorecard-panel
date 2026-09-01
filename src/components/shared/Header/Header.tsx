'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import styles from './Header.module.css'
import { useUserStore } from '@/store/userStore'
import { useTenantStore, isMultiTenantEnabled } from '@/store/tenantStore'

interface HeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
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

  useEffect(() => {
    if (!open && !tenantOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
      if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(e.target as Node)) {
        setTenantOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, tenantOpen])

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
      </div>
    </header>
  )
}

export { styles as headerStyles }
