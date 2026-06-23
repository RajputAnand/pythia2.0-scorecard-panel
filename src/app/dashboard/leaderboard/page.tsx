import Header from '@/components/shared/Header/Header'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { LEADERBOARD_DATA } from '@/lib/leaderboard-data'
import { getWeekSubtitle } from '@/utils/common'

export default function LeaderboardPage() {
    const currentDate = new Date(2026, 5, 14) // replace with new Date() in production
    return (
        <>
            <Header title="My Dashboard" subtitle={getWeekSubtitle(currentDate)}>
                <button className={headerStyles.btnGhost}>View Last Week</button>
                <button className={headerStyles.btnAccent}>📣 Share My Score</button>
            </Header>

            <div className="grid px-[30px] py-[24px] gap-5">
                <Leaderboard data={LEADERBOARD_DATA} />
            </div>
        </>
    )
}
