import type { LineChartSvgProps } from '@/types/line-chart'

interface PositionedLabel {
  key: string
  x: number
  y: number
  color: string
  value: string
  opacity?: number
}

function getStaggeredLabels(series: LineChartSvgProps['series'], svgHeight: number): PositionedLabel[] {
  const allLabels: {
    key: string
    x: number
    y: number
    color: string
    value: string
    opacity?: number
  }[] = []

  series.forEach((s, sIdx) => {
    s.labels.forEach((lbl, lIdx) => {
      allLabels.push({
        key: `${sIdx}-${lIdx}-${lbl.value}`,
        x: lbl.x,
        y: lbl.y,
        color: s.color,
        value: lbl.value,
        opacity: lbl.opacity,
      })
    })
  })

  if (allLabels.length <= 1) {
    return allLabels
  }

  const X_TOLERANCE = 30
  const MIN_Y_GAP = 14
  const minY = 10
  const maxY = svgHeight - 6

  // Group labels that are close horizontally (belonging to same time point / tick)
  const groups: (typeof allLabels)[] = []
  const remaining = [...allLabels]

  while (remaining.length > 0) {
    const current = remaining.shift()!
    const group = [current]
    let i = 0
    while (i < remaining.length) {
      if (Math.abs(remaining[i].x - current.x) <= X_TOLERANCE) {
        group.push(remaining.splice(i, 1)[0])
      } else {
        i++
      }
    }
    groups.push(group)
  }

  const result: PositionedLabel[] = []

  for (const group of groups) {
    if (group.length <= 1) {
      result.push(group[0])
      continue
    }

    // Sort by y position ascending (top to bottom)
    group.sort((a, b) => a.y - b.y)

    // Iterative relaxation to resolve vertical overlaps
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 0; i < group.length - 1; i++) {
        const gap = group[i + 1].y - group[i].y
        if (gap < MIN_Y_GAP) {
          const overlap = MIN_Y_GAP - gap
          group[i].y -= overlap / 2
          group[i + 1].y += overlap / 2
        }
      }
      for (let i = group.length - 1; i > 0; i--) {
        const gap = group[i].y - group[i - 1].y
        if (gap < MIN_Y_GAP) {
          const overlap = MIN_Y_GAP - gap
          group[i - 1].y -= overlap / 2
          group[i].y += overlap / 2
        }
      }
    }

    // Bounds clamping
    if (group[0].y < minY) {
      const shift = minY - group[0].y
      for (const item of group) {
        item.y += shift
      }
    }
    const lastItem = group[group.length - 1]
    if (lastItem.y > maxY) {
      const shift = lastItem.y - maxY
      for (const item of group) {
        item.y = Math.max(minY, item.y - shift)
      }
    }

    // Enforce strictly monotonic gap
    for (let i = 0; i < group.length - 1; i++) {
      if (group[i + 1].y < group[i].y + MIN_Y_GAP) {
        group[i + 1].y = group[i].y + MIN_Y_GAP
      }
    }

    group.forEach((item) => {
      result.push({
        ...item,
        y: Math.round(item.y * 10) / 10,
      })
    })
  }

  return result
}

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
  verticalLines = 'highlighted',
  onHoverIndexChange,
  onHoverPointerChange,
}: LineChartSvgProps) {
  const svgWidth = Number(viewBox.split(' ')[2])
  const svgHeight = Number(viewBox.split(' ')[3])
  const staggeredLabels = getStaggeredLabels(series, svgHeight)

  const xPositions =
    hoverXPositions && hoverXPositions.length === xLabels.length
      ? hoverXPositions
      : series[0]?.dots && series[0].dots.length === xLabels.length
        ? series[0].dots.map((d) => d.cx)
        : null

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

        {/* Vertical guide lines crossing from important / highlighted X-axis points */}
        {verticalLines !== 'none' && xPositions && xLabels.map(({ highlight }, index) => {
          const shouldShow = verticalLines === 'all' || (verticalLines === 'highlighted' && highlight)
          if (!shouldShow || hoverIndex === index) return null
          const xPos = xPositions[index]
          return (
            <line
              key={`v-line-${index}`}
              x1={xPos}
              y1={gridLines[0]?.y ?? 0}
              x2={xPos}
              y2={svgHeight}
              stroke="#E4DFD8"
              strokeWidth="1"
              strokeDasharray="3,3"
              pointerEvents="none"
            />
          )
        })}

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
          </g>
        ))}

        {/* De-overlapped / staggered series labels with crisp halo */}
        {staggeredLabels.map((lbl) => (
          <text
            key={lbl.key}
            x={lbl.x}
            y={lbl.y}
            fontSize="9"
            fill={lbl.color}
            fontFamily="DM Mono"
            fontWeight="600"
            opacity={lbl.opacity}
            paintOrder="stroke fill"
            stroke="var(--color-surface, #ffffff)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          >
            {lbl.value}
          </text>
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
      {xPositions ? (
        <div
          className="relative mt-[5px] h-[18px] w-full select-none"
          onMouseLeave={() => onHoverIndexChange?.(null)}
        >
          {xLabels.map(({ label, highlight, color, opacity }, index) => {
            const pct = (xPositions[index] / svgWidth) * 100
            const isHovered = hoverIndex === index
            const isHighlighted = hoverIndex != null ? isHovered : highlight

            let transform = 'translateX(-50%)'
            if (index === 0 && pct < 4) {
              transform = 'none'
            } else if (index === xLabels.length - 1 && pct > 96) {
              transform = 'translateX(-100%)'
            }

            return (
              <span
                key={`${label}-${index}`}
                className={`absolute top-0 font-mono text-[9.5px] transition-colors whitespace-nowrap ${
                  onHoverIndexChange ? 'cursor-pointer' : ''
                } ${
                  isHighlighted ? 'text-accent font-semibold' : color ? '' : 'text-gray-800'
                }`}
                style={{
                  left: `${pct}%`,
                  transform,
                  ...(color !== undefined || opacity !== undefined ? { color, opacity } : {}),
                }}
                onMouseEnter={() => onHoverIndexChange?.(index)}
              >
                {label}
              </span>
            )
          })}
        </div>
      ) : (
        <div
          className="flex justify-between mt-[5px]"
          onMouseLeave={() => onHoverIndexChange?.(null)}
        >
          {xLabels.map(({ label, highlight, color, opacity }, index) => {
            const isHovered = hoverIndex === index
            const isHighlighted = hoverIndex != null ? isHovered : highlight

            return (
              <span
                key={`${label}-${index}`}
                className={`font-mono text-center text-[9.5px] transition-colors ${
                  onHoverIndexChange ? 'cursor-pointer' : ''
                } ${
                  isHighlighted ? 'text-accent font-semibold' : color ? '' : 'text-gray-800'
                }`}
                style={color !== undefined || opacity !== undefined ? { color, opacity } : undefined}
                onMouseEnter={() => onHoverIndexChange?.(index)}
              >
                {label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
