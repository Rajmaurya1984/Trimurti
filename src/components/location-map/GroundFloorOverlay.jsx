import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { createTerraceGeometry } from './LandMark/terraceGeometry.js'

// UV bounds exclude the outer margins around groundFloorPlan.png.
const PLAN_BOUNDS = { left: 241 / 3000, right: 2737 / 3000, bottom: 1 - 2180 / 2471, top: 1 - 273 / 2471 }

// Remove only edge-connected white paper, preserving white details inside walls.
function createPlanCutout(source) {
  const image = source.image
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth ?? image.width
  canvas.height = image.naturalHeight ?? image.height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = pixels
  const queue = new Int32Array(width * height)
  let head = 0
  let tail = 0
  const visit = index => {
    const offset = index * 4
    if (data[offset + 3] === 0 || data[offset] < 248 || data[offset + 1] < 248 || data[offset + 2] < 248) return
    data[offset + 3] = 0
    queue[tail++] = index
  }
  for (let x = 0; x < width; x++) {
    visit(x)
    visit((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    visit(y * width)
    visit(y * width + width - 1)
  }
  while (head < tail) {
    const index = queue[head++]
    const x = index % width
    if (x > 0) visit(index - 1)
    if (x < width - 1) visit(index + 1)
    if (index >= width) visit(index - width)
    if (index < width * (height - 1)) visit(index + width)
  }
  context.putImageData(pixels, 0, 0)
  const cutout = new THREE.CanvasTexture(canvas)
  cutout.colorSpace = source.colorSpace
  cutout.flipY = source.flipY
  cutout.anisotropy = source.anisotropy
  return cutout
}

export default function GroundFloorOverlay({ points, texture }) {
  const geometry = useMemo(() => createTerraceGeometry(points, PLAN_BOUNDS), [points])
  const cutout = useMemo(() => createPlanCutout(texture), [texture])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => cutout.dispose(), [cutout])
  return <mesh geometry={geometry} renderOrder={1}>
    <meshBasicMaterial map={cutout} transparent alphaTest={0.01} toneMapped={false} depthWrite={false} depthTest={false} side={THREE.DoubleSide} />
  </mesh>
}