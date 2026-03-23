'use client'

import { useState } from 'react'
import styles from './TimeControls.module.css'

const TIME_PERIODS = ['This Week', 'Month over Month', 'Quarter'] as const
const VIEW_OPTIONS = ['Actuals + Projected', 'Actuals Only', 'Projected Only'] as const

export default function TimeControls() {
  const [period, setPeriod] = useState<string>('Month over Month')
  const [view, setView] = useState<string>('Actuals + Projected')
  const [dateFrom, setDateFrom] = useState('2025-11-01')
  const [dateTo, setDateTo] = useState('2026-02-23')

  return (
    <div className={styles.timeControls}>
      {TIME_PERIODS.map((p) => (
        <button
          key={p}
          className={`${styles.timeBtn} ${period === p ? styles.timeBtnActive : ''}`}
          onClick={() => setPeriod(p)}
        >
          {p}
        </button>
      ))}

      <div className={styles.timeSep} />

      <div className={styles.dateRangeWrap}>
        <input
          type="date"
          className={styles.dateInput}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span className={styles.dateRangeTo}>to</span>
        <input
          type="date"
          className={styles.dateInput}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button className={styles.applyBtn}>Apply</button>
      </div>

      <div className={styles.timeControlsRight}>
        <span className={styles.viewLabel}>View:</span>
        <div className={styles.actualsToggle}>
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              className={`${styles.apBtn} ${view === v ? styles.apBtnActive : ''}`}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
