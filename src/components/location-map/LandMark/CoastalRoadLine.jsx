import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COASTAL_ROAD_POINTS = [
  [-49.26, -5.92, -5.58],
  // [-47.31, -9.57, -12.71],
  // [-39.14, -15.99, -26.63],
  // [-17.82, -22.36, -40.96],
  [4.44, -22.53, -44.41],
  // [6.15, -32.72, -37.25],
  [7.68, -48.16, -10.86],
]

// Clip in homogeneous coordinates so crossing the camera or screen edge never
// produces a line stretching across the panorama from a point behind the viewer.
function clipSegment(start, end) {
  let from = 0
  let to = 1
  for (const axis of ['x', 'y', 'z']) {
    for (const sign of [-1, 1]) {
      const a = start.w + sign * start[axis]
      const b = end.w + sign * end[axis]
      if (a < 0 && b < 0) return null
      if (a < 0) from = Math.max(from, a / (a - b))
      if (b < 0) to = Math.min(to, a / (a - b))
    }
  }
  if (from > to) return null
  return [start.clone().lerp(end, from), start.clone().lerp(end, to)]
}

export function CoastalRoadProjection({ elements }) {
  const points = useMemo(() => COASTAL_ROAD_POINTS.map(point => new THREE.Vector4(...point, 1)), [])
  const matrix = useMemo(() => new THREE.Matrix4(), [])
  useFrame(({ camera, size }) => {
    const svg = elements.current
    if (!svg) return
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    const projected = points.map(point => point.clone().applyMatrix4(matrix))
    const screen = point => [
      (point.x / point.w + 1) * size.width / 2,
      (1 - point.y / point.w) * size.height / 2,
    ]
    let path = ''
    projected.slice(1).forEach((end, index) => {
      const segment = clipSegment(projected[index], end)
      if (!segment) return
      const [startX, startY] = screen(segment[0])
      const [endX, endY] = screen(segment[1])
      path += `M ${startX} ${startY} L ${endX} ${endY} `
    })
    svg.querySelectorAll('path').forEach(element => element.setAttribute('d', path))
    svg.querySelectorAll('g').forEach((element, index) => {
      const point = projected[index]
      const visible = point.w > 0 && ['x', 'y', 'z'].every(axis => Math.abs(point[axis]) <= point.w)
      element.style.visibility = visible ? 'visible' : 'hidden'
      if (visible) {
        const [x, y] = screen(point)
        element.setAttribute('transform', `translate(${x} ${y})`)
      }
    })
  })
  return null
}

export function CoastalRoadOverlay({ elements }) {
  return (
    <svg ref={elements} className="coastal-road-line" role="img" aria-label="Coastal Road route connecting seven points">
      <path className="coastal-road-line__glow" />
      <path className="coastal-road-line__base" />
      <path className="coastal-road-line__flow" />
      {COASTAL_ROAD_POINTS.map((point, index) => (
        <g key={point.join(',')} style={{ visibility: 'hidden', '--point-delay': `${index * -.3}s` }}>
          <circle className="coastal-road-line__pulse" r="7" />
          <circle className="coastal-road-line__point" r="3.5" />
        </g>
      ))}
    </svg>
  )
}
