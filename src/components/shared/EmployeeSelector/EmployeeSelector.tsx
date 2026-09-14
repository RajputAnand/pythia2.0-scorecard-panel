'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import styles from './EmployeeSelector.module.css'
import { getEmployeeName, getEmployeeInitials } from '@/utils/common'
import type { ApiEmployee } from '@/types/employee'

interface EmployeeSelectorProps {
  employees: ApiEmployee[]
  selectedEmployee: ApiEmployee | null
  onSelectEmployee: (employee: ApiEmployee) => void
  loading?: boolean
  disabled?: boolean
}

export default function EmployeeSelector({
  employees,
  selectedEmployee,
  onSelectEmployee,
  loading = false,
  disabled = false,
}: EmployeeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    // Focus search input when dropdown opens
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 50)

    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees
    const term = searchTerm.toLowerCase().trim()
    return employees.filter((emp) => {
      const name = getEmployeeName(emp).toLowerCase()
      const email = (emp.email || '').toLowerCase()
      const phone = (emp.phone || '').toLowerCase()
      return name.includes(term) || email.includes(term) || phone.includes(term)
    })
  }, [employees, searchTerm])

  const displayName = selectedEmployee ? getEmployeeName(selectedEmployee) : 'Select Employee'

  return (
    <div ref={dropdownRef} className={styles.dropdownContainer}>
      <button
        type="button"
        id="employee-selector-trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select employee"
        className="cursor-pointer flex items-center gap-[7px] font-sans font-medium text-secondary bg-surface-alt border border-border rounded-lg transition-all duration-150 hover:bg-border hover:text-primary text-[12.5px] px-[12px] py-[6px] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-[14px] h-[14px] shrink-0 text-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        <span className="max-w-[160px] overflow-hidden text-ellipsis">
          {loading ? 'Loading employees…' : displayName}
        </span>

        <svg
          className={`w-[11px] h-[11px] shrink-0 text-muted transition-transform duration-200${open ? ' rotate-180' : ''}`}
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

      {open && (
        <div
          role="listbox"
          aria-label="Select employee"
          className="absolute top-[calc(100%+6px)] right-0 min-w-[260px] max-w-[320px] bg-surface border border-border rounded-[10px] p-[6px] shadow-[0_8px_24px_-4px_rgba(26,23,20,0.12),0_2px_8px_-2px_rgba(26,23,20,0.06)] z-50 flex flex-col gap-1.5"
        >
          {/* Search box */}
          <div className="relative px-1 pt-1 pb-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees…"
              className="w-full rounded-md border border-border bg-surface-alt px-2.5 py-1.5 text-[12px] text-primary outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-[11px] cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* List of employees */}
          <ul className={`max-h-[240px] overflow-y-auto list-none m-0 p-0 ${styles.menuList}`}>
            {filteredEmployees.length === 0 ? (
              <li className="px-3 py-4 text-center text-[12px] text-muted">
                {searchTerm ? 'No matching employees' : 'No employees found'}
              </li>
            ) : (
              filteredEmployees.map((employee) => {
                const empId = employee.user_id || employee._id
                const isSelected = Boolean(
                  selectedEmployee &&
                    (selectedEmployee.user_id === empId || selectedEmployee._id === empId)
                )
                const name = getEmployeeName(employee)
                const initials = getEmployeeInitials(employee)

                return (
                  <li
                    key={empId}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectEmployee(employee)
                      setOpen(false)
                      setSearchTerm('')
                    }}
                    className={`flex items-center gap-2.5 rounded-md cursor-pointer transition-colors duration-100 px-2.5 py-2 ${
                      isSelected ? 'bg-accent-light' : 'hover:bg-surface-alt'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center shrink-0 rounded-full font-bold w-7 h-7 text-[10.5px] ${
                        isSelected ? 'bg-accent text-white' : 'bg-surface-alt text-secondary border border-border'
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[12.5px] font-medium truncate ${
                          isSelected ? 'text-accent font-semibold' : 'text-primary'
                        }`}
                      >
                        {name}
                      </div>
                      <div className="text-[10.5px] text-muted truncate">
                        {employee.email || (employee.role_name ? `Role: ${employee.role_name}` : 'Employee')}
                      </div>
                    </div>

                    {isSelected && (
                      <svg
                        className="w-[14px] h-[14px] shrink-0 text-accent ml-1"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
