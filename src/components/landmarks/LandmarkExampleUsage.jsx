// Example: reuse the common landmark feature on any panorama page.
// <AmenityPanorama landmarks={amenities} categories={AMENITY_CATEGORIES} />
// Panorama shell (Canvas/sphere/controls) stays per-page; only pins + legend
// + placer are shared.
import { useCallback, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  LandmarkLegend,
  LandmarkMarker,
  PlacementPanel,
  filterByCategory,
  isMapped,
  usePlacementMarkers,
} from './index.js'

// Minimal host sphere — replace with the page's own sphere/controls.
function ExampleSphere({ markerData, openIndex, onToggle, containerRef }) {
  const registerCard = useCallback(() => {}, [])
  return (
    <>
      {/* <mesh>…page panorama texture…</mesh> */}
      {markerData.map((landmark, index) => (
        <LandmarkMarker
          key={landmark.id ?? landmark.title}
          landmark={landmark}
          index={index}
          isOpen={openIndex === index}
          onToggle={onToggle}
          registerCard={registerCard}
          containerRef={containerRef}
        />
      ))}
    </>
  )
}

export function LandmarkExampleUsage({
  imageUrl, // unused in the sketch — the page owns its texture
  landmarks = [],
  categories = [],
  eyebrow = 'LANDMARKS',
  placementMode = false,
}) {
  void imageUrl
  const containerRef = useRef(null)
  const [openIndex, setOpenIndex] = useState(null)
  const [category, setCategory] = useState('all')
  const visible = useMemo(() => filterByCategory(landmarks, category), [landmarks, category])
  const mappedDots = useMemo(() => visible.filter(isMapped), [visible])
  const placer = usePlacementMarkers(categories[0]?.id)

  return (
    <div ref={containerRef}>
      <Canvas camera={{ position: [0, 0, 0.1], fov: 72 }}>
        <ExampleSphere
          markerData={mappedDots}
          openIndex={openIndex}
          onToggle={setOpenIndex}
          containerRef={containerRef}
        />
        <OrbitControls makeDefault enablePan={false} enableZoom={false} />
      </Canvas>
      <LandmarkLegend
        markers={landmarks}
        categories={categories}
        value={category}
        onChange={(next) => { setCategory(next); setOpenIndex(null) }}
        eyebrow={eyebrow}
      />
      {placementMode && (
        <PlacementPanel
          categories={categories}
          placementCategory={placer.placementCategory}
          onPlacementCategory={placer.setPlacementCategory}
          onUndo={placer.undo}
          onClear={placer.clear}
          onCopy={placer.copyMarkers}
          canEdit={placer.placedMarkers.length > 0}
          didCopy={placer.didCopy}
        />
      )}
    </div>
  )
}
