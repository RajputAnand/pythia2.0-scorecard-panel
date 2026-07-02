import Header from '@/components/shared/Header/Header'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { fetchTeamRanking } from '@/queries/scorecard'
import { auth } from '@/auth'
import { getWeekSubtitle } from '@/utils/common'

export default async function LeaderboardPage() {
  const currentDate = new Date(2026, 5, 14) // replace with new Date() in production

  const session = await auth()
  let teamRankingData = null
  if (session?.user?.pythia2Token) {
    try {
      teamRankingData = await fetchTeamRanking(session.user.pythia2Token)
    } catch (err) {
      console.log(err)
      // non-fatal — page renders an empty state when null
    }
  }

  return (
    <>
      <Header title="My Dashboard" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        {teamRankingData ? (
          <Leaderboard data={teamRankingData} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
            <span className="text-[32px]">📋</span>
            <p className="font-semibold text-[14px]">No leaderboard data yet</p>
            <p className="text-[12px] text-muted">Rankings will appear once your team&apos;s shifts are logged.</p>
          </div>
        )}
      </div>
    </>
  )
}
