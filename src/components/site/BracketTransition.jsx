import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, ScrollRestoration, useBlocker, useLocation } from 'react-router-dom'
import { prepareLocation } from '../../lib/locationAssets.js'
import './BracketTransition.css'
import { useFrame } from '@react-three/fiber'

// Prepare destination assets while the bracket animation is running. 

const TIMING = { open: 600, swap: 1000, reveal: 900 }

export default function BracketTransition() {
  const [phase, setPhase] = useState('idle')
  const timers = useRef([])
  const running = useRef(false)
  const location = useLocation()
  const shouldBlock = useCallback(({ currentLocation, nextLocation }) =>
    !running.current && currentLocation.pathname !== nextLocation.pathname &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const blocker = useBlocker(shouldBlock)

  useEffect(() => { void prepareLocation().catch(() => {}) }, [])

  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    running.current = false
  }, [])

  useEffect(() => {
    if (blocker.state !== 'blocked' || running.current) return
    const ready = blocker.location.pathname === '/location' ? prepareLocation().catch(() => {}) : Promise.resolve()
    running.current = true
    timers.current.push(setTimeout(() => setPhase('in'), 0))
    timers.current.push(setTimeout(() => setPhase('open'), TIMING.open))
    timers.current.push(setTimeout(() => {
      void ready.then(() => {
        if (!running.current) return
        setPhase('swapping')
        blocker.proceed()
      })
    }, TIMING.swap))
  }, [blocker])
 
  // Wait for the router to commit lazy destinations before starting their reveal.
  useEffect(() => {
    if (phase !== 'swapping' || blocker.state !== 'unblocked') return
    timers.current.push(setTimeout(() => setPhase('enter'), 0))
    timers.current.push(setTimeout(() => {
      setPhase('idle')
      running.current = false
      timers.current = []
      requestAnimationFrame(() => {
      const heading = document.querySelector('.tm-route-stage h1')
      if (heading) {
        heading.setAttribute('tabindex', '-1')
        heading.focus({ preventScroll: true })
      }
      })
    }, TIMING.reveal))
  }, [phase, blocker.state])

  const busy = phase !== 'idle' || blocker.state === 'blocked'
  const glyphPhase = phase === 'in' ? 'is-in' : phase !== 'idle' ? 'is-open' : ''
  return <>
    <div className={'tm-route-stage tm-route-stage--' + phase} data-route={location.pathname} inert={busy} aria-busy={busy}>
      <div key={location.key} className="tm-route-content"><Outlet /></div>
    </div>
    <ScrollRestoration />
    <div className={'tm-transition-veil' + (phase === 'in' || phase === 'open' || phase === 'swapping' ? ' is-on' : '')} aria-hidden="true" />
    <div className={'tm-transition-glyphs ' + glyphPhase} aria-hidden="true">
      <span className="tm-transition-glyph tm-transition-glyph--left">[</span>
      <span className="tm-transition-glyph tm-transition-glyph--right">]</span>
    </div>
    {busy && <div className="tm-transition-shield" aria-hidden="true" />}
  </>
}


