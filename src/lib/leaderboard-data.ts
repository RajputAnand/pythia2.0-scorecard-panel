import { TeamRankingData } from "@/types/overview";

export const LEADERBOARD_DATA: TeamRankingData = {
    members: [
        { rank: 1, label: 'Team Member A', is_you: false, initials: 'TA', score: 91, points: 2240 },
        { rank: 2, label: 'Marcus R.', is_you: true, initials: 'MR', score: 84, points: 1840 },
        { rank: 3, label: 'Team Member B', is_you: false, initials: 'TB', score: 80, points: 1620 },
        { rank: 4, label: 'Team Member C', is_you: false, initials: 'TC', score: 69, points: 980 },
        { rank: 5, label: 'Team Member D', is_you: false, initials: 'TD', score: 66, points: 820 },
    ],
    insight: {
        type: 'trailing',
        points_behind: 7,
        improvement_rate: 1.5,
        weeks_to_first: 5,
        message: "You're **7 points behind #1** this week. At your current improvement rate (+1.5 pts/week), you could reach #1 in about 5 weeks. Keep the streak going. 🔥",
    },
}
