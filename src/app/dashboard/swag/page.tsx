import Header from '@/components/shared/Header/Header'
import SwagStore from '@/components/SwagStore/SwagStore'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { getWeekSubtitle } from '@/utils/common'

export default function SwagPage() {
  const currentDate = new Date(2026, 5, 14) // replace with new Date() in production
  return (
    <>
      <Header
        title="Swag Store"
        subtitle="Redeem your hard-earned performance points for exclusive team rewards and perks"
      />

      <div className="grid px-[30px] py-[24px] gap-5">
        <SwagStore />
      </div>
    </>
  )
}
