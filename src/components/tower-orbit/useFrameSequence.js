import { useEffect, useRef, useState } from 'react'

// Preloads every frame of an image sequence with new Image() and reports
// progress. The images are kept in a ref (not state) so the canvas renderer
// can draw the current frame the moment it finishes loading — the viewer is
// usable as soon as the first frames arrive while the rest stream in.
//
// A frame that fails to load still counts toward progress, so one missing
// file can never block the viewer (the canvas skips undecodable frames).
//
// `urls` is expected to be stable for the lifetime of the viewer (it comes
// from towerFrames.js), so `loaded` is never reset mid-run: `ready` is
// derived for the empty-list case instead of being set inside the effect.
export default function useFrameSequence(urls) {
  const [loaded, setLoaded] = useState(0)
  const [allSettled, setAllSettled] = useState(false)
  const framesRef = useRef([])

  useEffect(() => {
    if (!urls.length) {
      framesRef.current = []
      return undefined
    }

    let cancelled = false
    let count = 0
    const images = new Array(urls.length)
    framesRef.current = images

    const settle = () => {
      if (cancelled) return
      count += 1
      setLoaded(count)
      if (count === urls.length) setAllSettled(true)
    }

    urls.forEach((url, index) => {
      const image = new Image()
      image.decoding = 'async'
      // Finish decoding during loading, before the first animated turn.
      image.onload = async () => {
        try { await image.decode() } catch { /* onload already confirmed a usable image */ }
        settle()
      }
      image.onerror = settle
      image.src = url
      images[index] = image
    })

    return () => {
      cancelled = true
      framesRef.current = []
    }
  }, [urls])

  const total = urls.length
  const progress = total
    ? Math.min(Math.round((loaded / total) * 100), 100)
    : 100
  const ready = total === 0 || (allSettled && loaded >= total)
  return { framesRef, loaded, total, progress, ready }
}
