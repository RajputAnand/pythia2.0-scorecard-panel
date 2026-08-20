import Header from '@/components/shared/Header/Header'
import ExportPdfButton from '@/components/shared/ExportPdfButton/ExportPdfButton'
import ShareWithInvestorButton from '@/components/shared/ShareWithInvestorButton/ShareWithInvestorButton'
import TimeControls from '@/components/TimeControls/TimeControls'
import RoiHero from '@/components/RoiHero/RoiHero'
import ScoreVsTransactions from '@/components/ScoreVsTransactions/ScoreVsTransactions'
import HospitalityVsDwell from '@/components/HospitalityVsDwell/HospitalityVsDwell'
import CheckoutSpeed from '@/components/CheckoutSpeed/CheckoutSpeed'
import RevenueImpactTable from '@/components/RevenueImpactTable/RevenueImpactTable'
import CostPerCoaching from '@/components/CostPerCoaching/CostPerCoaching'
import ProjectionSummary from '@/components/ProjectionSummary/ProjectionSummary'

export const metadata = {
  title: 'Pythia — ROI Attribution (Super Admin)',
  description: 'Super Admin read-only mirror of the Owner ROI Attribution page.',
}

// Read-only mirror of /owner/roi-attribution for the Super Admin panel — same
// components as the owner page. No `previewMode` here on purpose — each
// component should still hide itself if its KPI is toggled off for owners.
export default function SuperAdminRoiAttributionPage() {
  return (
    <>
      <Header title="ROI Attribution" subtitle="Super Admin">
        <ExportPdfButton targetId="roi-report-content" fileName="roi-attribution-super-admin" />
        <ShareWithInvestorButton targetId="roi-report-content" fileName="roi-attribution-super-admin" />
      </Header>

      <TimeControls />

      <div id="roi-report-content" className="grid px-[30px] py-[24px] gap-5">
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
