import { createElement, ReactNode } from 'react'

export class Utils {}

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

/** Renders a string with **bold** markers as React nodes */
export function renderText(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? createElement('strong', { key: i }, part) : part
  )
}
