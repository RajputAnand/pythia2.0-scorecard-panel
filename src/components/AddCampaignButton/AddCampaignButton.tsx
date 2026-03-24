'use client'

import { useState, useEffect } from 'react'
import headerStyles from '@/components/shared/Header/Header.module.css'

export default function AddCampaignButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <>
      <button className={headerStyles.btnAccent} onClick={() => setVisible(true)}>
        + Add Campaign
      </button>

      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-white px-[18px] py-3 rounded-[10px] text-[13px] font-medium transition-all duration-300 pointer-events-none
          ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      >
        <span>✓</span>
        <span>Campaign added</span>
      </div>
    </>
  )
}
