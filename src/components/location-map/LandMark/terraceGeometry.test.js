import test from 'node:test'
import assert from 'node:assert/strict'
import { createTerraceGeometry } from './terraceGeometry.js'

test('terrace preserves authored corners and crops transparent padding in the correct orientation', () => {
  const points = [[6.26, -48.42, 10.67], [-5.09, -48.56, 10.74],
    [-5.82, -48.15, -11.98], [5.82, -47.97, -12.68]]
  const bounds = { left: 111 / 2250, right: 2139 / 2250,
    bottom: 1 - 3727 / 4000, top: 1 - 304 / 4000 }
  const geometry = createTerraceGeometry(points, bounds, 4, 8)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  const corners = [4, 0, 40, 44]
  const expectedUVs = [[bounds.right, bounds.bottom], [bounds.left, bounds.bottom],
    [bounds.left, bounds.top], [bounds.right, bounds.top]]
  corners.forEach((index, corner) => {
    const actual = [position.getX(index), position.getY(index), position.getZ(index)]
    actual.forEach((value, axis) => assert.ok(Math.abs(value - points[corner][axis]) < 1e-5))
    assert.ok(Math.abs(uv.getX(index) - expectedUVs[corner][0]) < 1e-6)
    assert.ok(Math.abs(uv.getY(index) - expectedUVs[corner][1]) < 1e-6)
  })
  assert.equal(geometry.index.count, 4 * 8 * 6)
  assert.ok([...position.array].every(Number.isFinite))
  geometry.dispose()
})
