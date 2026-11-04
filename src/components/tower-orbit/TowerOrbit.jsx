import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import useFrameSequence from './useFrameSequence.js'
import useOrbitDrag from './useOrbitDrag.js'
import './TowerOrbit.css'

// Full-bleed image-sequence "3D" orbit of the tower.
//
// Renders the active frame onto a 2D canvas (aspect-correct cover fit,
// device-pixel-ratio aware) — the same technique as the reference site.
// Interaction is click-and-drag (useOrbitDrag); loading is useFrameSequence.
// This component is frame-count agnostic: pass any sequence built with
// createFrameSequence().
//
//   sequence   { urls, count } from towerFrames.js
//   label      accessible description for the stage
//   className  optional extra class on the stage element
export default function TowerOrbit({ sequence, label = 'Tower view', className = '' }) {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  // Mirrors `size` so `paint` can stay dependency-free and be called from
  // anywhere (including inside the rAF loop).
  const sizeRef = useRef({ width: 0, height: 0 })
  const paintedRef = useRef(0)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const { framesRef, loaded, progress, ready } = useFrameSequence(sequence.urls)

  // Paints one frame onto the canvas: device-pixel-ratio sized backing store,
  // aspect-correct "cover" fit, centred. Reads refs only, so it is stable and
  // can be invoked straight from the animation loop. Painting there instead of
  // in a React effect is what keeps the rotation fluid: the pixels of each new
  // frame land in the same animation tick that chose them, with no re-render
  // between the drag and your eyes.
  const paint = useCallback(
    (index) => {
      const canvas = canvasRef.current
      const image = framesRef.current[index]
      const { width: cssWidth, height: cssHeight } = sizeRef.current
      if (!canvas || !image || !cssWidth || !cssHeight) return
      // Frames still decoding are skipped and picked up on the next pass, so the
      // canvas never flashes blank.
      if (!image.complete || !image.naturalWidth) return

      paintedRef.current = index

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(cssWidth * dpr)
      const height = Math.round(cssHeight * dpr)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const context = canvas.getContext('2d')
      context.clearRect(0, 0, width, height)
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale
      context.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      )
    },
    [framesRef],
  )

  const { isDragging } = useOrbitDrag({
    elRef: stageRef,
    frameCount: sequence.count,
    enabled: ready,
    onFrame: paint,
  })

  // Track the stage size so the canvas backing store can match it exactly. The
  // paint itself happens below (and in the animation loop), never here.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (sizeRef.current.width === width && sizeRef.current.height === height) return
      sizeRef.current = { width, height }
      setSize(sizeRef.current)
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  // Repaint the current frame whenever the stage is resized or a frame finishes
  // decoding — the loop only paints on frame *change*, so late-arriving frames
  // and resizes need this nudge.
  useLayoutEffect(() => {
    paint(paintedRef.current)
  }, [paint, loaded, size])

  const stage = (
    <div
      ref={stageRef}
      className={[
        'tower-orbit',
        isDragging ? 'is-dragging' : '',
        ready ? 'is-ready' : 'is-loading',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={label}
      tabIndex={0}
    >
      <canvas ref={canvasRef} className="tower-orbit__canvas" />

      {/* Loading overlay: percentage until every frame is in memory.
          Stays mounted after ready so its fade-out can play. */}
      <div
        className="tower-orbit__loader"
        role="status"
        aria-live="polite"
        aria-hidden={ready || undefined}
      >
        <span className="tower-orbit__loader-value">{progress}%</span>
        <span className="tower-orbit__loader-label">Loading</span>
        <span className="tower-orbit__loader-bar">
          <i style={{ width: `${progress}%` }} />
        </span>
      </div>

    </div>
  )

  return stage
}
