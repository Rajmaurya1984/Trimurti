import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/site/SiteHeader.jsx'
import NavIcon from '../components/site/NavIcon.jsx'
import { TIRMUTH_AMENITY_SCENES } from '../data/tirmuthAmenities.js'
import './Editorial.css'
import './Amenities.css'
import '../components/window-view/TourSceneMenu.css'
import './InteriorAmenities.css'


//testing
const AmenityPanorama = lazy(() => import('../components/amenity-tour/AmenityPanorama.jsx'))
const HOTSPOTS = []
const warmScene = (scene) => {
  void import('../components/window-view/windowTextures.js')
    .then(({ loadWindowTexture }) => loadWindowTexture(scene.image)).catch(() => {})
}

const RADAR_STORAGE_KEY = 'tirmuth-amenity-radar-offsets-v1'
function readRadarOffsets() {
  try {
    const saved = JSON.parse(localStorage.getItem(RADAR_STORAGE_KEY) ?? '{}')
    return Object.fromEntries(TIRMUTH_AMENITY_SCENES.filter(item => Number.isFinite(saved?.[item.id]))
      .map(item => [item.id, saved[item.id]]))
  } catch { return {} }
}
const normalizeHeading = angle => ((angle + 180) % 360 + 360) % 360 - 180
export default function Amenities() {
  const [selectedId, setSelectedId] = useState(TIRMUTH_AMENITY_SCENES[0].id)
  const scene = TIRMUTH_AMENITY_SCENES.find(item => item.id === selectedId)
  const navigate = useNavigate()
  const coneRef = useRef(null)
  const positionRef = useRef(null)
  const headingRef = useRef(null)
  const [radarOffsets, setRadarOffsets] = useState(readRadarOffsets)
  const [aligning, setAligning] = useState(false)
  const [radarNotice, setRadarNotice] = useState('')

  function saveRadarOffset(id, angle) {
    const next = { ...radarOffsets, [id]: normalizeHeading(angle) }
    setRadarOffsets(next)
    try { localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(next)); setRadarNotice('Direction saved for this scene.') }
    catch { setRadarNotice('Direction updated. Browser storage is unavailable, so this alignment lasts for this visit.') }
  }
  function alignDirection(event) {
    const current = headingRef.current
    if (!current || current.sceneId !== selectedId) {
      setRadarNotice('Wait for the selected scene to finish opening, then try again.')
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - rect.left - rect.width * scene.cameraPosition.left / 100
    const dy = event.clientY - rect.top - rect.height * scene.cameraPosition.top / 100
    if (Math.hypot(dx, dy) < 8) return
    const bearing = Math.atan2(dx, -dy) * 180 / Math.PI
    saveRadarOffset(scene.id, bearing - current.heading)
    setAligning(false)
  }
  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])
  
  return (
    <main className="editorial-page amenities-page interior-amenities-page" aria-label="Tirmuth amenities">
      <SiteHeader/>
      <Suspense fallback={<p className="interior-amenities__loading" role="status">Opening amenities…</p>}>
        <AmenityPanorama scene={scene} scenes={TIRMUTH_AMENITY_SCENES} hotspots={HOTSPOTS} onNavigate={setSelectedId} radar={{ coneRef, positionRef, headingRef, offsets: radarOffsets }} />
      </Suspense>
      <aside className="amenities-plan" aria-label="Amenities floor plan">
        <div className="amenities-plan__drawing">
          <img src="/amenitites/amenitiesFloorPlan.png" alt="Amenities floor plan" draggable={false} />
          <div ref={positionRef} className="amenities-radar__position" hidden aria-hidden="true">
            <span ref={coneRef} className="amenities-radar__cone" /><i />
          </div>
          {TIRMUTH_AMENITY_SCENES.filter(item => item.cameraPosition).map(item => <button
            key={item.id} type="button" className="amenities-plan__pin"
            style={{ left: item.cameraPosition.left + '%', top: item.cameraPosition.top + '%' }}
            aria-label={'Explore ' + item.name} aria-pressed={selectedId === item.id} title={item.name}
            onPointerEnter={() => warmScene(item)} onFocus={() => warmScene(item)}
            onClick={() => { setSelectedId(item.id); setRadarNotice('') }} />)}
          {aligning && <button type="button" className="amenities-plan__align-target" aria-label="Click the feature you are facing to align the radar" onClick={alignDirection} />}
        </div>
        {/* <button type="button" className="amenities-plan__align-toggle" aria-pressed={aligning}
          onClick={() => { setAligning(value => !value); setRadarNotice('') }}>{aligning ? 'Done aligning' : 'Align direction'}</button> */}
        {aligning && <div className="amenities-plan__alignment">
          <p>Face a known feature, then click its position on the plan.</p>
          <label>Fine-tune direction<input type="range" min="-180" max="180" step="1"
            value={normalizeHeading(radarOffsets[scene.id] ?? scene.radarHeadingOffset ?? 0)}
            onChange={event => saveRadarOffset(scene.id, Number(event.target.value))} /></label>
        </div>}
        {radarNotice && <p className="amenities-plan__notice" role="status">{radarNotice}</p>}
      </aside>
      <div className="amenities-tour-controls">
        <Link className="amenities-back" to="/"><NavIcon name="chevron-left" />Back</Link>
        <nav className="minimal-room-stack" aria-label="Explore amenities">
          <div className="minimal-room-stack__title">Amenities</div>
          {TIRMUTH_AMENITY_SCENES.map((item, index) => (
            <button key={item.id} type="button"
              className={'stack-item' + (item.id === selectedId ? ' active' : '')}
              aria-pressed={item.id === selectedId}
              onPointerEnter={() => warmScene(item)} onFocus={() => warmScene(item)}
              onClick={() => setSelectedId(item.id)}>
              <span className="stack-item__number" aria-hidden="true">{index + 1}</span>
              <span className="stack-item__label">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  )
}