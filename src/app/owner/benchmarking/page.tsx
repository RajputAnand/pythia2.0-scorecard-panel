import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import BenchmarkingMetricFilter from '@/components/BenchmarkingMetricFilter/BenchmarkingMetricFilter'
import RankHero from '@/components/RankHero/RankHero'
import NetworkLeaderboard from '@/components/NetworkLeaderboard/NetworkLeaderboard'
import StoreComparison from '@/components/StoreComparison/StoreComparison'
import TopStorePractices from '@/components/TopStorePractices/TopStorePractices'
import RankMovement from '@/components/RankMovement/RankMovement'
import { getUser } from '@/lib/get-user'

export default async function BenchmarkingPage() {
  const user = await getUser()
  return (
    <>
      <Header title="Competitor Benchmarking" subtitle="Feb 2026 · 24 peer stores in network" user={user}>
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
