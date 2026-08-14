import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import AddCampaignButton from '@/components/AddCampaignButton/AddCampaignButton'
import MarketingInsightStrip from '@/components/MarketingInsightStrip/MarketingInsightStrip'
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
        <SpendVsTraffic />
        <CampaignCards />
      </div>
    </>
  )
}
