/* eslint-disable react-hooks/immutability -- Three.js uniforms are imperative animation targets. */
import gsap from 'gsap'
import { createFlatTravelTimeline } from '../flat-tour/flatTravelTimeline.js'
import PanoramaMarker from '../window-view/PanoramaMarker.jsx'
import { AMENITY_HOTSPOTS, getAmenityTravelArrival } from '../../data/amenityHotspots.js'
import { AMENITY_SCENES } from '../../data/amenityTour.js'
import { PlacementMarker, PlacementPanel } from '../landmarks/index.js'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import PanoramaControls from '../window-view/PanoramaControls.jsx'
import { getWindowTexture, loadWindowTexture } from '../window-view/windowTextures.js'

const LEVEL_ROTATION = new THREE.Quaternion()

function AmenityRadar({ view, radar }) {
  const direction = useRef(new THREE.Vector3())
  const inverse = useRef(new THREE.Quaternion())
  useFrame(({ camera, size }) => {
    const position = radar?.positionRef.current
    const cone = radar?.coneRef.current
    if (!position || !cone) return
    position.hidden = !view?.cameraPosition
    if (!view?.cameraPosition) return
    position.style.left = view.cameraPosition.left + '%'
    position.style.top = view.cameraPosition.top + '%'
    position.dataset.scene = view.id
    camera.getWorldDirection(direction.current)
    inverse.current.copy(view.rotation ?? LEVEL_ROTATION).invert()
    direction.current.applyQuaternion(inverse.current)
    if (Math.hypot(direction.current.x, direction.current.z) > 1e-5) {
      const heading = Math.atan2(direction.current.z, direction.current.x) * 180 / Math.PI
      if (radar.headingRef) radar.headingRef.current = { sceneId: view.id, heading }
      cone.style.transform = `rotate(${heading + (radar.offsets?.[view.id] ?? view.radarHeadingOffset ?? 0)}deg)`
    }
    const horizontalFov = THREE.MathUtils.radToDeg(2 * Math.atan(
      Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * size.width / Math.max(1, size.height),
    ))
    cone.style.setProperty('--radar-fov', horizontalFov + 'deg')
  })
  return null
}
function PanoramaLayer({ view, fade = false, reducedMotion, onComplete, onPlace, zoomMotion }) {
  const gl = useThree(state => state.gl)
  const camera = useThree(state => state.camera)
  useLayoutEffect(() => { gl.initTexture(view.texture) }, [gl, view.texture])
  const materialRef = useRef(null)
  const [zoomUniform] = useState(() => ({ value: 1 }))
  const compileZoom = useCallback(shader => {
    shader.uniforms.roomZoom = zoomUniform
    shader.vertexShader = 'uniform float roomZoom;\n' + shader.vertexShader.replace(
      '#include <project_vertex>', '#include <project_vertex>\ngl_Position.xy *= roomZoom;',
    )
  }, [zoomUniform])
  useFrame(() => {
    const lens = zoomMotion.current
    zoomUniform.value = !fade && lens.fov !== null
      ? Math.tan(THREE.MathUtils.degToRad(lens.startFov) / 2) / Math.tan(THREE.MathUtils.degToRad(lens.fov) / 2) : 1
  }, -1)
  useLayoutEffect(() => {
    if (!fade) return undefined
    const lens = zoomMotion.current
    const finish = () => onComplete(view)
    let timeline
    if (view.travel && !reducedMotion) {
      lens.fov = camera.fov
      lens.startFov = camera.fov
      timeline = createFlatTravelTimeline({ lens, material: materialRef.current, startFov: camera.fov, onComplete: finish })
    } else {
      timeline = gsap.timeline({ onComplete: finish })
      timeline.to(materialRef.current, { opacity: 1, duration: reducedMotion ? .18 : .35, ease: 'sine.inOut' })
    }
    return () => { timeline.kill(); lens.fov = null }
  }, [camera, fade, onComplete, reducedMotion, view, zoomMotion])
  return (
    <group quaternion={view.rotation ?? LEVEL_ROTATION}>
    <mesh scale={[-1, 1, 1]} renderOrder={fade ? 1 : 0}
      onDoubleClick={onPlace ? (event) => {
        event.stopPropagation()
        onPlace(event.point.clone().applyQuaternion((view.rotation ?? LEVEL_ROTATION).clone().invert()).toArray().map((value) => Number(value.toFixed(3))))
      } : undefined}>
      <sphereGeometry args={[50, 64, 40]} />
      <meshBasicMaterial ref={materialRef} map={view.texture} side={THREE.DoubleSide}
        onBeforeCompile={compileZoom}
        transparent={fade} opacity={fade ? 0 : 1} depthTest={!fade} depthWrite={!fade} />
    </mesh>
    </group>
  )
}

// Preserve the old draft set while collecting coordinates for the new renders.
// No the problem i am facing when i open the amenity page for first time it show image in
const DRAFT_KEY = '67avenue-amenity-hotspots-v2'

export default function AmenityPanorama({ scene, onNavigate, placementMode = false, scenes = AMENITY_SCENES, hotspots = AMENITY_HOTSPOTS, radar }) {
  const [active, setActive] = useState(null)
  const [incoming, setIncoming] = useState(null)
  const activeRef = useRef(null)
  const canvasRef = useRef(null)
  const zoomMotion = useRef({ fov: null, startFov: 50 })
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [fov, setFov] = useState(72)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  // Local toggle — same pattern as FlatTour's "Place room pointers" button.
  // `placementMode` (from Amenities.jsx `panoramaPlacement`) enables the
  // amenity hotspot tool; this toggle shows/hides it at runtime.
  const [placementHidden, setPlacementHidden] = useState(true)
  const placing = placementMode && !placementHidden
  const [destination, setDestination] = useState('')
  const [didCopy, setDidCopy] = useState(false)
  const [draftMessage, setDraftMessage] = useState('')
  const [exportText, setExportText] = useState('')
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]')
      return Array.isArray(saved) ? saved.filter((marker) =>
        typeof marker.id === 'string' && scenes.some((item) => item.id === marker.sourceScene)
        && scenes.some((item) => item.id === marker.category)
        && Array.isArray(marker.position) && marker.position.length === 3 && marker.position.every(Number.isFinite)) : []
    } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)) }
    catch { /* Copy config remains available when browser storage is disabled. */ }

  }, [drafts])

  useEffect(() => {
    let cancelled = false
    const token = {}
    const load = async () => {
      setError('')
      try {
        const texture = getWindowTexture(scene.image)
          ?? await loadWindowTexture(scene.image)
        if (cancelled) return
        const source = activeRef.current
        const camera = canvasRef.current?.().camera
        let arrival = scene
        if (source && camera && source.id !== scene.id) {
          const direction = camera.getWorldDirection(new THREE.Vector3())
          // Travel coordinates belong to the source panorama's native axes.
          direction.applyQuaternion((source.rotation ?? LEVEL_ROTATION).clone().invert())
          const heading = Math.atan2(direction.z, direction.x)
          const pointer = hotspots.find((marker) =>
            marker.sourceScene === source.id && marker.category === scene.id)
          arrival = getAmenityTravelArrival(source.id, scene, pointer, heading)
        }
        // Align headings around the vertical axis only. Including camera pitch
        // in the sphere rotation tilts the horizon and accumulates across visits.
        let rotation
        if (source && camera) {
          const angle = arrival.arrivalU * Math.PI * 2
          const direction = camera.getWorldDirection(new THREE.Vector3())
          const heading = Math.atan2(direction.z, direction.x)
          rotation = new THREE.Quaternion().setFromAxisAngle(THREE.Object3D.DEFAULT_UP, angle - heading)
        }
        setIncoming({ ...arrival, arrivalPitch: 0, rotation, travel: !!source, texture, token })
      } catch {
        if (!cancelled) setError('This view could not be opened. Please try again.')
      }
    }
    const frame = requestAnimationFrame(() => { void load() })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [scene, retry, hotspots])

  const busy = active?.id !== scene.id || !!incoming
  const categories = scenes.filter((item) => item.id !== scene.id)
    .map((item) => ({ id: item.id, label: item.name }))
  const targetId = categories.some((item) => item.id === destination) ? destination : categories[0].id
  const sceneMarkers = drafts.filter((marker) => marker.sourceScene === scene.id)
  const place = (position) => {
    if (busy) return
    setDidCopy(false)
    const target = scenes.find((item) => item.id === targetId)
    setDrafts((current) => [...current, {
      id: crypto.randomUUID(), sourceScene: scene.id, title: target.name,
      category: target.id, description: '', position,
    }])
  }
  const undo = () => {
    const last = sceneMarkers.at(-1)?.id
    setDrafts((current) => current.filter((marker) => marker.id !== last))
    setDidCopy(false)
  }
  const clear = () => {
    setDrafts((current) => current.filter((marker) => marker.sourceScene !== scene.id))
    setDidCopy(false)
  }
  const copy = async () => {
    const json = JSON.stringify(drafts.map(({ sourceScene, title, category, description, position }) =>
      ({ sourceScene, title, category, description, position })), null, 2)
    setExportText(json)
    try {
      await navigator.clipboard.writeText(json)
      setDidCopy(true)
      setDraftMessage('Copied pointers from all panoramas. Paste the JSON into the chat.')
    } catch {
      setDraftMessage('Clipboard unavailable. Select and copy the JSON below.')
    }
  }
  const complete = useCallback((view) => {
    activeRef.current = view
    setActive(view)
    setIncoming((current) => current?.token === view.token ? null : current)
  }, [])

  return (
    <section className="amenity-panorama" aria-label={`360 view: ${active?.name ?? scene.name}`}>
      {/* Measure layout size so the route entry scale animation cannot shrink the renderer. */}
      <Canvas resize={{ offsetSize: true }} camera={{ position: [0, 0, 0.1], fov: 72 }} dpr={[1, 1.5]}
        onCreated={(state) => { canvasRef.current = state.get }}>
        {/* Keep an opaque outgoing panorama behind the entire destination fade. */}
        {active && <PanoramaLayer view={active} zoomMotion={zoomMotion}
          onPlace={placementMode && placing && !busy ? place : undefined} />}
        {incoming && <PanoramaLayer key={`${incoming.id}-${retry}`} view={incoming} zoomMotion={zoomMotion} fade reducedMotion={reducedMotion} onComplete={complete} />}
        <group quaternion={active?.rotation ?? LEVEL_ROTATION}>
        {placementMode && placing && !busy && sceneMarkers.map((marker) => <PlacementMarker key={marker.id} marker={marker} />)}
        {(!placing || !placementMode) && !busy && hotspots.filter((marker) => marker.sourceScene === active?.id).map((marker) => (
          <PanoramaMarker key={marker.id} position={marker.position} zIndexRange={[1000, 100]}>
            <button type="button" className="amenity-hotspot" aria-label={`Go to ${marker.title}`}
              onPointerDown={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              onPointerEnter={() => {
                const destinationScene = scenes.find((item) => item.id === marker.category)
                if (destinationScene) void loadWindowTexture(destinationScene.image).catch(() => { })
              }}
              onFocus={() => {
                const destinationScene = scenes.find((item) => item.id === marker.category)
                if (destinationScene) void loadWindowTexture(destinationScene.image).catch(() => { })
              }}
              onClick={(event) => {
                event.stopPropagation()
                const destinationScene = scenes.find((item) => item.id === marker.category)
                if (!destinationScene) return
                onNavigate(marker.category)
              }}>
              <span className="amenity-hotspot__pulse" aria-hidden="true" />
              <span className="amenity-hotspot__label">{marker.title}</span>
            </button>
          </PanoramaMarker>
        ))}
        </group>
        {radar && <AmenityRadar view={active ?? incoming} radar={radar} />}
        <PanoramaControls fov={fov} setFov={setFov} rotationDelay={3}
          rotating={!reducedMotion && !!active && !busy && !placing}
          arrivalView={(incoming ?? active)?.travel ? undefined : (incoming ?? active)}
          suspended={!!incoming?.travel} />
      </Canvas>
      {placementMode && <button type="button" className="amenity-pointer-toggle" aria-pressed={placing}
        onClick={() => setPlacementHidden((value) => !value)}>{placing ? 'Hide amenity pointers' : 'Place amenity pointers'}</button>}
      {placementMode && placing && <div className="amenity-authoring">
        <PlacementPanel title="Amenity pointer placer" categories={categories}
          instructions={`In ${scene.name}: select the destination below, drag to look around, then double-click its exact location. Undo/Clear affect this panorama. Copy exports all panoramas.`}
          placementCategory={targetId} onPlacementCategory={setDestination}
          onUndo={undo} onClear={clear} onCopy={copy}
          canEdit={sceneMarkers.length > 0} didCopy={didCopy} />
        <p className="amenity-authoring__count">{sceneMarkers.length} pointers here · {drafts.length} total</p>
        {drafts.length > 0 && !sceneMarkers.length && <button type="button" onClick={copy}>Copy all panoramas</button>}
        {draftMessage && <p role="status">{draftMessage}</p>}
        {exportText && <textarea aria-label="Exported panorama pointers" value={exportText} readOnly onFocus={(event) => event.target.select()} />}
      </div>}    
      {error && <div className="amenity-tour__error" role="alert">{error}<button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button></div>}
    </section>
  )
}
