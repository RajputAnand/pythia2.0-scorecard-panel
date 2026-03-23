import Header from '@/components/Header/Header'
import headerStyles from '@/components/Header/Header.module.css'
import TimeControls from '@/components/TimeControls/TimeControls'
import RoiHero from '@/components/RoiHero/RoiHero'
import ScoreVsTransactions from '@/components/ScoreVsTransactions/ScoreVsTransactions'
import HospitalityVsDwell from '@/components/HospitalityVsDwell/HospitalityVsDwell'
import CheckoutSpeed from '@/components/CheckoutSpeed/CheckoutSpeed'
import RevenueImpactTable from '@/components/RevenueImpactTable/RevenueImpactTable'
import CostPerCoaching from '@/components/CostPerCoaching/CostPerCoaching'
import ProjectionSummary from '@/components/ProjectionSummary/ProjectionSummary'
import styles from './page.module.css'

export default function RoiAttributionPage() {
  return (
    <>
      <Header title="ROI Attribution">
        <button className={headerStyles.btnGhost}>Export PDF</button>
        <button className={headerStyles.btnPrimary}>Share with Investor</button>
      </Header>

      <TimeControls />

      <div className={styles.content}>
        <RoiHero />

        <div className={styles.chartRow}>
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
