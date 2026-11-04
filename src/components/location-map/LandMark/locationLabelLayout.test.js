import test from 'node:test'
import assert from 'node:assert/strict'
import { landmarkLabelLanes, rectanglesOverlap, selectLandmarkLabels } from './locationLabelLayout.js'

const card = (id, x, y = 350, lift = 48) => ({ id, x, y, lift, width: 220, height: 44, priority: false })

test('crowded cards never overlap, and retained cards win over arrivals', () => {
  const cards = [card('A', 300), card('B', 320), card('C', 700)]
  assert.deepEqual([...selectLandmarkLabels(cards, 1000, 700, [], new Set(['B']))], ['B', 'C'])
  assert.deepEqual([...selectLandmarkLabels(cards.map(c => ({ ...c, x: c.x + 1 })), 1000, 700, [], new Set(['B', 'C']))], ['B', 'C'])
})

test('selected cards get priority and cards avoid controls and viewport edges', () => {
  const selected = { ...card('B', 320), priority: true }
  assert.deepEqual([...selectLandmarkLabels([card('A', 300), selected], 1000, 700, [], new Set(['A']))], ['B'])
  const reserved = [{ left: 200, right: 450, top: 250, bottom: 320 }]
  assert.equal(selectLandmarkLabels([card('A', 300), card('edge', 10)], 1000, 700, reserved, new Set()).size, 0)
})

test('dense panoramas respect label budgets and leave input positions intact', () => {
  const cards = Array.from({ length: 20 }, (_, i) => ({ ...card(String(i), 150 + i * 240), y: 400, lift: 48 + (i % 4) * 54 }))
  const original = structuredClone(cards)
  assert.ok(selectLandmarkLabels(cards, 6000, 700, [], new Set()).size <= 6)
  assert.ok(selectLandmarkLabels(cards, 390, 844, [], new Set()).size <= 3)
  assert.deepEqual(cards, original)
})

test('world-space lanes are deterministic regardless of input order', () => {
  const markers = [{ title: 'West', position: [-1, 0, 0] }, { title: 'East', position: [1, 0, 0] }, { title: 'Missing', position: null }]
  assert.deepEqual(landmarkLabelLanes(markers), landmarkLabelLanes([...markers].reverse()))
  assert.equal(landmarkLabelLanes(markers).has('Missing'), false)
  assert.equal(rectanglesOverlap({ left: 0, right: 100, top: 0, bottom: 50 }, { left: 120, right: 220, top: 0, bottom: 50 }), false)
})

test('connector lines do not cross other cards', () => {
  const cards = [card('A', 300, 350, 150), card('B', 320, 350, 48)]
  assert.deepEqual([...selectLandmarkLabels(cards, 1000, 700, [], new Set())], ['A'])
})
