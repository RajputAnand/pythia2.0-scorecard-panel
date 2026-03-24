import { createElement, ReactNode } from 'react'

export class Utils {}

/** Renders a string with **bold** markers as React nodes */
export function renderText(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? createElement('strong', { key: i }, part) : part
  )
}
