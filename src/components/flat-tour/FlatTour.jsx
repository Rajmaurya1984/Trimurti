/* eslint-disable react-hooks/immutability -- Three.js objects are imperative GSAP animation targets. */
import gsap from 'gsap'
import { TIRMUTH_FLATS, TIRMUTH_FLOOR_PLAN, TIRMUTH_DEFAULT_FOV, tirmuthRadarHeading } from '../../data/tirmuthFlats.js'
import { createFlatTravelTimeline } from './flatTravelTimeline.js'
import { RoomPointerPanel, useRoomPointers } from './RoomPointerTools.jsx'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { assetUrl } from '../../lib/utils.js'
import { loadWindowTexture } from '../window-view/windowTextures.js'
import PanoramaControls from '../window-view/PanoramaControls.jsx'
import PanoramaMarker from '../window-view/PanoramaMarker.jsx'
import './FlatTour.css'
import '../window-view/TourSceneMenu.css'
import SiteHeader from '../site/SiteHeader.jsx'
import { array } from 'three/src/nodes/core/ArrayNode.js'

function RoomLayer({ onPlace, rooms, view, fade, onComplete, setFov, zoomMotion }) {
  const gl = useThree(state => state.gl)
  const camera = useThree(state => state.camera)
  const get = useThree(state => state.get)
  const [rotation] = useState(() => {
    if (view.rotation !== undefined) return view.rotation
    const direction = camera.getWorldDirection(new THREE.Vector3())
    const room = rooms.find(room => room.id === view.id)
    // Immediate arrivals move the camera to the authored heading. Keep the
    // panorama and its pointers in that same native coordinate system.
    if (room.arrivalImmediate && !view.travel) return 0
    // Align the destination's authored view to the current camera heading.
    // Rotating only the new sphere keeps the outgoing room perfectly still.
    return room.arrivalU * Math.PI * 2 - Math.atan2(direction.z, direction.x)
  })
  const material = useRef(null)
  const [zoomUniform] = useState(() => ({ value: 1 }))
  const compileZoom = useCallback(shader => {
    shader.uniforms.roomZoom = zoomUniform
    shader.vertexShader = 'uniform float roomZoom;\n' + shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\ngl_Position.xy *= roomZoom;',
    )
  }, [zoomUniform])
  useFrame(() => {
    const lens = zoomMotion.current
    // Zoom only the outgoing layer. The incoming image always renders at the
    // unchanged camera FOV, so there is no visible zoom reset or recovery.
    zoomUniform.value = !fade && lens.fov !== null
      ? Math.tan(THREE.MathUtils.degToRad(lens.startFov) / 2) / Math.tan(THREE.MathUtils.degToRad(lens.fov) / 2)
      : 1
  }, -1)
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useLayoutEffect(() => { gl.initTexture(view.texture) }, [gl, view.texture])
  useLayoutEffect(() => {
    if (!fade) return undefined
    const controls = get().controls
    const room = rooms.find(item => item.id === view.id)
    const radius = camera.position.length()
    const startFov = camera.fov
    const startPosition = camera.position.clone()
    const damping = controls?.enableDamping
    const lens = zoomMotion.current
    let finished = false
    if (controls) { controls.enabled = false; controls.enableDamping = false; controls.update() }
    const arrive = () => {
      const angle = room.arrivalU * Math.PI * 2
      const pitch = THREE.MathUtils.degToRad(room.arrivalPitch ?? 0)
      camera.position.set(-Math.cos(angle) * Math.cos(pitch), -Math.sin(pitch), -Math.sin(angle) * Math.cos(pitch)).multiplyScalar(radius)
      camera.fov = room.arrivalFov ?? TIRMUTH_DEFAULT_FOV
      camera.updateProjectionMatrix()
      controls?.target.set(0, 0, 0)
      if (controls) controls.update()
      else camera.lookAt(0, 0, 0)
      setFov(camera.fov)
    }
    const finish = () => {
      finished = true
      setFov(camera.fov)
      if (controls) { controls.enableDamping = damping; controls.enabled = true }
      onComplete({ id: view.id, name: view.name, texture: view.texture, rotation, preserveView: !!view.travel })
    }
    let timeline
    if (!view.travel) {
      timeline = gsap.timeline({ onComplete: finish })
      arrive()
      timeline.to(material.current, { opacity: 1, duration: reduce ? .18 : .35, ease: 'sine.inOut' })
    } else if (reduce) {
      timeline = gsap.timeline({ onComplete: finish })
      // Keep the outgoing image fully visible while the aligned destination
      // dissolves over it. Preserve the camera so completion cannot snap.
      timeline.to(material.current, { opacity: 1, duration: .18, ease: 'sine.inOut' })
    } else {
      lens.fov = startFov
      lens.startFov = startFov
      timeline = createFlatTravelTimeline({
        lens, material: material.current,
        startFov,
        onComplete: finish,
      })
    }
    return () => {
      timeline.kill()
      lens.fov = null
      if (!finished) {
        camera.position.copy(startPosition)
        camera.fov = startFov
        camera.updateProjectionMatrix()
      }
      if (controls) { controls.enableDamping = damping; controls.enabled = true; controls.update() }
    }
  }, [camera, fade, get, onComplete, reduce, rooms, rotation, setFov, view, zoomMotion])
  return <mesh rotation={[0, rotation, 0]} scale={[-1, 1, 1]} renderOrder={fade ? 1 : 0}
    onDoubleClick={onPlace ? event => {
      event.stopPropagation()
      const point = event.point.clone().applyAxisAngle(THREE.Object3D.DEFAULT_UP, -rotation)
      onPlace(point.toArray().map(value => Number(value.toFixed(3))))
    } : undefined}>
    <sphereGeometry args={[50, 64, 40]} />
    <meshBasicMaterial ref={material} map={view.texture} side={THREE.DoubleSide}
      onBeforeCompile={compileZoom}
      transparent={!!fade} opacity={fade ? 0 : 1} depthTest={!fade} depthWrite={!fade} />
  </mesh>
}


function RadarHeading({ radarHeading, coneRef, roomId, rotation = 0 }) {
  const direction = useRef(new THREE.Vector3())
  useFrame(({ camera }) => {
    if (!coneRef.current) return
    camera.getWorldDirection(direction.current)
    direction.current.applyAxisAngle(THREE.Object3D.DEFAULT_UP, -rotation)
    // Keep the last heading when looking straight up or down (yaw is undefined).
    if (Math.hypot(direction.current.x, direction.current.z) > 1e-5) {
      const heading = radarHeading(direction.current, roomId)
      coneRef.current.style.transform = `rotate(${heading}deg)`
    }
    // The floor-plan cone represents horizontal coverage: derive it from the
    // live vertical FOV and aspect on every frame so scroll/pinch zoom
    // narrows and widens the cone accurately.
  })
  return null
}

export default function FlatTour({ onClose, flatNumber = 2 }) {
  const flat = TIRMUTH_FLATS.find(item => item.number === flatNumber) ?? TIRMUTH_FLATS[0]
  const rooms = flat.rooms
  const hotspots = flat.hotspots
  const radarHeading = (direction, roomId) => tirmuthRadarHeading(direction, roomId, flat)
  const mapViewBox = flat.mapViewBox
  const mapAspect = flat.mapAspect
  const label = 'Flat no ' + flatNumber
  const zoomMotion = useRef({ fov: null, startFov: TIRMUTH_DEFAULT_FOV })
  const coneRef = useRef(null)
  const [radarExpanded] = useState(true)
  const [placing, setPlacing] = useState(false)
  const dialog = useRef(null)
  const [pendingTravel, setPendingTravel] = useState(null)
  const [selected, setSelected] = useState(rooms[0])
  const pointerTools = useRoomPointers(selected.id, rooms, 'tirmuth-flat-' + flat.number + (flat.number === 2 ? '-room-pointers-v2' : '-room-pointers-v1'))
  const [active, setActive] = useState(null)
  const [incoming, setIncoming] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [fov, setFov] = useState(TIRMUTH_DEFAULT_FOV)
  const [autoRotate] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [mapFailed, setMapFailed] = useState(false)
  const busy = !error && (active?.id !== selected.id || !!incoming)
  const radarView = active ?? incoming
  const radarRoom = rooms.find(room => room.id === radarView?.id) ?? selected
  const radarPosition = radarRoom.cameraPosition
  // Published owner-supplied coordinates take priority in the visitor tour.
  // Local drafts are visible while authoring, without silently overriding them.
  const previewDrafts = flat.number === 2 && pointerTools.markers.length > 0
  const tourMarkers = previewDrafts ? [
    ...hotspots.filter(marker => !pointerTools.markers.some(draft =>
      marker.sourceScene === draft.sourceScene && marker.category === draft.category)),
    ...pointerTools.markers,
  ] : placing ? pointerTools.markers : [
    ...hotspots,
    ...pointerTools.markers.filter(draft => !hotspots.some(marker =>
      marker.sourceScene === draft.sourceScene && marker.category === draft.category)),
  ]

  useLayoutEffect(() => {
    const element = dialog.current
    element.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = overflow }
  }, [])

  const FLAT_2_IMAGE_STEMS = {
    bedroom:'M Bedroom_02',
    'master-bedroom':"M_Bedroom_01",
    'master-toilet':'M_Toilet_01',
    toilet:'M_Toilet_02',
  }

  function makeRooms(number,area,study=false){
    return entries.map((id,name,file) => ({
       id,name: number === 2? FLAT_2_ROOM_NAMES[id] ?? name: name,
       image: '/flat/no' + number + '/2BHK_Flat_' + number + '_' + area,
       cameraPosition : {left:mapPositions[number][id][0],top:mapPositions[number][id][1]},
       arrivalU: 0.5,arrivalPitch:0,arrivalImmediate:true,
       arrivalFov:TRIMUTH_DEFAULT_FOV
    }))
  }
  
  function roomChanger(){
    return entries.map((id,name,file)=>({
      id,name : number === 2?FLAT_2_ROOM_NAMES[id] ?? name:name,
      image:'/flat/no' + number + '/2BHK_Flat_' + number + '_' + area,
      cameraPosition : {left:mapPositions[number][id][0],top:mapPositions[number][id][1]},
      arrivalU: 0.5,arrivalPitch:0,arrivalImmediate:true,
      arrivalFov:TRIMUTH_DEFAULT_FOV
    }))
  }

  useEffect(() => {
    let cancelled = false
    const request = requestAnimationFrame(() => {
      setError('')
      void loadWindowTexture(selected.image).then(texture => {
        if (!cancelled) setIncoming({ id: selected.id, name: selected.name, texture, travel: pendingTravel })
      }).catch(() => { if (!cancelled) setError(selected.name + ' could not be loaded.') })
    })
    return () => { cancelled = true; cancelAnimationFrame(request) }
  }, [selected, retry, pendingTravel])

  const complete = useCallback(view => {
    setActive(view)
    setIncoming(current => current?.id === view.id ? null : current)
  }, [setActive, setIncoming])

  const choose = (room, position) => {
    if (busy || room.id === selected.id) return
    setPendingTravel(active ? { position: position?.toArray() } : null)
    setIncoming(null)
    setError('')
    setSelected(room)
  }

  const warm = room => { void loadWindowTexture(room.image).catch(() => {}) }
  
  return <dialog data-flat-number={flatNumber} ref={dialog} className="flat-tour flat-tour--immersive" aria-label={label + ' tour'}
    onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="flat-tour__body">
      <SiteHeader />
      <div className="room-tour-controls">
      <button type="button" className="room-tour-controls__back" onClick={onClose} aria-label="Back to floor plan">
        <span aria-hidden="true">&#8592;</span> Back
      </button>
      <nav className="minimal-room-stack" aria-label="Explore rooms">
        {rooms.map(room => <button key={room.id} type="button"
          className={'stack-item' + (selected.id === room.id ? ' active' : '')}
          data-room={room.id} aria-pressed={selected.id === room.id} disabled={busy}
          onPointerEnter={() => warm(room)} onFocus={() => warm(room)} onClick={() => choose(room)}>
          {room.name}
        </button>)}
      </nav>
      </div>
      <aside className="flat-tour__map-panel" aria-label={label + ' room map'}>
        <div id="flat-radar-drawing" hidden={!radarExpanded}>
          <p className="flat-tour__eyebrow">EXPLORE YOUR HOME</p>
          <h3>A room-by-room perspective.</h3>
          <p>Choose a room to step inside.</p>
          <div className="flat-tour__map" style={{ aspectRatio: flat.number === 2 ? 1 / mapAspect : mapAspect }}>
            <div className="flat-tour__map-content" style={flat.number === 2 ? { width: (mapAspect * 100) + '%', height: (100 / mapAspect) + '%' } : undefined}>
            <svg viewBox={mapViewBox} role="img" aria-label={label + ' floor plan'}>
              <image href={assetUrl(TIRMUTH_FLOOR_PLAN)} width="4000" height="3294" onError={() => setMapFailed(true)} />
            </svg>
            {!mapFailed && radarPosition && <div className="flat-radar__position" aria-hidden="true" style={{ left: radarPosition.left + '%', top: radarPosition.top + '%' }}><span ref={coneRef} className="flat-radar__cone" /><i /></div>}
            {!mapFailed && rooms.filter(room => room.cameraPosition).map(room => <button key={room.id} type="button"
              className={'flat-tour__pin' + (radarRoom.id === room.id ? ' is-selected' : '')}
              style={{ left: room.cameraPosition.left + '%', top: room.cameraPosition.top + '%' }} aria-label={'Explore ' + room.name}
              aria-pressed={selected.id === room.id} disabled={busy}
              onPointerEnter={() => warm(room)} onFocus={() => warm(room)} onClick={() => choose(room)}>
              <span className="flat-tour__ping" aria-hidden="true" />
              <span className="flat-tour__dot" aria-hidden="true" />
              <span className="flat-tour__tooltip">{room.name}</span>
            </button>)}
            </div>
          </div>
          {mapFailed && <p role="alert">The plan image could not load. Select a room below.</p>}
          <nav className="flat-tour__rooms" aria-label="Choose a room">
            {rooms.map(room => <button key={room.id} type="button" aria-pressed={selected.id === room.id} disabled={busy}
              onPointerEnter={() => warm(room)} onFocus={() => warm(room)} onClick={() => choose(room)}>{room.name}</button>)}
          </nav>
        </div>
      </aside>
      <section className="flat-tour__viewer" aria-label={'360 tour: ' + (active?.name ?? selected.name)}>
        <Canvas camera={{ position: [.1, 0, 0], fov: TIRMUTH_DEFAULT_FOV }} dpr={[1, 1.5]}>
          {active && <RoomLayer onPlace={placing && !busy ? pointerTools.place : undefined} rooms={rooms} key={active.id} view={active} zoomMotion={zoomMotion} />}
          {incoming && <RoomLayer rooms={rooms} key={incoming.id + '-' + retry} view={incoming} fade onComplete={complete} setFov={setFov} zoomMotion={zoomMotion} />}
          <RadarHeading radarHeading={radarHeading} coneRef={coneRef} roomId={radarRoom.id} rotation={radarView?.rotation} />
          {!busy && tourMarkers.filter(marker => marker.sourceScene === active?.id).map(marker => {
            const destination = rooms.find(room => room.id === marker.category)
            if (!destination) return null
            const position = new THREE.Vector3(...marker.position).applyAxisAngle(THREE.Object3D.DEFAULT_UP, active?.rotation ?? 0)
            return <PanoramaMarker key={marker.id} position={position} zIndexRange={[3, 1]}>
              <button type="button" className="flat-room-hotspot" disabled={placing} aria-label={'Go to ' + destination.name}
                onPointerDown={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}
                onPointerEnter={() => warm(destination)} onFocus={() => warm(destination)} onTouchStart={() => warm(destination)}
                onClick={event => { event.stopPropagation(); choose(destination, position) }}>
                <span className="flat-room-hotspot__circle" aria-hidden="true" />
                <span className="flat-room-hotspot__label">{destination.name}</span>
              </button>
            </PanoramaMarker>
          })}
          {!busy && flat.landmarks.filter(marker => marker.sourceScene === active?.id).map(marker => {
            const position = new THREE.Vector3(...marker.position).applyAxisAngle(THREE.Object3D.DEFAULT_UP, active?.rotation ?? 0)
            return <PanoramaMarker key={marker.id} position={position} zIndexRange={[3, 1]}>
              <details className="tm-landmark-label" onPointerDown={event => event.stopPropagation()}>
                <summary>{marker.title}</summary><p>{marker.description}</p>
              </details>
            </PanoramaMarker>
          })}
          <PanoramaControls fov={fov} setFov={setFov} rotationDelay={3} suspended={!!incoming}
            rotating={autoRotate && !!active && !busy && !placing}
            arrivalView={active?.preserveView ? undefined : rooms.find(room => room.id === (incoming ?? active)?.id)} />
        </Canvas>
        {flat.number === 2 && <button type="button" className="flat-pointer-toggle" aria-pressed={placing}
          onClick={() => setPlacing(value => !value)}>{placing ? 'Done placing markers' : 'Edit room markers'}</button>}
        {placing && <RoomPointerPanel tools={pointerTools} name={selected.name} />}
        <div className="flat-tour__caption"><h3>{active?.name ?? selected.name}</h3></div>
        {/* {busy && <div className="flat-tour__status" role="status">Loading {selected.name}...</div>} */}
        {error && <div className="flat-tour__status" role="alert">{error} <button type="button" onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
      </section>
    </div>
  </dialog>
}





