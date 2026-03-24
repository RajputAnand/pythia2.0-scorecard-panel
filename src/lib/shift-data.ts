import { ShiftSummaryData } from "@/types/shift";

export const SHIFT_SUMMARY_DATA: ShiftSummaryData = {
    title: "Today's Shift Summary",
    subtitle: 'Wed Feb 25 · 11a – 7p · 8 hours',
    shiftComplete: true,
    metrics: [
        { label: 'Overall Score', value: '87', change: '↑ +3 vs. your avg', changeClass: 'up', valueClass: 'good' },
        { label: 'Customers Served', value: '142', change: '↑ +12 vs. avg shift', changeClass: 'up', valueClass: 'great' },
        { label: 'Avg Checkout', value: '31s', change: '→ Target is 25s', changeClass: 'flat', valueClass: 'ok' },
        { label: 'Points Earned', value: '+124', change: '↑ Best shift this week', changeClass: 'up', valueClass: 'gold' },
    ],
    timeline: [
        {
            time: '11:04',
            dotColor: 'var(--color-accent)',
            scoreColor: 'var(--color-accent)',
            score: '92',
            text: '**Strong start** — greeted first 8 customers within 2s. Hospitality score 92 in opening hour.',
        },
        {
            time: '12:40',
            dotColor: 'var(--color-amber)',
            scoreColor: 'var(--color-amber)',
            score: '74',
            text: 'Lunch rush — checkout slowed to **38s avg** under volume. Expected; score dipped temporarily.',
        },
        {
            time: '2:15',
            dotColor: 'var(--color-accent)',
            scoreColor: 'var(--color-accent)',
            score: '89',
            text: 'Recovered well after rush — **back to 29s checkout**. Mid-afternoon consistency was your best window today.',
        },
        {
            time: '6:30',
            dotColor: 'var(--color-cobalt)',
            scoreColor: 'var(--color-cobalt)',
            score: '86',
            text: '**Evening close strong** — time-to-service 86 for the final hour. Engagement held up well at end of shift.',
        },
    ],
}
