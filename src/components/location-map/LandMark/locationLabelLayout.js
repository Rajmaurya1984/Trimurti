// Assign rows once in world space, independent of camera rotation or filters.
export function landmarkLabelLanes(markers) {
  const ordered = markers.filter(marker => Array.isArray(marker.position))
    .map(marker => ({ marker, angle: Math.atan2(marker.position[2], marker.position[0]) }))
    .sort((a, b) => a.angle - b.angle || a.marker.title.localeCompare(b.marker.title))
  return new Map(ordered.map(({ marker }, index) => [marker.title, index % 4]))
}

export function rectanglesOverlap(a, b, gap = 10) {
  return a.left < b.right + gap && a.right > b.left - gap
    && a.top < b.bottom + gap && a.bottom > b.top - gap
}

// Keep existing labels ahead of new arrivals. Never move a card to another
// row to resolve a collision: its dot remains available when the card hides.
export function selectLandmarkLabels(cards, width, height, reserved, previous) {
  const occupied = [...reserved]
  const connectors = []
  const visible = new Set()
  const limit = width <= 700 ? 3 : 6
  const ordered = [...cards].sort((a, b) =>
    Number(b.priority) - Number(a.priority)
    || Number(previous.has(b.id)) - Number(previous.has(a.id))
    || a.id.localeCompare(b.id))
  for (const card of ordered) {
    const box = {
      left: card.x - card.width / 2,
      right: card.x + card.width / 2,
      top: card.y - card.lift - card.height,
      bottom: card.y - card.lift,
    }
    const inset = previous.has(card.id) ? 12 : 24
    const connector = { left: card.x - 1, right: card.x + 1, top: box.bottom, bottom: card.y }
    if (box.left < inset || box.right > width - inset || box.top < inset || box.bottom > height - inset) continue
    if (visible.size >= limit || occupied.some(other => rectanglesOverlap(box, other, previous.has(card.id) ? 10 : 18))) continue
    // A gold leader must not run through another card or a shared control.
    if (occupied.some(other => rectanglesOverlap(connector, other, 3))
      || connectors.some(other => rectanglesOverlap(box, other, 3))) continue
    visible.add(card.id)
    occupied.push(box)
    connectors.push(connector)
  }
  return visible
}
