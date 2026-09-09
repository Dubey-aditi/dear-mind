// The arrangement from the welcome screen: one open flower, a leafy sprig,
// and two navy buds. The composition was measured off illustrations/1.png and
// scaled into this 200x190 box.

type FloralMarkProps = {
  className?: string
}

type Point = { x: number; y: number }

/**
 * The stem, as the four control points of a cubic Bézier curve: where it
 * starts, two points that pull the curve into shape, and where it ends.
 *
 * Everything about the sprig comes from these four numbers — the drawn path
 * AND every leaf's position and angle. Nudge one point and the leaves follow
 * it automatically, which is why the leaves can't drift off the stem.
 */
const STEM: [Point, Point, Point, Point] = [
  { x: 94, y: 181 }, // base, bottom right
  { x: 74, y: 152 },
  { x: 46, y: 106 },
  { x: 22, y: 52 }, // tip, top left
]

/** Where the curve is at position t, with t going 0 (base) to 1 (tip). */
function pointAt(t: number): Point {
  const u = 1 - t
  const [p0, p1, p2, p3] = STEM
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
  }
}

/** Which way the curve is heading at t — the derivative of the curve above. */
function tangentAt(t: number): Point {
  const u = 1 - t
  const [p0, p1, p2, p3] = STEM
  return {
    x: 3 * u ** 2 * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t ** 2 * (p3.x - p2.x),
    y: 3 * u ** 2 * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t ** 2 * (p3.y - p2.y),
  }
}

/**
 * The rotation, in degrees, that turns the leaf's default "pointing up" into
 * the given direction. Rotating (0,-1) by θ gives (sin θ, −cos θ), so going
 * backwards from a direction to its angle is atan2(x, −y).
 */
function headingOf(direction: Point): number {
  return (Math.atan2(direction.x, -direction.y) * 180) / Math.PI
}

// Leaves alternate sides going up the stem. The first sits at t=0.03 so it
// caps the base — leave a gap there and the stem pokes out as a bare tail.
const LEAF_STOPS = [
  { t: 0.03, side: -1 },
  { t: 0.19, side: 1 },
  { t: 0.35, side: -1 },
  { t: 0.51, side: 1 },
  { t: 0.67, side: -1 },
  { t: 0.83, side: 1 },
  { t: 0.98, side: 0 }, // the tip leaf, straight along the stem
]

/** How far each leaf tilts away from the stem, in degrees. */
const LEAF_TILT = 46

const LEAVES = LEAF_STOPS.map(({ t, side }) => {
  const { x, y } = pointAt(t)
  return {
    x,
    y,
    rotate: headingOf(tangentAt(t)) + side * LEAF_TILT,
    // Leaves shrink towards the tip, which reads as the sprig tapering.
    scale: 1.1 - 0.34 * t,
  }
})

// One leaf, drawn pointing straight up from (0,0) so the transform can place
// and rotate it without any further maths.
const LEAF_PATH = 'M0 0 C 12 -9 12 -24 0 -33 C -12 -24 -12 -9 0 0 Z'

const [s0, s1, s2, s3] = STEM
const STEM_PATH = `M${s0.x} ${s0.y} C ${s1.x} ${s1.y}, ${s2.x} ${s2.y}, ${s3.x} ${s3.y}`

/** Five petal centres evenly spaced around a circle, starting at the top. */
function petalRing(cx: number, cy: number, orbit: number) {
  return [0, 1, 2, 3, 4].map((i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180
    return {
      cx: cx + orbit * Math.cos(angle),
      cy: cy + orbit * Math.sin(angle),
    }
  })
}

/** Evenly spaced strokes radiating from a centre. */
function spokes(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  count: number,
  offset: number,
) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i * (360 / count) + offset) * Math.PI) / 180
    return {
      x1: cx + inner * Math.cos(angle),
      y1: cy + inner * Math.sin(angle),
      x2: cx + outer * Math.cos(angle),
      y2: cy + outer * Math.sin(angle),
    }
  })
}

const BLOOM = { x: 119, y: 65 }
const BLOOM_PETALS = petalRing(BLOOM.x, BLOOM.y, 32)
const BLOOM_NAVY_RAYS = spokes(BLOOM.x, BLOOM.y, 17, 32, 8, 22)
const BLOOM_WHITE_RAYS = spokes(BLOOM.x, BLOOM.y, 20, 31, 8, 45)

const BUD_LOW = { x: 137, y: 159 }
const BUD_LOW_PETALS = petalRing(BUD_LOW.x, BUD_LOW.y, 15)

const BUD_RIGHT = { x: 178, y: 121 }
const BUD_RIGHT_PETALS = petalRing(BUD_RIGHT.x, BUD_RIGHT.y, 10.5)

export default function FloralMark({ className }: FloralMarkProps) {
  return (
    <svg viewBox="0 0 200 190" className={className} aria-hidden="true">
      {/* Draw order is the composition: the sprig sits behind the big bloom,
          and both buds sit in front of it. */}
      <path
        d={STEM_PATH}
        fill="none"
        stroke="var(--color-navy)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {LEAVES.map((leaf, i) => (
        <path
          key={i}
          d={LEAF_PATH}
          fill="var(--color-navy)"
          transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.rotate.toFixed(1)}) scale(${leaf.scale.toFixed(2)})`}
        />
      ))}

      {BLOOM_PETALS.map((petal, i) => (
        <circle
          key={i}
          cx={petal.cx.toFixed(1)}
          cy={petal.cy.toFixed(1)}
          r="31"
          fill="var(--color-sky)"
        />
      ))}
      {BLOOM_NAVY_RAYS.map((ray, i) => (
        <line
          key={i}
          x1={ray.x1.toFixed(1)}
          y1={ray.y1.toFixed(1)}
          x2={ray.x2.toFixed(1)}
          y2={ray.y2.toFixed(1)}
          stroke="var(--color-indigo)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      {BLOOM_WHITE_RAYS.map((ray, i) => (
        <line
          key={i}
          x1={ray.x1.toFixed(1)}
          y1={ray.y1.toFixed(1)}
          x2={ray.x2.toFixed(1)}
          y2={ray.y2.toFixed(1)}
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}
      <circle cx={BLOOM.x} cy={BLOOM.y} r="16" fill="var(--color-indigo)" />
      <circle cx={BLOOM.x} cy={BLOOM.y} r="5.5" fill="#ffffff" />

      {BUD_LOW_PETALS.map((petal, i) => (
        <circle
          key={i}
          cx={petal.cx.toFixed(1)}
          cy={petal.cy.toFixed(1)}
          r="15.5"
          fill="var(--color-navy)"
        />
      ))}
      <circle cx={BUD_LOW.x} cy={BUD_LOW.y} r="7" fill="#ffffff" />

      {BUD_RIGHT_PETALS.map((petal, i) => (
        <circle
          key={i}
          cx={petal.cx.toFixed(1)}
          cy={petal.cy.toFixed(1)}
          r="11"
          fill="var(--color-navy)"
        />
      ))}
      <circle cx={BUD_RIGHT.x} cy={BUD_RIGHT.y} r="5" fill="#ffffff" />
    </svg>
  )
}
