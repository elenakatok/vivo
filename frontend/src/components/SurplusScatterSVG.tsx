// Hand-rolled SVG scatter plot — no external charting library (matching grays house style).
// Vivo-local. Generalized from Winemaster's scatter: the frontier prop takes an ARRAY of
// lines (each with its own points/label/color) instead of a single line. With one line it
// behaves like Winemaster; Vivo passes four constant-joint-value frontier lines.
//
// UNITS NOTE: Vivo's raw scores are ALREADY in $M (the scoring formula outputs e.g. 1, 6, 23) —
// unlike Winemaster, which stores dollars. So the caller passes points in $M and this component
// does NOT divide by 1e6. Frontier line endpoints are likewise in $M. Axis titles say "US$ million".

const SW = 920, SH = 640
const SM = { top: 68, left: 112, right: 50, bottom: 92 }
const SPW = SW - SM.left - SM.right
const SPH = SH - SM.top - SM.bottom - 92  // reserve a strip below the x-axis title for the legend

export interface ScatterPoint {
  x: number  // Vivo raw score ($M)
  y: number  // ADS raw score ($M)
  label: string
}

/** A frontier line: a polyline of points (in $M; x = Vivo, y = ADS), an optional legend
 *  label (a short "$NM" tag is auto-extracted from it for the on-line marker), and a color. */
export interface FrontierLine {
  points: { x: number; y: number }[]
  label?: string
  color?: string
}

function niceTicks(min: number, max: number, count = 6): number[] {
  const range = max - min || 1
  const raw = range / count
  const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)))
  const norm = raw / mag
  const step = norm < 1.5 ? mag : norm < 3.5 ? 2 * mag : norm < 7.5 ? 5 * mag : 10 * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let t = start; t <= max + step * 0.01; t += step) ticks.push(t)
  return ticks
}

// Plain decimal ticks ("$ millions" lives in the axis titles): 0, 0.5, 1, 2.5, …
function fmtMillions(n: number): string {
  const r = Math.round(n * 100) / 100
  if (r === 0) return '0'
  const sign = r < 0 ? '−' : ''
  const s = Math.abs(r).toFixed(2).replace(/\.?0+$/, '')
  return sign + s
}

const DEFAULT_LINE_COLOR = '#991b1b'

export function SurplusScatterSVG({
  points,
  frontier,
  svgRef,
}: {
  points: ScatterPoint[]
  /** Optional frontier lines (each in $M: x = Vivo, y = ADS). Empty/absent → just the dots. */
  frontier?: FrontierLine[]
  svgRef: React.RefObject<SVGSVGElement | null>
}) {
  if (points.length === 0) {
    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${SW} ${SH}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <rect width={SW} height={SH} fill="#ffffff" />
        <text x={SW / 2} y={SH / 2} textAnchor="middle" fontSize={16} fill="#9ca3af" fontFamily="sans-serif">
          No completed groups yet.
        </text>
      </svg>
    )
  }

  const lines = frontier ?? []
  const linePoints = lines.flatMap(l => l.points)

  // Auto-scale over BOTH the dots and EVERY frontier line endpoint so nothing clips.
  const allX = [...points.map(p => p.x), ...linePoints.map(p => p.x)]
  const allY = [...points.map(p => p.y), ...linePoints.map(p => p.y)]
  const rawMinX = Math.min(...allX), rawMaxX = Math.max(...allX)
  const rawMinY = Math.min(...allY), rawMaxY = Math.max(...allY)

  // Pad axes so points don't sit on the edge; always include 0 for the zero-line.
  const padX = (rawMaxX - rawMinX) * 0.10 || Math.abs(rawMinX) * 0.15 || 1
  const padY = (rawMaxY - rawMinY) * 0.10 || Math.abs(rawMinY) * 0.15 || 1
  const axisMinX = Math.min(rawMinX - padX, -0.5)
  const axisMaxX = Math.max(rawMaxX + padX, 0.5)
  const axisMinY = Math.min(rawMinY - padY, -0.5)
  const axisMaxY = Math.max(rawMaxY + padY, 0.5)

  const spanX = axisMaxX - axisMinX
  const spanY = axisMaxY - axisMinY

  const xPx = (v: number) => SM.left + ((v - axisMinX) / spanX) * SPW
  const yPx = (v: number) => SM.top + SPH - ((v - axisMinY) / spanY) * SPH

  const xTicks = niceTicks(axisMinX, axisMaxX, 7)
  const yTicks = niceTicks(axisMinY, axisMaxY, 6)

  const zeroX = xPx(0)
  const zeroY = yPx(0)

  const plotBottom = SM.top + SPH

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SW} ${SH}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <rect width={SW} height={SH} fill="#ffffff" />

      {/* Title */}
      <text x={SW / 2} y={28} textAnchor="middle" fontSize={20} fontWeight={700} fill="#111" fontFamily="sans-serif">
        Surplus Scatter — Vivo vs. ADS
      </text>
      <text x={SW / 2} y={50} textAnchor="middle" fontSize={12} fill="#6b7280" fontFamily="sans-serif">
        One dot per group · constant-joint-value frontier lines · profits in US$ million
      </text>

      {/* Clip path */}
      <defs>
        <clipPath id="vivo-scatter-clip">
          <rect x={SM.left} y={SM.top} width={SPW} height={SPH} />
        </clipPath>
      </defs>

      {/* Plot background */}
      <rect x={SM.left} y={SM.top} width={SPW} height={SPH} fill="#f9fafb" stroke="#e5e7eb" />

      {/* Horizontal gridlines + y-axis labels */}
      {yTicks.map(t => {
        const y = yPx(t)
        if (y < SM.top - 1 || y > plotBottom + 1) return null
        return (
          <g key={`y${t}`}>
            <line x1={SM.left} y1={y} x2={SM.left + SPW} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={SM.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#9ca3af" fontFamily="sans-serif">
              {fmtMillions(t)}
            </text>
          </g>
        )
      })}

      {/* Vertical gridlines + x-axis labels */}
      {xTicks.map(t => {
        const x = xPx(t)
        if (x < SM.left - 1 || x > SM.left + SPW + 1) return null
        return (
          <g key={`x${t}`}>
            <line x1={x} y1={SM.top} x2={x} y2={plotBottom} stroke="#e5e7eb" strokeWidth={1} />
            <text x={x} y={plotBottom + 17} textAnchor="middle" fontSize={11} fill="#6b7280" fontFamily="sans-serif">
              {fmtMillions(t)}
            </text>
          </g>
        )
      })}

      {/* Zero lines (BATNA boundary) — subtle gray so they don't compete with the frontier lines */}
      {zeroX >= SM.left && zeroX <= SM.left + SPW && (
        <line x1={zeroX} y1={SM.top} x2={zeroX} y2={plotBottom}
          stroke="#9ca3af" strokeWidth={1} strokeDasharray="4,4" opacity={0.6} clipPath="url(#vivo-scatter-clip)" />
      )}
      {zeroY >= SM.top && zeroY <= plotBottom && (
        <line x1={SM.left} y1={zeroY} x2={SM.left + SPW} y2={zeroY}
          stroke="#9ca3af" strokeWidth={1} strokeDasharray="4,4" opacity={0.6} clipPath="url(#vivo-scatter-clip)" />
      )}

      {/* Frontier lines — one polyline each, with endpoint dots + an on-line $NM tag. */}
      {lines.map((ln, i) => {
        if (ln.points.length < 2) return null
        const color = ln.color ?? DEFAULT_LINE_COLOR
        const poly = ln.points.map(p => `${xPx(p.x)},${yPx(p.y)}`).join(' ')
        const mid = ln.points[Math.floor(ln.points.length / 2)]
        const a = ln.points[0], b = ln.points[ln.points.length - 1]
        const midX = ln.points.length % 2 === 1 ? mid.x : (a.x + b.x) / 2
        const midY = ln.points.length % 2 === 1 ? mid.y : (a.y + b.y) / 2
        const tag = (ln.label?.match(/\$\s?\d+(?:\.\d+)?M/) ?? [])[0] ?? ln.label ?? ''
        return (
          <g key={`fr${i}`} clipPath="url(#vivo-scatter-clip)">
            <polyline points={poly} fill="none" stroke={color} strokeWidth={3} />
            {ln.points.map((p, j) => (
              <circle key={j} cx={xPx(p.x)} cy={yPx(p.y)} r={4} fill={color} />
            ))}
            <text x={xPx(midX) + 8} y={yPx(midY) - 6} fontSize={12} fontWeight={700} fill={color} fontFamily="sans-serif">
              {tag}
            </text>
          </g>
        )
      })}

      {/* Axis lines */}
      <line x1={SM.left} y1={SM.top} x2={SM.left} y2={plotBottom} stroke="#374151" strokeWidth={2} />
      <line x1={SM.left} y1={plotBottom} x2={SM.left + SPW} y2={plotBottom} stroke="#374151" strokeWidth={2} />

      {/* Y-axis title — ADS */}
      <text
        x={SM.left - 86} y={SM.top + SPH / 2}
        transform={`rotate(-90, ${SM.left - 86}, ${SM.top + SPH / 2})`}
        textAnchor="middle" fontSize={13} fill="#374151" fontFamily="sans-serif"
      >
        ADS expected profit (US$ million)
      </text>

      {/* X-axis title — Vivo */}
      <text
        x={SM.left + SPW / 2} y={plotBottom + 46}
        textAnchor="middle" fontSize={13} fill="#374151" fontFamily="sans-serif"
      >
        Vivo expected profit (US$ million)
      </text>

      {/* Data points + labels */}
      {points.map((p, i) => {
        const cx = xPx(p.x)
        const cy = yPx(p.y)
        const labelY = cy < SM.top + 22 ? cy + 18 : cy - 12
        return (
          <g key={`pt${i}`} clipPath="url(#vivo-scatter-clip)">
            <circle cx={cx} cy={cy} r={9} fill="#2563eb" opacity={0.78} />
            <text x={cx} y={labelY} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1e3a8a" fontFamily="sans-serif">
              {p.label}
            </text>
          </g>
        )
      })}

      {/* Legend — full descriptive labels with color swatches, below the x-axis title. */}
      {lines.length > 0 && (
        <g fontFamily="sans-serif">
          {lines.map((ln, i) => {
            const color = ln.color ?? DEFAULT_LINE_COLOR
            const ly = plotBottom + 70 + i * 18
            return (
              <g key={`lg${i}`}>
                <line x1={SM.left} y1={ly - 4} x2={SM.left + 26} y2={ly - 4} stroke={color} strokeWidth={3} />
                <text x={SM.left + 34} y={ly} fontSize={11.5} fill="#374151">{ln.label ?? `Line ${i + 1}`}</text>
              </g>
            )
          })}
        </g>
      )}

      {/* Point count */}
      <text x={SW - SM.right} y={SM.top - 10} textAnchor="end" fontSize={12} fill="#9ca3af" fontFamily="sans-serif">
        N = {points.length} group{points.length !== 1 ? 's' : ''}
      </text>
    </svg>
  )
}
