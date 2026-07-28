import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import AddCampaignButton from '@/components/AddCampaignButton/AddCampaignButton'
import MarketingInsightStrip from '@/components/MarketingInsightStrip/MarketingInsightStrip'
import DemographicShifts from '@/components/DemographicShifts/DemographicShifts'
import CustomerSegmentShifts from '@/components/CustomerSegmentShifts/CustomerSegmentShifts'
import SpendVsTraffic from '@/components/SpendVsTraffic/SpendVsTraffic'
import CampaignCards from '@/components/CampaignCards/CampaignCards'
export default async function MarketingLoopPage() {
  return (
    <>
      <Header title="Marketing Feedback Loop" subtitle="Nov 2025 – Feb 2026 · Node 2 data">
        <button className={headerStyles.btnGhost}>Export</button>
        <AddCampaignButton />
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        <MarketingInsightStrip />

        <div className="grid grid-cols-[1fr_1fr] gap-[18px] items-start">
          <DemographicShifts />
          <CustomerSegmentShifts />
        </div>

        <SpendVsTraffic />
        <CampaignCards />
      </div>
    </>
  )
}
