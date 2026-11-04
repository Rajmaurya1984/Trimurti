import test from 'node:test'
import assert from 'node:assert/strict'
import { TIRMUTH_FLATS, radarReference, tirmuthRadarHeading } from './tirmuthFlats.js'

const degrees = radians => radians * 180 / Math.PI
const wrap = angle => ((angle + 180) % 360 + 360) % 360 - 180
for (const flat of TIRMUTH_FLATS) {
  test('Flat ' + flat.number + ': approved hotspots link existing rooms', () => {
    assert.equal(flat.hotspots.length, flat.number === 2 ? 18 : 14)
    assert.equal(new Set(flat.hotspots.map(marker => marker.id)).size, flat.hotspots.length)
    for (const marker of flat.hotspots) {
      assert.ok(flat.rooms.some(room => room.id === marker.sourceScene))
      assert.ok(flat.rooms.some(room => room.id === marker.category))
      assert.equal(marker.position.length, 3)
      assert.ok(marker.position.every(Number.isFinite))
    }
  })
  for (const room of flat.rooms) {
    test('Flat ' + flat.number + ' ' + room.id + ': radar matches doorway and follows yaw', () => {
      const reference = radarReference(flat, room.id)
      assert.ok(reference, 'Every room needs an authored calibration doorway')
      const destination = flat.rooms.find(candidate => candidate.id === reference.category)
      const expected = degrees(Math.atan2(
        (destination.cameraPosition.left - room.cameraPosition.left) * flat.mapAspect,
        -(destination.cameraPosition.top - room.cameraPosition.top),
      ))
      const direction = { x: reference.position[0], z: reference.position[2] }
      assert.ok(Math.abs(wrap(tirmuthRadarHeading(direction, room.id, flat) - expected)) < 1e-8)
      // A quarter-turn of the camera must rotate the radar a quarter-turn,
      // even when the panorama's yaw crosses -180/180 degrees.
      const turned = { x: -direction.z, z: direction.x }
      assert.ok(Math.abs(wrap(tirmuthRadarHeading(turned, room.id, flat) - expected - 90)) < 1e-8)
    })
  }
}
test('Flat 2: bedroom and toilet map assignments match the requested corrections', () => {
  const rooms = TIRMUTH_FLATS[0].rooms
  const position = id => rooms.find(room => room.id === id).cameraPosition
  assert.deepEqual(position('bedroom'), { left: 17, top: 81 })
  assert.deepEqual(position('master-bedroom'), { left: 65, top: 78 })
  assert.deepEqual(position('master-toilet'), { left: 59, top: 90 })
  assert.deepEqual(position('toilet'), { left: 22, top: 67 })
})
