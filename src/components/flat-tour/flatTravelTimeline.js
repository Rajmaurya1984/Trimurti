import { gsap } from 'gsap'

export function levelTravelDirection(position, fallback) {
  const [x, , z] = position ?? fallback.map(value => -value)
  const length = Math.hypot(x, z)
  if (length > 1e-6) return [-x / length, 0, -z / length]
  const fallbackLength = Math.hypot(fallback[0], fallback[2])
  return fallbackLength > 1e-6
    ? [fallback[0] / fallbackLength, 0, fallback[2] / fallbackLength]
    : [1, 0, 0]
}

// Keep the approach visible before blending, and hold the close view until
// the destination is fully opaque. The outgoing layer always remains opaque.
export function createFlatTravelTimeline({ lens, material, startFov, onComplete, paused = false }) {
  const timeline = gsap.timeline({ paused, onComplete })
  timeline.to(lens, { fov: startFov * .8, duration: .9, ease: 'sine.inOut' }, .15)
  timeline.to(material, { opacity: 1, duration: .85, ease: 'sine.inOut' }, .95)
  return timeline
}
