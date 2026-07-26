import { createElement, ReactNode } from 'react'
import axios from 'axios'
import type { ApiEmployee } from '@/types/employee'

export class Utils {}

/**
 * Extracts a user-facing message from a FastAPI error response.
 * 401/400s carry `detail` as a plain string; 422s carry `detail` as an array
 * of field errors (`{ msg, loc, type }`).
 */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const msg = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ')
      if (msg) return msg
    }
  }
  console.error('API error:', err)
  return fallback
}

/** Returns "Good morning", "Good afternoon", or "Good evening" based on the hour. */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Returns "Week of MMM D – MMM D, YYYY" for the Mon–Sun week containing the given date. */
export function getWeekSubtitle(date: Date): string {
  const day = date.getDay() // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() + diffToMonday)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Week of ${fmt(weekStart)} – ${fmt(weekEnd)}, ${weekEnd.getFullYear()}`
}

/**
 * Builds a viewable URL for an S3-backed asset from its key.
 * NEXT_PUBLIC_S3_ASSET_BASE_URL is a virtual-hosted-style bucket URL
 * (e.g. https://<bucket>.s3.<region>.amazonaws.com) — the bucket is already
 * part of the host, so only the key is appended.
 */
export function getS3AssetUrl(key: string): string {
  return `${process.env.NEXT_PUBLIC_S3_ASSET_BASE_URL}/${key}`
}

/**
 * Resolves an employee's display name, tolerating both response shapes the
 * /employees endpoint returns — snake_case first_name/last_name for records
 * created via POST /employees, camelCase firstName/lastName for records
 * migrated from Pythia-1. Falls back to email when neither is present.
 */
export function getEmployeeName(employee: Pick<ApiEmployee, 'first_name' | 'last_name' | 'firstName' | 'lastName' | 'email'>): string {
  const first = employee.first_name || employee.firstName || ''
  const last = employee.last_name || employee.lastName || ''
  return `${first} ${last}`.trim() || employee.email
}

/** Same field tolerance as getEmployeeName — see its comment. */
export function getEmployeeInitials(employee: Pick<ApiEmployee, 'first_name' | 'last_name' | 'firstName' | 'lastName'>): string {
  const first = employee.first_name || employee.firstName || ''
  const last = employee.last_name || employee.lastName || ''
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || 'UR'
}

/** Formats an API week_start/week_end ISO pair as "Week of MMM D – MMM D, YYYY" */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart)
  const end = new Date(weekEnd)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Week of ${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`
}

/** Joins names with an Oxford comma: "A", "A and B", "A, B, and C". */
export function formatNameList(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

/** Renders a string with **bold** markers as React nodes */
export function renderText(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? createElement('strong', { key: i }, part) : part
  )
}
