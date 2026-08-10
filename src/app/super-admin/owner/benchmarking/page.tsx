import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import BenchmarkingMetricFilter from '@/components/BenchmarkingMetricFilter/BenchmarkingMetricFilter'
import RankHero from '@/components/RankHero/RankHero'
import NetworkLeaderboard from '@/components/NetworkLeaderboard/NetworkLeaderboard'
import StoreComparison from '@/components/StoreComparison/StoreComparison'
import TopStorePractices from '@/components/TopStorePractices/TopStorePractices'
import RankMovement from '@/components/RankMovement/RankMovement'

export const metadata = {
  title: 'Pythia — Benchmarking (Super Admin)',
  description: 'Super Admin read-only mirror of the Owner Benchmarking page.',
}

// Read-only mirror of /owner/benchmarking for the Super Admin panel — same
// components as the owner page. No `previewMode` here on purpose — each
// component should still hide itself if its KPI is toggled off for owners.
export default function SuperAdminBenchmarkingPage() {
  return (
    <>
      <Header title="Competitor Benchmarking" subtitle="Super Admin · Feb 2026 · 24 peer stores in network">
        <BenchmarkingMetricFilter />
        <button className={headerStyles.btnPrimary}>Export Report</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        <RankHero />
        <NetworkLeaderboard />
        <StoreComparison />
        <TopStorePractices />
        <RankMovement />
      </div>
    </>
  )
}
