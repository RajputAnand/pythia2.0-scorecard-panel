export default function HospitalityVsDwell() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">Hospitality Score vs. Avg Dwell Time</div>
          <div className="text-muted text-[11px] mt-0.5">Monthly · Node 2 customer tracking</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
          r = 0.87 correlation
        </div>
      </div>
      <div className="px-5 py-[18px]">
        <div className="flex gap-[14px] mb-[10px]">
          <div className="flex items-center gap-[5px] text-secondary text-[11px]">
            <div className="w-5 h-0.5 rounded-[1px]" style={{ background: '#1D5C3A' }} />
            Hospitality score
          </div>
          <div className="flex items-center gap-[5px] text-secondary text-[11px]">
            <div className="w-5 h-0.5 rounded-[1px]" style={{ background: '#5C3A8C' }} />
            Avg dwell (min)
          </div>
          <div className="flex items-center gap-[5px] text-secondary text-[11px]">
            <div className="w-5 h-0.5 rounded-[1px]" style={{ background: 'repeating-linear-gradient(90deg,#1D5C3A 0,#1D5C3A 4px,transparent 4px,transparent 8px)' }} />
            Score projected
          </div>
        </div>
        <svg viewBox="0 0 460 140" preserveAspectRatio="none" className="w-full block">
          <line x1="0" y1="20" x2="460" y2="20" stroke="#F0EDE8" strokeWidth="1"/>
          <line x1="0" y1="50" x2="460" y2="50" stroke="#F0EDE8" strokeWidth="1"/>
          <line x1="0" y1="80" x2="460" y2="80" stroke="#F0EDE8" strokeWidth="1"/>
          <line x1="0" y1="110" x2="460" y2="110" stroke="#F0EDE8" strokeWidth="1"/>
          <line x1="345" y1="0" x2="345" y2="140" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="4,3"/>
          <text x="350" y="12" fontSize="8" fill="#B0A89E" fontFamily="DM Mono">Projected →</text>
          <path d="M 20 108 L 135 100 L 250 82 L 345 65" fill="none" stroke="#1D5C3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 345 65 L 440 50" fill="none" stroke="#1D5C3A" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round"/>
          <circle cx="20" cy="108" r="4" fill="#1D5C3A"/>
          <circle cx="135" cy="100" r="4" fill="#1D5C3A"/>
          <circle cx="250" cy="82" r="4" fill="#1D5C3A"/>
          <circle cx="345" cy="65" r="4" fill="#1D5C3A"/>
          <circle cx="440" cy="50" r="4" fill="white" stroke="#1D5C3A" strokeWidth="2"/>
          <path d="M 20 115 L 135 105 L 250 88 L 345 70" fill="none" stroke="#5C3A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 345 70 L 440 54" fill="none" stroke="#5C3A8C" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round"/>
          <circle cx="20" cy="115" r="4" fill="#5C3A8C"/>
          <circle cx="135" cy="105" r="4" fill="#5C3A8C"/>
          <circle cx="250" cy="88" r="4" fill="#5C3A8C"/>
          <circle cx="345" cy="70" r="4" fill="#5C3A8C"/>
          <circle cx="440" cy="54" r="4" fill="white" stroke="#5C3A8C" strokeWidth="2"/>
          <text x="15" y="103" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">71</text>
          <text x="130" y="95" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">74</text>
          <text x="245" y="77" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">79</text>
          <text x="340" y="60" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">84</text>
          <text x="9" y="128" fontSize="9" fill="#5C3A8C" fontFamily="DM Mono" fontWeight="500">3:42</text>
          <text x="122" y="128" fontSize="9" fill="#5C3A8C" fontFamily="DM Mono" fontWeight="500">3:58</text>
          <text x="237" y="128" fontSize="9" fill="#5C3A8C" fontFamily="DM Mono" fontWeight="500">4:11</text>
          <text x="330" y="128" fontSize="9" fill="#5C3A8C" fontFamily="DM Mono" fontWeight="500">4:28</text>
          <text x="422" y="128" fontSize="9" fill="#5C3A8C" fontFamily="DM Mono" fontWeight="500" opacity="0.6">4:45</text>
        </svg>
        <div className="flex justify-between mt-[6px]">
          <span className="font-mono text-muted text-center text-[9.5px]">Nov</span>
          <span className="font-mono text-muted text-center text-[9.5px]">Dec</span>
          <span className="font-mono text-muted text-center text-[9.5px]">Jan</span>
          <span className="font-mono text-muted text-center text-[9.5px]">Feb</span>
          <span className="font-mono text-center text-[9.5px]" style={{ color: '#1E4D7A', opacity: 0.6 }}>Mar ›</span>
        </div>
        <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] mt-3 px-[13px] py-[10px]">
          <span className="text-[13px] shrink-0 mt-[1px]">🕐</span>
          <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
            Each <strong>5-point hospitality improvement</strong> adds approximately{' '}
            <strong>18 seconds of dwell time.</strong> Longer dwell correlates to +2.3% basket size —
            customers who stay longer buy more.
          </p>
        </div>
      </div>
    </div>
  )
}
