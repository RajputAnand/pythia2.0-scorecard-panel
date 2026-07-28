import { Recommendation, StaffEmployee, TeamScoreMember } from "@/types/staff"

export const DAYS = ['Mon 2/23', 'Tue 2/24', 'Wed 2/25 ●', 'Thu 2/26', 'Fri 2/27 ⚠', 'Sat 2/28', 'Sun 3/1']
export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const STAFF_EMPLOYEES: StaffEmployee[] = [
  {
    id: 'tara',
    initials: 'TC',
    avatarColor: '#1D5C3A',
    name: 'Tara C.',
    score: 91,
    scoreColor: 'good',
    shifts: [
      { time: '7a – 3p', variant: 'high' },
      { time: '7a – 3p', variant: 'high' },
      { time: '7a – 3p', variant: 'high' },
      { time: '7a – 3p', variant: 'high' },
      { time: 'Day Off', variant: 'off' },
      { time: 'Day Off', variant: 'off' },
      { time: '10a – 6p', variant: 'high' },
    ],
  },
  {
    id: 'marcus',
    initials: 'MR',
    avatarColor: '#1E4D7A',
    name: 'Marcus R.',
    score: 84,
    scoreColor: 'good',
    shifts: [
      { time: '11a – 7p', variant: 'high' },
      { time: '7a – 5p', variant: 'fatigue', flag: '😓 Fatigue risk', flagVariant: 'fatigue' },
      { time: 'Day Off', variant: 'off' },
      { time: '11a – 7p', variant: 'high' },
      { time: '11a – 3p', variant: 'suggested', flag: '✦ Suggested', flagVariant: 'suggested' },
      { time: '11a – 7p', variant: 'high' },
      { time: 'Day Off', variant: 'off' },
    ],
  },
  {
    id: 'devon',
    initials: 'DW',
    avatarColor: '#7A6A55',
    name: 'Devon W.',
    score: 80,
    scoreColor: 'good',
    shifts: [
      { time: 'Day Off', variant: 'off' },
      { time: '11a – 7p', variant: 'high' },
      { time: '7a – 5p', variant: 'fatigue', flag: '😓 Fatigue risk', flagVariant: 'fatigue' },
      { time: '3p – 9p', variant: 'high' },
      { time: '3p – 9p', variant: 'high' },
      { time: '7a – 3p', variant: 'high' },
      { time: '11a – 7p', variant: 'high' },
    ],
  },
  {
    id: 'sofia',
    initials: 'SK',
    avatarColor: '#555',
    name: 'Sofia K.',
    score: 69,
    scoreColor: 'ok',
    shifts: [
      { time: '3p – 9p', variant: 'mid' },
      { time: '3p – 9p', variant: 'mid' },
      { time: '11a – 7p', variant: 'mid' },
      { time: 'Day Off', variant: 'off' },
      { time: '3p – 9p', variant: 'mid' },
      { time: '3p – 9p', variant: 'mid' },
      { time: 'Day Off', variant: 'off' },
    ],
  },
  {
    id: 'jamie',
    initials: 'JL',
    avatarColor: '#B8622A',
    name: 'Jamie L.',
    score: 66,
    scoreColor: 'bad',
    shifts: [
      { time: '7a – 3p', variant: 'low' },
      { time: 'Day Off', variant: 'off' },
      { time: '3p – 9p', variant: 'low' },
      { time: '11a – 7p', variant: 'gap', flag: '⚠ Alone at peak', flagVariant: 'gap' },
      { time: '11a – 3p', variant: 'gap', flag: '⚠ Coverage gap', flagVariant: 'gap' },
      { time: '7a – 3p', variant: 'low' },
      { time: '3p – 9p', variant: 'low' },
    ],
  },
]

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec1',
    type: 'coverage',
    typeLabel: 'Coverage Gap',
    text: 'Add Tara C. or Marcus R. to Friday 11a–3p',
    detail:
      'Friday is your highest-traffic day. Jamie is the only staff scheduled during peak hours — a high scorer is needed to maintain service quality.',
  },
  {
    id: 'rec2',
    type: 'pairing',
    typeLabel: 'Weak Pairing',
    text: 'Pair Jamie L. with Tara C. on Thursday',
    detail:
      'Jamie is scheduled alone 11a–7p on Thursday. Pairing with a high scorer provides mentorship opportunity and service coverage during moderate traffic.',
  },
  {
    id: 'rec3',
    type: 'fatigue',
    typeLabel: 'Fatigue Flag',
    text: "Shorten Marcus R.'s Tuesday shift to 8 hours",
    detail:
      "Marcus's score drops an average of 11 points after hour 8. His Tuesday shift is 10 hours. Consider ending at 3p instead of 5p to protect performance quality.",
  },
  {
    id: 'rec4',
    type: 'peak',
    typeLabel: 'Peak Coverage',
    text: "Move Devon W.'s Saturday shift to start at 9a",
    detail:
      'Saturday traffic spikes between 10a–1p. Devon currently starts at 7a — shifting to 9a aligns their peak performance window with your busiest traffic hours.',
  },
]

export const TEAM_SCORES: TeamScoreMember[] = [
  { initials: 'TC', avatarColor: '#1D5C3A', name: 'Tara C.', score: 91, barWidth: '91%', barColor: 'var(--color-accent)', scoreColor: 'good' },
  { initials: 'MR', avatarColor: '#1E4D7A', name: 'Marcus R.', score: 84, barWidth: '84%', barColor: 'var(--color-accent)', scoreColor: 'good' },
  { initials: 'DW', avatarColor: '#7A6A55', name: 'Devon W.', score: 80, barWidth: '80%', barColor: 'var(--color-accent)', scoreColor: 'good' },
  { initials: 'SK', avatarColor: '#555', name: 'Sofia K.', score: 69, barWidth: '69%', barColor: 'var(--color-amber)', scoreColor: 'ok' },
  { initials: 'JL', avatarColor: '#B8622A', name: 'Jamie L.', score: 66, barWidth: '66%', barColor: 'var(--color-amber)', scoreColor: 'ok' },
]

// Heatmap: rows = [Morning, Lunch, Afternoon, Evening], cols = [Mon..Sun]
export const HEATMAP_ROWS = [
  {
    label: 'Morning',
    cells: ['#C8E6D6', '#D8EDE2', '#C8E6D6', '#D8EDE2', '#C8E6D6', '#A8D5BE', '#B8DCC8'],
  },
  {
    label: 'Lunch',
    cells: ['#2D8A58', '#3A9E68', '#1D5C3A', '#2D8A58', '#1D5C3A', '#156030', '#2D8A58'],
  },
  {
    label: 'Afternoon',
    cells: ['#7EC8A0', '#8ED2AC', '#7EC8A0', '#9EDAB8', '#5AB888', '#3A9E68', '#7EC8A0'],
  },
  {
    label: 'Evening',
    cells: ['#D8EDE2', '#C8E6D6', '#D8EDE2', '#D8EDE2', '#C8E6D6', '#B8DCC8', '#D8EDE2'],
  },
]

export const PEAK_BARS: { label: string; width: string; color: string }[] = [
  { label: 'High', width: '75%', color: 'var(--color-accent-mid)' },
  { label: 'Very High', width: '82%', color: 'var(--color-accent)' },
  { label: 'High', width: '68%', color: 'var(--color-accent-mid)' },
  { label: 'Moderate', width: '60%', color: '#5AB888' },
  { label: 'Critical ⚠', width: '95%', color: '#B52B1E' },
  { label: 'Very High', width: '88%', color: 'var(--color-accent)' },
  { label: 'High', width: '72%', color: 'var(--color-accent-mid)' },
]

export const SHIFT_HOURS_OPTIONS = [
  'Day Off', '6a – 2p', '7a – 3p', '8a – 4p', '9a – 5p',
  '10a – 6p', '11a – 7p', '11a – 3p', '3p – 9p', '4p – 10p', '5p – 11p',
]

export const STATION_OPTIONS = [
  'Register 1', 'Register 2', 'Floor / Stock', 'Manager on Duty', 'Flexible',
]

export const PAIRED_WITH_OPTIONS = [
  'Solo', 'Tara C.', 'Marcus R.', 'Devon W.', 'Sofia K.', 'Jamie L.',
]
