'use client'

import headerStyles from '@/components/shared/Header/Header.module.css'

interface WeekNavButtonsProps {
  weekOffset: number
  loading: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function WeekNavButtons({ weekOffset, loading, onPrevious, onNext }: WeekNavButtonsProps) {
  return (
    <>
      {weekOffset !== 0 && (
        <button className={headerStyles.btnGhost} onClick={onNext} disabled={loading}>
          View Next Week
        </button>
      )}
      {weekOffset !== 1 && (
        <button className={headerStyles.btnGhost} onClick={onPrevious} disabled={loading}>
          View Last Week
        </button>
      )}
      <button className={headerStyles.btnAccent}>📣 Share My Score</button>
    </>
  )
}
