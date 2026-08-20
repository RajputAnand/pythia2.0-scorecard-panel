import { createElement, ReactNode } from 'react'
import axios from 'axios'
import type { ApiEmployee } from '@/types/employee'

export class Utils {}

/**
 * Extracts a user-facing message from a FastAPI error response.
 * The backend's global exception handlers (app/main.py) wrap every
 * HTTPException into `{success: false, error: "..."}` — `detail` only
 * survives as a plain string in FastAPI's own unhandled-route defaults, and
 * as an array of field errors (`{ msg, loc, type }`) alongside `error` on a
 * 422 validation failure. Check `error` first since it's what this backend
 * actually returns for the common 400/401/403 case.
 */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (Array.isArray(detail)) {
      const msg = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ')
      if (msg) return msg
    }
    const error = err.response?.data?.error
    if (typeof error === 'string') return error
    if (typeof detail === 'string') return detail
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

/** Returns "just now" / "Ns ago" / "Nm ago" / "Nh ago" for an ISO timestamp relative to now. */
export function formatRelativeTime(isoTimestamp: string, now: Date = new Date()): string {
  const then = new Date(isoTimestamp).getTime()
  if (Number.isNaN(then)) return isoTimestamp
  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000))
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
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

/** Initials from an already-formatted display name (e.g. "Marcus R." → "MR"). */
export function getInitialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const AVATAR_PALETTE = ['#1E4D7A', '#1D5C3A', '#B8622A', '#7A6A55', '#555555', '#6B4E9E', '#B52B1E', '#2A6F6F']

/** Deterministically assigns one of a fixed palette of colors from a stable id — purely a UI styling choice, not derived data. */
export function getAvatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

/**
 * Builds a CSV string from headers + rows and triggers a browser download.
 * Quotes any field containing a comma, quote, or newline, escaping embedded quotes.
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escape = (value: string | number) => {
    const str = String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Renders a string with **bold** markers as React nodes */
export function renderText(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? createElement('strong', { key: i }, part) : part
  )
}
