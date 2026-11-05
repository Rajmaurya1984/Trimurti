import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DEFAULT_VIEW_ID, WINDOW_VIEW_FLOORS, WINDOW_VIEW_TIMES, getWindowViewAssets } from '../../data/windowView.js'
import { getWindowTexture, loadWindowTexture, warmWindowPreviews } from './windowTextures.js'
import PanoramaControls from './PanoramaControls.jsx'
import WindowViewIcon from './WindowViewIcon.jsx'
import NavIcon from '../site/NavIcon.jsx'
import './WindowView.css'
import SiteHeader from '../site/SiteHeader.jsx'

const floorById = (id) => WINDOW_VIEW_FLOORS.find((floor) => floor.id === id) ?? WINDOW_VIEW_FLOORS[0]

const PHOTO_SPAN = Math.PI
const photoHeight = texture => 50 * PHOTO_SPAN * texture.image.height / texture.image.width
const photoMaxFov = texture => Math.min(95, THREE.MathUtils.radToDeg(2 * Math.atan(photoHeight(texture) / 100)) - 1)

function PanoramaImage({ texture }) {
  return (
    <mesh scale={[-1, 1, 1]}>
      <cylinderGeometry args={[50, 50, photoHeight(texture), 64, 1, true, Math.PI - PHOTO_SPAN / 2, PHOTO_SPAN]} />
      <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function FadeImage({ view, onComplete, reducedMotion }) {
  const materialRef = useRef(null)
  const progressRef = useRef(0)
  const completedRef = useRef(false)
  useFrame((_, delta) => {
    if (!materialRef.current || completedRef.current) return
    progressRef.current = Math.min(1, progressRef.current + (reducedMotion ? 1 : Math.min(delta, 0.05) / 0.25))
    const t = progressRef.current
    materialRef.current.opacity = t * t * (3 - 2 * t)
    if (t === 1) {
      completedRef.current = true
      onComplete(view)
    }
  })
  return (
    <mesh scale={[-1, 1, 1]} renderOrder={1}>
      <cylinderGeometry args={[50, 50, photoHeight(view.texture), 64, 1, true, Math.PI - PHOTO_SPAN / 2, PHOTO_SPAN]} />
      <meshBasicMaterial ref={materialRef} map={view.texture} toneMapped={false} side={THREE.DoubleSide}
        transparent opacity={0} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

function WindowViewSession({ onClose, direction }) {
  const [selection, setSelection] = useState({ id: DEFAULT_VIEW_ID, time: 'day', revision: 0 })
  const [activeView, setActiveView] = useState(null)
  const [incomingView, setIncomingView] = useState(null)
  const [error, setError] = useState('')
  const [fov, setFov] = useState(72)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    let cancelled = false
    const assets = getWindowViewAssets(floorById(selection.id), selection.time, direction)
    const load = async () => {
      setError('')
      if (!assets) {
        setActiveView(null)
        setIncomingView(null)
        setError(`The ${direction} view is not available for this floor and time yet.`)
        return
      }
      try {
        const texture = getWindowTexture(assets.image)
          ?? await loadWindowTexture(assets.preview).catch(() => loadWindowTexture(assets.image))
        if (cancelled) return
        const view = { ...selection, texture }
        setIncomingView(view)
        const detail = await loadWindowTexture(assets.image).catch(() => null)
        if (cancelled || !detail) return
        const sharpView = { ...selection, texture: detail }
        setIncomingView((current) => current?.revision === selection.revision ? sharpView : current)
      } catch {
        if (!cancelled) setError('This view could not be loaded. Select it again to retry.')
      }
    }
    const frame = requestAnimationFrame(() => { void load() })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [selection, direction])

  const completeFade = useCallback((view) => {
    setActiveView(view)
    setIncomingView((current) => current?.revision === view.revision ? null : current)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const choose = (update) => setSelection((current) => {
    const next = { ...current, ...update }
    if (!error && next.id === current.id && next.time === current.time) return current
    return { ...next, revision: current.revision + 1 }
  })
  const warm = (id, time) => {
    const assets = getWindowViewAssets(floorById(id), time, direction)
    if (!assets) return
    void loadWindowTexture(assets.preview).catch(() => {})
  }
  const displayed = activeView ?? selection
  const visibleTextures = [activeView?.texture, incomingView?.texture].filter(Boolean)
  const maxFov = visibleTextures.length ? Math.min(...visibleTextures.map(photoMaxFov)) : 55
  const minFov = Math.min(35, maxFov)
  const displayedFov = Math.min(fov, maxFov)

  return (
    <div className="window-view" role="dialog" aria-modal="true"
      aria-label={`Window view - ${direction ?? ''} - ${floorById(displayed.id).label} - ${displayed.time}`}>
      <SiteHeader />
      <Canvas className="window-view__canvas" camera={{ position: [0, 0, 0.1], fov: 72 }} dpr={[1, 1.5]}>
        {activeView && <PanoramaImage texture={activeView.texture} />}
        {incomingView && <FadeImage key={incomingView.revision} view={incomingView} onComplete={completeFade} reducedMotion={reducedMotion} />}
        <PanoramaControls fov={displayedFov} setFov={setFov} minFov={minFov} maxFov={maxFov} rotating={!!activeView && !reducedMotion} horizontalSpan={PHOTO_SPAN} />
      </Canvas>
      <div className="window-view__navigation">
        <button type="button" className="window-view__close" onClick={onClose} aria-label="Back to floor plan">
         <NavIcon name="chevron-left"/>Back 
        </button>
      <div className="window-view__menu">  
        <div className="window-view__times" role="group" aria-label="Time of day">
          {WINDOW_VIEW_TIMES.map((time) => (
            <button key={time.id} type="button" className="window-view__time"
              aria-label={time.label} aria-pressed={selection.time === time.id} title={time.label}
              onPointerEnter={() => warm(selection.id, time.id)} onFocus={() => warm(selection.id, time.id)}
              onClick={() => choose({ time: time.id })}>
              <WindowViewIcon name={time.id} /><span>{time.label}</span>
            </button>
          ))}
        </div>
        <p className="window-view__menu-label">{direction ? `${direction.toUpperCase()} VIEW ` : ''}</p>
        {WINDOW_VIEW_FLOORS.map((floor) => (
          <button key={floor.id} type="button"
            className={`window-view__floor${floor.id === selection.id ? ' is-active' : ''}`}
            aria-current={floor.id === selection.id ? 'true' : undefined}
            onPointerEnter={() => warm(floor.id, selection.time)} onFocus={() => warm(floor.id, selection.time)}
            onClick={() => choose({ id: floor.id })}>
            {floor.label}
          </button>
        ))}
        {error && <p className="window-view__error" role="status">{error}</p>}
      </div>
      </div>
    </div>
  )
}

export default function WindowView({ open, onClose, preload = false, direction }) {
  useEffect(() => {
    if (!preload && !open) return undefined
    let cancelled = false
    void warmWindowPreviews(() => cancelled, direction)
    return () => { cancelled = true }
  }, [preload, open, direction])
  return open ? <WindowViewSession key={direction} direction={direction} onClose={onClose} /> : null
}
