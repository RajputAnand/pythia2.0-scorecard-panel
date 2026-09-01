import type { LineChartSvgProps } from '@/types/line-chart'

export default function LineChartSvg({
  viewBox,
  gridLines,
  yLabels,
  series,
  xLabels,
  minorTicks,
  verticalMarker,
  streakBadge,
}: LineChartSvgProps) {
  const svgWidth = Number(viewBox.split(' ')[2])

  return (
    <div>
      <svg width="100%" viewBox={viewBox} preserveAspectRatio="none">
        {/* Grid lines */}
        {gridLines.map((gl) => (
          <line key={gl.y} x1="0" y1={gl.y} x2={svgWidth} y2={gl.y} stroke="#F0EDE8" strokeWidth="1" />
        ))}

        {/* Minor ticks — finer-grained markers along the x-axis (e.g. one per week under monthly labels) */}
        {minorTicks?.map((tick, i) => (
          <line key={i} x1={tick.x} y1={tick.y1} x2={tick.x} y2={tick.y2} stroke="#D8D2C8" strokeWidth="1" />
        ))}

        {/* Vertical marker */}
        {verticalMarker && (
          <>
            <line
              x1={verticalMarker.x} y1="0"
              x2={verticalMarker.x} y2={verticalMarker.height}
              stroke="#E4DFD8" strokeWidth="1"
              strokeDasharray={verticalMarker.strokeDasharray ?? '3,3'}
            />
            <text
              x={verticalMarker.labelX ?? verticalMarker.x + 3} y={verticalMarker.labelY ?? 12}
              fontSize="8" fill="#B0A89E" fontFamily="DM Mono"
            >
              {verticalMarker.label}
            </text>
          </>
        )}

        {/* Series */}
        {series.map((s, i) => (
          <g key={i}>
            <path
              d={s.path} fill="none" stroke={s.color}
              strokeWidth={s.strokeWidth}
              strokeDasharray={s.strokeDasharray}
              strokeLinecap="round" strokeLinejoin="round"
            />
            {s.extension && (
              <path
                d={s.extension.path} fill="none" stroke={s.color}
                strokeWidth={s.extension.strokeWidth ?? s.strokeWidth}
                strokeDasharray={s.extension.strokeDasharray}
                strokeLinecap="round"
              />
            )}
            {s.dots.map((dot, j) => (
              <circle
                key={j}
                cx={dot.cx} cy={dot.cy} r={dot.r}
                fill={dot.fill ?? s.color}
                stroke={dot.stroke}
                strokeWidth={dot.strokeWidth}
              />
            ))}
            {s.labels.map((lbl, k) => (
              <text
                key={k}
                x={lbl.x} y={lbl.y}
                fontSize="9" fill={s.color} fontFamily="DM Mono" fontWeight="500"
                opacity={lbl.opacity}
              >
                {lbl.value}
              </text>
            ))}
          </g>
        ))}

        {/* Y-axis labels */}
        {yLabels.map((yl) => (
          <text key={`${yl.x}-${yl.y}`} x={yl.x} y={yl.y} fontSize="9" fill="#B0A89E" fontFamily="DM Mono">
            {yl.value}
          </text>
        ))}

        {/* Streak badge */}
        {streakBadge && (
          <>
            <rect
              x={streakBadge.x} y={streakBadge.y}
              width={streakBadge.width} height={streakBadge.height}
              rx="5" fill="#1D5C3A" opacity="0.12"
            />
            <text
              x={streakBadge.x + 6} y={streakBadge.y + 15}
              fontSize="9" fill="#1D5C3A" fontFamily="DM Sans" fontWeight="600"
            >
              {streakBadge.text}
            </text>
          </>
        )}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-[5px]">
        {xLabels.map(({ label, highlight, color, opacity }, index) => (
          <span
            key={`${label}-${index}`}
            className={`font-mono text-center text-[9.5px] ${
              highlight ? 'text-accent font-semibold' : color ? '' : 'text-muted'
            }`}
            style={color !== undefined || opacity !== undefined ? { color, opacity } : undefined}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
