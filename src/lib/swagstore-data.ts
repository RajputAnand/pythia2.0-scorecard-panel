import { SwagStoreConfig } from "@/types/swagstore";

export const SWAG_STORE: SwagStoreConfig = {
    title: 'Swag Store',
    subtitle: 'Redeem your points for rewards',
    initialPoints: 1840,
    earnRateText: 'You earn **~120 pts/shift** at your current score level. Higher score = more points per shift.',
    catalog: [
        { id: 'coffee', emoji: '☕', name: 'Free Coffee — Any Size', desc: 'Redeem at the register anytime during your shift', cost: 250 },
        { id: 'tshirt', emoji: '🎽', name: 'Pythia Team T-Shirt', desc: 'Limited edition — only for top performers', cost: 800 },
        { id: 'gift10', emoji: '🎟️', name: '$10 Gift Card', desc: 'Store gift card — use on anything in the store', cost: 1000 },
        { id: 'cap', emoji: '🧢', name: 'Pythia Cap', desc: 'Embroidered logo cap — show off your rank', cost: 600 },
        { id: 'halfday', emoji: '🏖️', name: 'Half Day Off', desc: 'Redeem for a 4-hour shift reduction — manager approved', cost: 2000 },
        { id: 'gift25', emoji: '🎮', name: '$25 Amazon Gift Card', desc: 'Digital delivery within 24 hours of redemption', cost: 2500 },
    ],
}
