import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import AddCampaignButton from '@/components/AddCampaignButton/AddCampaignButton'
import MarketingInsightStrip from '@/components/MarketingInsightStrip/MarketingInsightStrip'
import DemographicShifts from '@/components/DemographicShifts/DemographicShifts'
import CustomerSegmentShifts from '@/components/CustomerSegmentShifts/CustomerSegmentShifts'
import SpendVsTraffic from '@/components/SpendVsTraffic/SpendVsTraffic'
import CampaignCards from '@/components/CampaignCards/CampaignCards'

export const metadata = {
  title: 'Pythia — Marketing Loop (Super Admin)',
  description: 'Super Admin read-only mirror of the Owner Marketing Loop page.',
}

// Read-only mirror of /owner/marketing-loop for the Super Admin panel — same
// components as the owner page. No `previewMode` here on purpose — each
// component should still hide itself if its KPI is toggled off for owners.
export default function SuperAdminMarketingLoopPage() {
  return (
    <>
      <Header title="Marketing Feedback Loop" subtitle="Super Admin · Nov 2025 – Feb 2026 · Node 2 data">
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
