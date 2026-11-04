import { useCallback, useEffect, useRef, useState } from 'react'

// Five drag segments, ending at 24, 48, 72, 96 and 120 for 121 frames.
// Derive duration from this project's frame count rather than the reference's 100 frames.
const DRAG_THRESHOLD = 24
const VIEW_COUNT = 5
// A 24-frame drag takes about 1.2 seconds, with eased starts and stops.
const FRAME_RATE = 18
const IGNORE_SELECTOR = 'button, a, input, textarea, select, [data-no-drag]'
const mod = (value, count) => ((value % count) + count) % count

export default function useOrbitDrag({ elRef, frameCount, enabled = true, onFrame }) {
  const [frameIndex, setFrame] = useState(0)
  const [isDragging, setDragging] = useState(false)
  // Positions are turns, so segment angle and duration do not depend on images.
  const state = useRef({ position: 0, animation: null, pointerId: null,
    startX: 0, committed: false })
  const enabledRef = useRef(enabled)
  const frameCallback = useRef(onFrame)
  useEffect(() => {
    enabledRef.current = enabled
    frameCallback.current = onFrame
  }, [enabled, onFrame])

  const animateTo = useCallback((target) => {
    const s = state.current
    if (!enabledRef.current || s.animation || target === s.position) return
    s.animation = { from: s.position, to: target, elapsed: 0,
      last: performance.now(), duration: Math.abs(target - s.position) * Math.max(frameCount, 1) / FRAME_RATE * 1000 }
  }, [frameCount])

  const nextView = useCallback((direction) => {
    const count = Math.max(frameCount, 1)
    const frame = Math.round(state.current.position * count)
    const step = Math.ceil((count - 1) / VIEW_COUNT)
    const stops = [...new Set(Array.from({ length: VIEW_COUNT + 1 },
      (_, index) => Math.min(index * step, count - 1)))]
    // After the final frame, continue across the seam into the first segment.
    const next = direction > 0
      ? stops.find((stop) => stop > frame) ?? count + (stops[1] ?? 0)
      : stops.findLast((stop) => stop < frame) ?? (stops.at(-2) ?? 0) - count
    animateTo(next / count)
  }, [animateTo, frameCount])

  useEffect(() => {
    const el = elRef.current
    if (!el) return undefined
    const s = state.current
    const down = (event) => {
      if (!enabledRef.current || s.animation || s.pointerId !== null || event.button > 0) return
      if (event.target.closest?.(IGNORE_SELECTOR)) return
      s.pointerId = event.pointerId
      s.startX = event.clientX
      s.committed = false
      setDragging(true)
      try { el.setPointerCapture(event.pointerId) } catch { /* window release is a fallback */ }
    }
    const move = (event) => {
      if (event.pointerId !== s.pointerId || s.committed || !enabledRef.current) return
      const distance = event.clientX - s.startX
      if (Math.abs(distance) < DRAG_THRESHOLD) return
      s.committed = true // Holding or reversing this gesture cannot trigger again.
      nextView(distance > 0 ? 1 : -1)
    }
    const end = (event) => {
      if (event.pointerId !== s.pointerId) return
      s.pointerId = null
      setDragging(false)
      // Release/cancel ends the gesture, never the already committed animation.
      try { el.releasePointerCapture(event.pointerId) } catch { /* capture already lost */ }
    }
    const key = (event) => {
      if (!enabledRef.current || event.target.closest?.(IGNORE_SELECTOR)) return
      const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
      if (!direction) return
      event.preventDefault()
      if (!event.repeat) nextView(direction)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('lostpointercapture', end)
    el.addEventListener('keydown', key)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('lostpointercapture', end)
      el.removeEventListener('keydown', key)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      s.pointerId = null
    }
  }, [elRef, nextView])

  useEffect(() => {
    const s = state.current
    const count = Math.max(frameCount, 1)
    let raf
    let drawn = -1
    const tick = (now) => {
      const a = s.animation
      if (a) {
        // Pause long background-tab gaps rather than skipping the whole segment.
        a.elapsed += Math.min(Math.max(now - a.last, 0), 50)
        a.last = now
        const progress = Math.min(a.elapsed / a.duration, 1)
        const easedProgress = (1 - Math.cos(Math.PI * progress)) / 2
        s.position = a.from + (a.to - a.from) * easedProgress
        if (progress === 1) {
          s.position = mod(a.to, 1)
          s.animation = null
        }
      }
      const next = mod(Math.round(s.position * count), count)
      if (next !== drawn) {
        drawn = next
        frameCallback.current?.(next)
        setFrame(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [frameCount])

  const jumpTo = useCallback((index) => {
    const s = state.current
    const target = mod(index, Math.max(frameCount, 1)) / Math.max(frameCount, 1)
    const delta = mod(target - s.position + 0.5, 1) - 0.5
    animateTo(s.position + delta)
  }, [frameCount, animateTo])

  return { frameIndex, jumpTo, isDragging }
}
