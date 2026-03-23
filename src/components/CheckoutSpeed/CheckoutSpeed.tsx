export default function CheckoutSpeed() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">Checkout Speed vs. Customers Served Per Hour</div>
          <div className="text-muted text-[11px] mt-0.5">Monthly average · Node 1 transaction data</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
          Direct throughput impact
        </div>
      </div>
      <div className="px-5 py-[18px]">
        <div className="grid grid-cols-2 gap-6 items-start">
          <div>
            <div className="flex gap-[14px] mb-[10px]">
              <div className="flex items-center gap-[5px] text-secondary text-[11px]">
                <div className="w-5 h-0.5 rounded-[1px]" style={{ background: '#C47F18' }} />
                Avg checkout time (s)
              </div>
              <div className="flex items-center gap-[5px] text-secondary text-[11px]">
                <div className="w-5 h-0.5 rounded-[1px]" style={{ background: '#1E4D7A' }} />
                Customers/hr
              </div>
            </div>
            <svg viewBox="0 0 460 120" preserveAspectRatio="none" className="w-full block">
              <line x1="0" y1="20" x2="460" y2="20" stroke="#F0EDE8" strokeWidth="1"/>
              <line x1="0" y1="55" x2="460" y2="55" stroke="#F0EDE8" strokeWidth="1"/>
              <line x1="0" y1="90" x2="460" y2="90" stroke="#F0EDE8" strokeWidth="1"/>
              <line x1="345" y1="0" x2="345" y2="120" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="4,3"/>
              <path d="M 20 38 L 135 45 L 250 60 L 345 72" fill="none" stroke="#C47F18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 345 72 L 440 82" fill="none" stroke="#C47F18" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round"/>
              <circle cx="20" cy="38" r="4" fill="#C47F18"/>
              <circle cx="135" cy="45" r="4" fill="#C47F18"/>
              <circle cx="250" cy="60" r="4" fill="#C47F18"/>
              <circle cx="345" cy="72" r="4" fill="#C47F18"/>
              <circle cx="440" cy="82" r="4" fill="white" stroke="#C47F18" strokeWidth="2"/>
              <path d="M 20 85 L 135 78 L 250 65 L 345 50" fill="none" stroke="#1E4D7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 345 50 L 440 38" fill="none" stroke="#1E4D7A" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round"/>
              <circle cx="20" cy="85" r="4" fill="#1E4D7A"/>
              <circle cx="135" cy="78" r="4" fill="#1E4D7A"/>
              <circle cx="250" cy="65" r="4" fill="#1E4D7A"/>
              <circle cx="345" cy="50" r="4" fill="#1E4D7A"/>
              <circle cx="440" cy="38" r="4" fill="white" stroke="#1E4D7A" strokeWidth="2"/>
              <text x="14" y="33" fontSize="9" fill="#C47F18" fontFamily="DM Mono">38s</text>
              <text x="129" y="40" fontSize="9" fill="#C47F18" fontFamily="DM Mono">36s</text>
              <text x="244" y="55" fontSize="9" fill="#C47F18" fontFamily="DM Mono">33s</text>
              <text x="339" y="67" fontSize="9" fill="#C47F18" fontFamily="DM Mono">29s</text>
              <text x="12" y="100" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono">72/hr</text>
              <text x="123" y="100" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono">76/hr</text>
              <text x="237" y="100" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono">81/hr</text>
              <text x="330" y="100" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono">87/hr</text>
              <text x="420" y="100" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono" opacity="0.6">93/hr</text>
            </svg>
            <div className="flex justify-between mt-[6px]">
              <span className="font-mono text-muted text-center text-[9.5px]">Nov</span>
              <span className="font-mono text-muted text-center text-[9.5px]">Dec</span>
              <span className="font-mono text-muted text-center text-[9.5px]">Jan</span>
              <span className="font-mono text-muted text-center text-[9.5px]">Feb</span>
              <span className="font-mono text-center text-[9.5px]" style={{ color: '#1E4D7A', opacity: 0.6 }}>Mar ›</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-7">
            <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] px-[13px] py-[10px]">
              <span className="text-[13px] shrink-0 mt-px">⚡</span>
              <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
                Checkout speed improved from <strong>38s → 29s average</strong> over 4 months. That&apos;s{' '}
                <strong>+15 additional customers served per hour</strong> — meaning less line abandonment
                and more completed transactions.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-[9px] px-[13px] py-[10px]" style={{ background: '#E6EEF7' }}>
              <span className="text-[13px] shrink-0 mt-px">💰</span>
              <p className="text-[12px] leading-[1.5]" style={{ color: '#1E4D7A' }}>
                <strong style={{ color: '#1E4D7A' }}>At $8.40 avg basket size,</strong> serving 15 more customers/hr during a 6-hour
                peak window adds an estimated <strong style={{ color: '#1E4D7A' }}>$756/day</strong> in captured revenue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
