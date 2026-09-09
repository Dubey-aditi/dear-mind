// A component can take inputs. Those inputs are called "props".
// Here we accept one optional prop, `className`, so the parent can decide
// how big the flower should be without this file knowing anything about it.
type FlowerProps = {
  className?: string
}

// The five petals sit evenly around a circle. Rather than hand-typing five
// sets of coordinates, we compute them: 360 / 5 = 72 degrees apart.
const PETALS = [0, 1, 2, 3, 4].map((i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180) // start at the top
  return {
    cx: 32 + 15 * Math.cos(angle),
    cy: 32 + 15 * Math.sin(angle),
  }
})

// Little spikes radiating out of the flower's middle.
const SPIKES = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
  const angle = (i * 45) * (Math.PI / 180)
  return {
    x1: 32 + 4 * Math.cos(angle),
    y1: 32 + 4 * Math.sin(angle),
    x2: 32 + 11 * Math.cos(angle),
    y2: 32 + 11 * Math.sin(angle),
  }
})

export default function Flower({ className }: FlowerProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {PETALS.map((petal, i) => (
        <circle key={i} cx={petal.cx} cy={petal.cy} r="13" fill="var(--color-sky)" />
      ))}
      {SPIKES.map((spike, i) => (
        <line
          key={i}
          x1={spike.x1}
          y1={spike.y1}
          x2={spike.x2}
          y2={spike.y2}
          stroke="var(--color-indigo)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      <circle cx="32" cy="32" r="6.5" fill="var(--color-indigo)" />
      <circle cx="32" cy="32" r="2.2" fill="#FFFFFF" />
    </svg>
  )
}
