import * as THREE from 'three'

// Interpolate the four authored corners without moving them. Subdivision
// avoids mapping the entire irregular terrace through one diagonal seam.
export function createTerraceGeometry(points, bounds, columns = 32, rows = 64) {
  const positions = []
  const uvs = []
  const indices = []
  const [frontRight, frontLeft, backLeft, backRight] = points
  for (let row = 0; row <= rows; row++) {
    const v = row / rows
    for (let column = 0; column <= columns; column++) {
      const u = column / columns
      for (let axis = 0; axis < 3; axis++) {
        const front = THREE.MathUtils.lerp(frontLeft[axis], frontRight[axis], u)
        const back = THREE.MathUtils.lerp(backLeft[axis], backRight[axis], u)
        positions.push(THREE.MathUtils.lerp(front, back, v))
      }
      uvs.push(THREE.MathUtils.lerp(bounds.left, bounds.right, u),
        THREE.MathUtils.lerp(bounds.bottom, bounds.top, v))
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column
        const b = a + 1
        const c = a + columns + 1
        const d = c + 1
        indices.push(a, b, c, b, d, c)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
