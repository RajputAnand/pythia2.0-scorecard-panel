'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/shared/Header/Header'
import Toolbar from '@/components/shared/Toolbar/Toolbar'
import EmployeeSelector from '@/components/shared/EmployeeSelector/EmployeeSelector'
import SwagStore from '@/components/SwagStore/SwagStore'
import { useUserStore } from '@/store/userStore'
import { fetchEmployees } from '@/queries/employees'
import { getEmployeeName } from '@/utils/common'
import type { ApiEmployee } from '@/types/employee'

interface SuperAdminEmployeeSwagContentProps {
  initialEmployees: ApiEmployee[]
  initialSelectedEmployee: ApiEmployee | null
  token: string
}

function SwagSkeleton() {
  return (
    <div className="grid gap-5 animate-pulse">
      <div className="h-28 w-full rounded-xl bg-border" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-border/50 border border-border" />
        ))}
      </div>
    </div>
  )
}

function NoEmployeesState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">👥</span>
      <p className="font-semibold text-[14px]">No employees found</p>
      <p className="text-[12px] text-gray-800">
        Create employees in the Manager view or onboard a tenant to view the employee Swag Store.
      </p>
    </div>
  )
}

function SelectEmployeePrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">👆</span>
      <p className="font-semibold text-[14px]">Select an employee</p>
      <p className="text-[12px] text-gray-800">
        Use the employee dropdown in the header to view an employee&apos;s available points and rewards.
      </p>
    </div>
  )
}

export default function SuperAdminEmployeeSwagContent({
  initialEmployees,
  initialSelectedEmployee,
  token,
}: SuperAdminEmployeeSwagContentProps) {
  const { data: session } = useSession()
  const activeToken = token || session?.user?.pythia2Token || ''
  const currentStore = useUserStore((s) => s.currentStore)
  const currentStoreId = currentStore?.storeNo || currentStore?._id
  const globalSelectedEmployee = useUserStore((s) => s.selectedEmployee)
  const setGlobalSelectedEmployee = useUserStore((s) => s.setSelectedEmployee)

  const [employees, setEmployees] = useState<ApiEmployee[]>(initialEmployees)
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployeeState] = useState<ApiEmployee | null>(() => {
    if (
      globalSelectedEmployee &&
      initialEmployees.some(
        (e) => (e.user_id || e._id) === (globalSelectedEmployee.user_id || globalSelectedEmployee._id)
      )
    ) {
      return globalSelectedEmployee
    }
    return initialSelectedEmployee
  })

  const setSelectedEmployee = (emp: ApiEmployee | null) => {
    setSelectedEmployeeState(emp)
    setGlobalSelectedEmployee(emp)
  }

  // Ensure global store has initial employee if not already set
  useEffect(() => {
    if (selectedEmployee && !globalSelectedEmployee) {
      setGlobalSelectedEmployee(selectedEmployee)
    }
  }, [selectedEmployee, globalSelectedEmployee, setGlobalSelectedEmployee])

  // Sync state if initialEmployees changes (e.g. from server refresh on store switch)
  useEffect(() => {
    setEmployees(initialEmployees)
    if (initialEmployees.length > 0) {
      const active = globalSelectedEmployee || selectedEmployee
      const matched = initialEmployees.find(
        (e) => (e.user_id || e._id) === (active?.user_id || active?._id)
      )
      if (matched) {
        setSelectedEmployee(matched)
      } else {
        setSelectedEmployee(initialSelectedEmployee || initialEmployees[0])
      }
    } else {
      setSelectedEmployee(null)
    }
  }, [initialEmployees, initialSelectedEmployee])

  const selectedEmployeeRef = useRef(selectedEmployee)
  selectedEmployeeRef.current = selectedEmployee

  const isFirstMount = useRef(true)
  const lastStoreId = useRef(currentStoreId)

  // Re-fetch employees when current store changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      lastStoreId.current = currentStoreId
      if (initialEmployees.length > 0) {
        return
      }
    }

    if (lastStoreId.current !== currentStoreId) {
      lastStoreId.current = currentStoreId
      if (!activeToken) return
      let cancelled = false
      setEmployeesLoading(true)
      fetchEmployees({ token: activeToken, skip: 0, limit: 100, storeId: currentStoreId })
        .then((res) => {
          if (cancelled) return
          const list = res.data ?? []
          setEmployees(list)
          const currentEmp = selectedEmployeeRef.current
          const stillPresent = list.find(
            (e) => (e.user_id || e._id) === (currentEmp?.user_id || currentEmp?._id)
          )
          if (stillPresent) {
            setSelectedEmployee(stillPresent)
          } else {
            setSelectedEmployee(list[0] ?? null)
          }
        })
        .catch(() => {})
        .finally(() => {
          setEmployeesLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
  }, [currentStoreId, activeToken, initialEmployees.length])

  // Fetch employees client-side if initial list was empty
  useEffect(() => {
    if (employees.length === 0 && activeToken && !isFirstMount.current) {
      let cancelled = false
      setEmployeesLoading(true)
      fetchEmployees({ token: activeToken, skip: 0, limit: 100, storeId: currentStoreId })
        .then((res) => {
          if (cancelled) return
          const list = res.data ?? []
          setEmployees(list)
          const currentEmp = selectedEmployeeRef.current
          if (!currentEmp && list.length > 0) {
            const matched = globalSelectedEmployee
              ? list.find((e) => (e.user_id || e._id) === (globalSelectedEmployee.user_id || globalSelectedEmployee._id))
              : null
            setSelectedEmployee(matched || list[0])
          }
        })
        .catch(() => {})
        .finally(() => {
          setEmployeesLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
  }, [activeToken, employees.length, currentStoreId, globalSelectedEmployee])

  // Always reflect changes to globalSelectedEmployee (e.g. if updated after redemptions)
  useEffect(() => {
    if (
      globalSelectedEmployee &&
      (!selectedEmployee ||
        (selectedEmployee.user_id || selectedEmployee._id) ===
          (globalSelectedEmployee.user_id || globalSelectedEmployee._id))
    ) {
      if (globalSelectedEmployee.points !== selectedEmployee?.points) {
        setSelectedEmployeeState(globalSelectedEmployee)
      }
    }
  }, [globalSelectedEmployee, selectedEmployee])

  return (
    <>
      <Header
        title="Swag Store"
        subtitle="Super Admin · Employee View Mirror"
      />

      <Toolbar
        left={
          <div className="flex items-center gap-2">
            <EmployeeSelector
              employees={employees}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={(emp) => {
                setSelectedEmployee(emp)
              }}
              loading={employeesLoading}
            />
          </div>
        }
      />

      <div className="grid p-5 gap-5">
        {employeesLoading && employees.length === 0 ? (
          <SwagSkeleton />
        ) : employees.length === 0 ? (
          <NoEmployeesState />
        ) : !selectedEmployee ? (
          <SelectEmployeePrompt />
        ) : (
          <SwagStore
            employeePoints={selectedEmployee.points ?? 0}
            employeeId={selectedEmployee.user_id || selectedEmployee._id}
            employeeName={getEmployeeName(selectedEmployee)}
            employeeEmail={selectedEmployee.email}
            storeId={selectedEmployee.store_ids?.[0] || currentStoreId}
          />
        )}
      </div>
    </>
  )
}
