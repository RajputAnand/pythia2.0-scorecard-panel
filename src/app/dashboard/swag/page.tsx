import Header from '@/components/shared/Header/Header'
import SwagStore from '@/components/SwagStore/SwagStore'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { getWeekSubtitle } from '@/utils/common'

export default function SwagPage() {
  const currentDate = new Date(2026, 5, 14) // replace with new Date() in production
  return (
    <>
      <Header title="Swag Store" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        <SwagStore />
      </div>
    </>
  )
}
