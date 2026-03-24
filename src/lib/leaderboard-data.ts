import { LeaderboardData } from "@/types/leaderboart";

export const LEADERBOARD_DATA: LeaderboardData = {
    title: 'Team Leaderboard',
    subtitle: 'Anonymized · Your teammates are shown as Team Member A–D',
    periodLabel: 'This week',
    entries: [
        {
            pos: 1, posVariant: 'gold',
            initials: 'TA', avatarBg: '#8B7355',
            name: 'Team Member A',
            barWidth: '91%', barColor: 'var(--color-gold)',
            score: 91, pts: '2,240 pts',
        },
        {
            pos: 2, posVariant: 'yoursPos',
            initials: 'MR', avatarBg: 'var(--color-accent)',
            name: 'Marcus R.', isYou: true,
            barWidth: '84%', barColor: 'var(--color-accent)',
            score: 84, scoreIsYou: true,
            pts: '1,840 pts', ptsIsYou: true,
        },
        {
            pos: 3, posVariant: 'bronze',
            initials: 'TB', avatarBg: '#6A8A5A',
            name: 'Team Member B',
            barWidth: '80%', barColor: '#7EC8A0',
            score: 80, pts: '1,620 pts',
        },
        {
            pos: 4, posVariant: 'regular',
            initials: 'TC', avatarBg: '#7A7A8A',
            name: 'Team Member C',
            barWidth: '69%', barColor: 'var(--color-amber)',
            score: 69, pts: '980 pts',
        },
        {
            pos: 5, posVariant: 'regular',
            initials: 'TD', avatarBg: '#9A6A4A',
            name: 'Team Member D',
            barWidth: '66%', barColor: 'var(--color-amber)',
            score: 66, pts: '820 pts',
        },
    ],
    insightText: "You're **7 points behind #1** this week. At your current improvement rate (+1.5 pts/week), you could reach #1 in about 5 weeks. Keep the streak going. 🔥",
}
