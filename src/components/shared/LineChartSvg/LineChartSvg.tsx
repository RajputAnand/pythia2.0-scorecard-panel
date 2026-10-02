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
  hoverIndex,
  hoverXPositions,
  onHoverIndexChange,
  onHoverPointerChange,
}: LineChartSvgProps) {
  const svgWidth = Number(viewBox.split(' ')[2])
  const svgHeight = Number(viewBox.split(' ')[3])

  return (
    <div>
      <svg
        width="100%"
        viewBox={viewBox}
        preserveAspectRatio="none"
        onMouseLeave={() => {
          onHoverIndexChange?.(null)
          onHoverPointerChange?.(null)
        }}
      >
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

        {hoverIndex != null && hoverXPositions?.[hoverIndex] != null && (
          <g pointerEvents="none">
            <line x1={hoverXPositions[hoverIndex]} y1="0" x2={hoverXPositions[hoverIndex]} y2={svgHeight} stroke="#9B9489" strokeWidth="1" strokeDasharray="3,3" />
            {series.map((s, i) => {
              const dot = s.dots.reduce<LineChartSvgProps['series'][number]['dots'][number] | undefined>((nearest, current) => {
                if (!nearest) return current
                return Math.abs(current.cx - hoverXPositions[hoverIndex]) < Math.abs(nearest.cx - hoverXPositions[hoverIndex]) ? current : nearest
              }, undefined)
              return dot && Math.abs(dot.cx - hoverXPositions[hoverIndex]) < 1
                ? <circle key={i} cx={dot.cx} cy={dot.cy} r={5} fill="white" stroke={s.color} strokeWidth="2" />
                : null
            })}
          </g>
        )}

        {onHoverIndexChange && series.map((s, seriesIndex) => s.dots.map((dot, index) => (
          <circle
            key={`hover-${seriesIndex}-${index}`}
            cx={dot.cx}
            cy={dot.cy}
            r={9}
            fill="transparent"
            onMouseEnter={() => {
              const nearestIndex = hoverXPositions?.reduce((nearest, x, candidateIndex) =>
                Math.abs(x - dot.cx) < Math.abs(hoverXPositions[nearest] - dot.cx) ? candidateIndex : nearest, 0)
              onHoverIndexChange(nearestIndex ?? index)
            }}
            onMouseMove={(event) => {
              const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
              if (bounds && bounds.width > 0 && bounds.height > 0) {
                onHoverPointerChange?.({
                  x: event.clientX - bounds.left,
                  y: event.clientY - bounds.top,
                  width: bounds.width,
                  height: bounds.height,
                })
              }
            }}
            onMouseLeave={() => {
              onHoverIndexChange(null)
              onHoverPointerChange?.(null)
            }}
          />
        )))}

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
              highlight ? 'text-accent font-semibold' : color ? '' : 'text-gray-800'
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
