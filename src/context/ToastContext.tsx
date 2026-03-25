'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

interface ToastContextValue {
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-white px-[18px] py-3 rounded-[10px] text-[13px] font-medium transition-all duration-300 pointer-events-none ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <span className="text-[15px]">✓</span>
        {message}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
