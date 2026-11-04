import { lazy, Suspense, useEffect, useState } from 'react'
import SiteHeader from '../components/site/SiteHeader.jsx'
import { TIRMUTH_FLATS, TIRMUTH_FLOOR_PLAN } from '../data/tirmuthFlats.js'
import { assetUrl } from '../lib/utils.js'
import NavIcon from '../components/site/NavIcon.jsx'
import { WINDOW_VIEW_HOTSPOTS } from '../data/windowView.js'
import './TirmuthPlan.css'

const FlatTour = lazy(() => import('../components/flat-tour/FlatTour.jsx'))

const WindowView = lazy(() => import('../components/window-view/WindowView.jsx'))

export default function Plan() {
  const [tour, setTour] = useState(null)
  const [status, setStatus] = useState('loading')
  const [viewDirection, setViewDirection] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const planUrl = assetUrl(TIRMUTH_FLOOR_PLAN) + (attempt ? '?retry=' + attempt : '')

  // Native Image events also handle cached assets reliably outside the SVG tree.
  useEffect(() => {
    const image = new Image()
    let cancelled = false
    let settled = false
    const finish = next => {
      if (cancelled || settled) return
      settled = true
      clearTimeout(timeout)
      setStatus(next)
    }
    const timeout = setTimeout(() => finish('error'), 30000)
    image.onload = () => finish(image.naturalWidth > 0 ? 'ready' : 'error')
    image.onerror = () => finish('error')
    image.src = planUrl
    if (image.complete) finish(image.naturalWidth > 0 ? 'ready' : 'error')
    return () => {
      cancelled = true
      clearTimeout(timeout)
      image.onload = null
      image.onerror = null
    }
  }, [planUrl])
  return <main className="tm-plan-page">
    <SiteHeader />
    <section className="tm-plan-toolbar" aria-label="Explore the residences">
      <div className="tm-plan-flats plan-welcome">{TIRMUTH_FLATS.map(flat => <button type="button" key={flat.number} className="flat-three-trigger" onClick={() => setTour(flat.number)} aria-label={'Open ' + flat.label + ' 360 tour'}>
        <span className="flat-three-trigger__label"><small>{flat.configuration} &middot; {flat.area} SQ.FT.</small>{flat.label}</span>
       </button>)}
      </div>
    </section>
    <section className="tm-plan-stage" aria-label="10th floor layout">
      {status !== 'error' && <svg viewBox="-30 120 3890 3100" aria-label="10th-floor plan with North, East, South and West window views"><svg x="330" y="480" width="3170" height="2380" viewBox="330 480 3170 2380" overflow="hidden"><image key={attempt} href={planUrl} width="4000" height="3294" /></svg>
        {status === 'ready' && WINDOW_VIEW_HOTSPOTS.map(hotspot => <foreignObject key={hotspot.id} x={hotspot.x - 90} y={hotspot.y - 90} width="180" height="180" className="tm-plan-eye-anchor">
          <button type="button" className="tm-plan-eye" aria-label={'Open ' + hotspot.direction + ' window view'} title={hotspot.direction.toUpperCase() + ' window view'} onClick={() => setViewDirection(hotspot.direction)}>
            <NavIcon name="eye" />
            {/* <span>{hotspot.direction.toUpperCase()}</span> */}
          </button>
        </foreignObject>)}
      </svg>}
      {status === 'loading' && <p className="tm-plan-status" role="status">Loading floor plan...</p>}
      {status === 'error' && <div className="tm-plan-status" role="alert"><p>The floor plan could not load.</p><button onClick={() => { setStatus('loading'); setAttempt(value => value + 1) }}>Retry</button></div>}
    </section>
    {tour !== null && <Suspense fallback={<div className="tm-plan-opening" role="status">Opening Flat {tour}...</div>}><FlatTour key={tour} flatNumber={tour} onClose={() => setTour(null)} /></Suspense>}
    {viewDirection && <Suspense fallback={<div className="tm-plan-opening" role="status">Opening window view...</div>}><WindowView open direction={viewDirection} onClose={() => setViewDirection(null)} /></Suspense>}
  </main>
}


