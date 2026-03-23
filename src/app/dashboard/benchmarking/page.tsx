import Header from '@/components/Header/Header'
import headerStyles from '@/components/Header/Header.module.css'
import BenchmarkingMetricFilter from '@/components/BenchmarkingMetricFilter/BenchmarkingMetricFilter'
import RankHero from '@/components/RankHero/RankHero'
import NetworkLeaderboard from '@/components/NetworkLeaderboard/NetworkLeaderboard'
import StoreComparison from '@/components/StoreComparison/StoreComparison'
import TopStorePractices from '@/components/TopStorePractices/TopStorePractices'
import RankMovement from '@/components/RankMovement/RankMovement'

export default function BenchmarkingPage() {
  return (
    <>
      <Header title="Competitor Benchmarking" subtitle="Feb 2026 · 24 peer stores in network">
        <BenchmarkingMetricFilter />
        <button className={headerStyles.btnPrimary}>Export Report</button>
      </Header>

      <div className="flex flex-col px-[30px] py-[24px] gap-5">
        <RankHero />
        <NetworkLeaderboard />
        <StoreComparison />
        <TopStorePractices />
        <RankMovement />
      </div>
    </>
  )
}
