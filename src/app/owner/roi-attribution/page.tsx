import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import TimeControls from '@/components/TimeControls/TimeControls'
import RoiHero from '@/components/RoiHero/RoiHero'
import ScoreVsTransactions from '@/components/ScoreVsTransactions/ScoreVsTransactions'
import HospitalityVsDwell from '@/components/HospitalityVsDwell/HospitalityVsDwell'
import CheckoutSpeed from '@/components/CheckoutSpeed/CheckoutSpeed'
import RevenueImpactTable from '@/components/RevenueImpactTable/RevenueImpactTable'
import CostPerCoaching from '@/components/CostPerCoaching/CostPerCoaching'
import ProjectionSummary from '@/components/ProjectionSummary/ProjectionSummary'
export default async function RoiAttributionPage() {
  return (
    <>
      <Header title="ROI Attribution">
        <button className={headerStyles.btnGhost}>Export PDF</button>
        <button className={headerStyles.btnPrimary}>Share with Investor</button>
      </Header>

      <TimeControls />

      <div className="grid px-[30px] py-[24px] gap-5">
        <RoiHero />

        <div className="grid grid-cols-2 gap-4">
          <ScoreVsTransactions />
          <HospitalityVsDwell />
        </div>

        <CheckoutSpeed />
        <RevenueImpactTable />
        <CostPerCoaching />
        <ProjectionSummary />
      </div>
    </>
  )
}
