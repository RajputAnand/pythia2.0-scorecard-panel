import { CoachingItem } from "@/types/coaching";

export const COACHING_ITEMS: CoachingItem[] = [
    {
        id: 'checkout',
        type: 'checkout',
        typeLabel: 'Checkout',
        title: 'Reduce checkout time to under 25s consistently',
        status: 'active',
        statusLabel: 'In progress',
        defaultOpen: true,
        what: "Your average checkout is **31s**, and your target is **25s**. You've improved from 38s in November — that's real progress. The gap now is during high-volume windows where you slow down under pressure.",
        tip: "💡 **Try this:** Before each transaction, position the bag before the first item scans. That one habit alone typically saves 4–6 seconds. Focus on it during your next lunch rush and see if it sticks.",
    },
    {
        id: 'hosp',
        type: 'hosp',
        typeLabel: 'Hospitality',
        title: "Maintain mid-transaction engagement — don't go quiet",
        status: 'active',
        statusLabel: 'In progress',
        what: "Your greeting and close scores are **both above 85** — that's excellent. The dip happens in the middle of transactions. Node 1 flags a pattern of silence during scanning, especially when lines are long.",
        tip: '💡 **Try this:** Pick one phrase to use mid-scan — "Did you find everything okay?" or a simple comment about the weather. You don\'t need to be chatty, just present. Even one sentence during the transaction lifts your score noticeably.',
    },
    {
        id: 'time',
        type: 'time',
        typeLabel: 'Time to Svc',
        title: 'First greeting under 2 seconds — already nearly there',
        status: 'done',
        statusLabel: '✓ Resolved',
        what: "This was flagged 6 weeks ago — your average greeting delay was **4.8 seconds**. As of this week you're averaging **2.1 seconds**, right at the target. Marked resolved. Great work.",
        tip: '✅ You nailed this one. Keep it up — consistency is what locks in permanent score improvement.',
    },
]
