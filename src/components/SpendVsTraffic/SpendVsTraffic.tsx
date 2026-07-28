export default function SpendVsTraffic() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-start justify-between px-[22px] py-4 border-b border-border gap-3">
        <div>
          <div className="text-[13.5px] font-semibold">Campaign Spend vs. Foot Traffic Response</div>
          <div className="text-[11.5px] text-muted mt-[2px]">Monthly · All channels combined · Node 2 foot traffic vs. spend log</div>
        </div>
        <div className="flex gap-[6px] shrink-0">
          <div className="text-[10.5px] px-[10px] py-1 rounded-full bg-accent-light text-accent font-semibold">Social N/A ROAS</div>
          <div className="text-[10.5px] px-[10px] py-1 rounded-full bg-amber-light text-amber font-semibold">Signage N/A ROAS</div>
        </div>
      </div>

      <div className="px-[22px] py-5">
        {/* Legend */}
        <div className="flex gap-[14px] mb-3 flex-wrap">
          {[
            { color: '#1E4D7A', label: 'Paid Social', type: 'dot' },
            { color: '#1D5C3A', label: 'In-Store Promo', type: 'dot' },
            { color: '#5C3A8C', label: 'Email/SMS', type: 'dot' },
            { color: '#C47F18', label: 'Signage', type: 'dot' },
            { color: '#1A1714', label: 'Foot traffic index', type: 'line' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-[5px] text-[11px] text-secondary">
              {item.type === 'dot'
                ? <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: item.color }} />
                : <div className="w-[18px] h-[2px] shrink-0" style={{ background: item.color }} />
              }
              {item.label}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="relative">
          <svg width="100%" viewBox="0 0 800 180" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="30"  x2="800" y2="30"  stroke="#F0EDE8" strokeWidth="1"/>
            <line x1="0" y1="70"  x2="800" y2="70"  stroke="#F0EDE8" strokeWidth="1"/>
            <line x1="0" y1="110" x2="800" y2="110" stroke="#F0EDE8" strokeWidth="1"/>
            <line x1="0" y1="150" x2="800" y2="150" stroke="#F0EDE8" strokeWidth="1"/>
            {/* Month dividers */}
            <line x1="200" y1="0" x2="200" y2="180" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="3,3"/>
            <line x1="400" y1="0" x2="400" y2="180" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="3,3"/>
            <line x1="600" y1="0" x2="600" y2="180" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="3,3"/>
            {/* Social spend bars */}
            <rect x="20"  y="110" width="30" height="40"  rx="3" fill="#1E4D7A" opacity="0.8"/>
            <rect x="220" y="90"  width="30" height="60"  rx="3" fill="#1E4D7A" opacity="0.8"/>
            <rect x="420" y="70"  width="30" height="80"  rx="3" fill="#1E4D7A" opacity="0.8"/>
            <rect x="620" y="50"  width="30" height="100" rx="3" fill="#1E4D7A" opacity="0.9"/>
            {/* In-store promo bars */}
            <rect x="55"  y="120" width="30" height="30" rx="3" fill="#1D5C3A" opacity="0.8"/>
            <rect x="255" y="115" width="30" height="35" rx="3" fill="#1D5C3A" opacity="0.8"/>
            <rect x="455" y="100" width="30" height="50" rx="3" fill="#1D5C3A" opacity="0.8"/>
            <rect x="655" y="95"  width="30" height="55" rx="3" fill="#1D5C3A" opacity="0.9"/>
            {/* Email bars */}
            <rect x="90"  y="130" width="30" height="20" rx="3" fill="#5C3A8C" opacity="0.8"/>
            <rect x="290" y="125" width="30" height="25" rx="3" fill="#5C3A8C" opacity="0.8"/>
            <rect x="490" y="118" width="30" height="32" rx="3" fill="#5C3A8C" opacity="0.8"/>
            <rect x="690" y="115" width="30" height="35" rx="3" fill="#5C3A8C" opacity="0.9"/>
            {/* Signage bars */}
            <rect x="125" y="125" width="30" height="25" rx="3" fill="#C47F18" opacity="0.8"/>
            <rect x="325" y="120" width="30" height="30" rx="3" fill="#C47F18" opacity="0.8"/>
            <rect x="525" y="115" width="30" height="35" rx="3" fill="#C47F18" opacity="0.8"/>
            <rect x="725" y="110" width="30" height="40" rx="3" fill="#C47F18" opacity="0.9"/>
            {/* Foot traffic line */}
            <path d="M 100 130 L 300 115 L 500 90 L 700 65" fill="none" stroke="#1A1714" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="100" cy="130" r="4" fill="#1A1714"/>
            <circle cx="300" cy="115" r="4" fill="#1A1714"/>
            <circle cx="500" cy="90"  r="4" fill="#1A1714"/>
            <circle cx="700" cy="65"  r="4" fill="#1A1714"/>
            {/* Traffic labels */}
            <text x="90"  y="125" fontSize="9" fill="#1A1714" fontFamily="DM Mono" fontWeight="500">N/A</text>
            <text x="285" y="110" fontSize="9" fill="#1A1714" fontFamily="DM Mono" fontWeight="500">N/A</text>
            <text x="485" y="85"  fontSize="9" fill="#1A1714" fontFamily="DM Mono" fontWeight="500">N/A</text>
            <text x="685" y="60"  fontSize="9" fill="#1A1714" fontFamily="DM Mono" fontWeight="500">N/A</text>
            {/* Y labels */}
            <text x="0" y="34"  fontSize="9" fill="#B0A89E" fontFamily="DM Mono">High</text>
            <text x="0" y="74"  fontSize="9" fill="#B0A89E" fontFamily="DM Mono">Med</text>
            <text x="0" y="114" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">Low</text>
          </svg>
        </div>

        {/* X labels */}
        <div className="flex justify-between mt-[5px] px-1">
          {['November', 'December', 'January', 'February'].map((m) => (
            <span key={m} className="font-mono text-[9.5px] text-muted text-center">{m}</span>
          ))}
        </div>

        {/* Callout */}
        <div className="mt-[13px] bg-accent-light rounded-[9px] px-[13px] py-[10px] text-[12px] text-accent leading-[1.5]">
          <strong className="font-semibold">Channel performance data is not yet available.</strong> ROAS and traffic lift figures will populate once live data is connected.
        </div>
      </div>
    </div>
  )
}
