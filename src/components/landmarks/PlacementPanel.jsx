// Common authoring tool: drop pins on any panorama with double-click,
// then copy the config JSON. Panorama-agnostic â€” the host sphere calls
// Nodejs event loop have timers,pending callback,idle/prepare, closeCallback,poll,checking pase
// process.nextTick() have higer priorty than the all the callback
// onPlaceMarker(position) from its onDoubleClick handler.

import { useCallback, useState } from 'react'
import { PlacementMarker } from './PlacementTools'


/* eslint-disable react-refresh/only-export-components */ 
export function usePlacementMarkers(initialCategory) {
  const [placedMarkers, setPlacedMarkers] = useState([])
  const [didCopy, setDidCopy] = useState(false)
  const [placementCategory, setPlacementCategory] = useState(initialCategory)

  const placeMarker = useCallback(
    (position) => {
      setPlacedMarkers((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          title: `Marker ${current.length + 1}`,
          category: placementCategory,
          description: '',
          position,
        },
      ])
    },
    [placementCategory],
  )

  const undo = useCallback(
    () => setPlacedMarkers((current) => current.slice(0, -1)),
    [],
  )
  const clear = useCallback(() => setPlacedMarkers([]), [])

  const copyMarkers = useCallback(async () => {
    const markerConfig = placedMarkers.map(
      ({ title, category, description, position }) => ({
        title,
        category,
        description,
        position,
      }),
    )
    await navigator.clipboard?.writeText(JSON.stringify(markerConfig, null, 2))
    setDidCopy(true)
    window.setTimeout(() => setDidCopy(false), 1800)
  }, [placedMarkers])
  return {
    placedMarkers,
    placementCategory,
    setPlacementCategory,
    placeMarker,
    undo,
    clear,
    copyMarkers,
    didCopy,
  }
}

export function PlacementPanel({
  title = 'Landmark placer',
  instructions = 'Drag to look around, then double-click the exact location to drop a pin.',
  categories = [],
  placementCategory,
  onPlacementCategory,
  onUndo,
  onClear,
  onCopy,
  canEdit,
  didCopy,
}) {
  return (
    <aside className="placement-panel">
      <strong>{title}</strong>
      <span>{instructions}</span>
      <label className="placement-panel__field">
        <span>Category for the next pin</span>
        <select
          value={placementCategory}
          onChange={(event) => onPlacementCategory?.(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>
      <div className="placement-panel__actions">
        <button type="button" onClick={onUndo} disabled={!canEdit}>Undo</button>
        <button type="button" onClick={onClear} disabled={!canEdit}>Clear</button>
        <button type="button" className="placement-panel__copy" onClick={onCopy} disabled={!canEdit}>
          {didCopy ? 'Copied' : 'Copy config'}
        </button>
      </div>
    </aside>
  )
}

