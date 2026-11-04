import assert from 'node:assert/strict'
import test from 'node:test'
import { createFlatTravelTimeline, levelTravelDirection } from './flatTravelTimeline.js'

test('outgoing zoom stays at its peak throughout the dissolve with no zoom-out phase', () => {
  const lens = { fov: 85 }
  const material = { opacity: 0 }
  const turn = { value: 0 }
  const timeline = createFlatTravelTimeline({ lens, material, turn, startFov: 85, paused: true })
  try {
    timeline.seek(.7)
    assert.ok(lens.fov < 85 && lens.fov > 68, 'gentle approach before the destination starts blending')
    assert.equal(material.opacity, 0)
    timeline.seek(1.35)
    assert.equal(lens.fov, 68, 'hold the gentler zoom throughout the blend')
    assert.ok(material.opacity > 0 && material.opacity < 1)
    timeline.seek(1.8)
    assert.equal(material.opacity, 1)
    assert.equal(lens.fov, 68, 'the outgoing image never zooms back out')
    timeline.seek(timeline.duration())
    assert.equal(lens.fov, 68)
    assert.equal(material.opacity, 1)
    let previousFov = 85
    for (let time = 0; time <= timeline.duration(); time += .02) {
      timeline.seek(time)
      assert.equal(turn.value, 0, 'transition never steers the camera sideways')
      assert.ok(lens.fov <= previousFov + .001, 'zoom moves in one direction only')
      assert.ok(material.opacity >= 0 && material.opacity <= 1)
      previousFov = lens.fov
    }
  } finally {
    timeline.kill()
  }
})

test('low pointers steer horizontally and vertical pointers have a safe level fallback', () => {
  const fallback = [1, 0, 0]
  assert.deepEqual(levelTravelDirection([3, -40, 4], fallback), [-.6, 0, -.8])
  assert.deepEqual(levelTravelDirection([3, 40, 4], fallback), [-.6, 0, -.8])
  assert.deepEqual(levelTravelDirection([0, -50, 0], fallback), fallback)
  assert.deepEqual(levelTravelDirection(undefined, fallback), fallback)
})
