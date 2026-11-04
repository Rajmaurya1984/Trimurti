// Common landmark pin + popup. Panorama-agnostic: render one per mapped
// landmark inside any @react-three/fiber <Canvas> via drei <Html>.
//
// Props:
//   landmark     { title, category, description, position:[x,y,z] }
//   index        number — unique per panorama (popup id + registerCard key)
//   isOpen       bool
//   onToggle     (index|null) => void — pass setOpenIndex directly
//   registerCard (index, element|null) => void — for offscreen hiding
//   containerRef React ref — <Html portal={containerRef}> target
//   icon         NavIcon name (default "pin")
//   showLabel    show floating title when closed (default true)
import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Html } from '@react-three/drei'
import NavIcon from '../site/NavIcon.jsx'
import { landmarkDetail, splitLandmarkTitle } from './landmarkUtils.js'

export default function LandmarkMarker({
  landmark,
  index,
  isOpen,
  onToggle,
  registerCard,
  containerRef,
  icon = 'pin',
  showLabel = true,
  variant = 'pin',
  onInteractionChange,
  detailsPortal,
  staticMarker = false,
}) {
  const { name, meta } = splitLandmarkTitle(landmark.title)
  const detail = landmarkDetail(landmark)
  const pinRef = useRef(null)
  const dotRef = useRef(null)
  const interacting = useRef(false)
  const setInteracting = value => {
    interacting.current = value
    onInteractionChange?.(value)
  }
  useEffect(() => () => {
    if (interacting.current) onInteractionChange?.(false)
  }, [onInteractionChange])

  const attachCard = useCallback(
    (element) => registerCard?.(index, element),
    [index, registerCard],
  )

  const close = () => {
    onToggle?.(null)
    if (pinRef.current?.getAttribute('aria-hidden') === 'true') dotRef.current?.focus()
    else pinRef.current?.focus()
  }

  const popup = isOpen && <section
    id={`landmark-popup-${index}`}
    className={variant === 'callout' ? 'landmark__popup location-landmark-detail' : 'landmark__popup'}
    role="dialog" aria-label={name}
    onPointerEnter={() => setInteracting(true)} onPointerLeave={() => setInteracting(false)}
  >
    <button className="landmark__close" type="button" aria-label="Close landmark details" onClick={close}>×</button>
    <h2>{name}</h2>
    {meta && <p className="landmark__travel">{meta} away</p>}
    {detail && <p>{detail}</p>}
  </section>

  if (staticMarker) return <Html portal={containerRef} position={landmark.position} center zIndexRange={[100000, 100]} style={{ pointerEvents: 'none' }}>
    <div ref={attachCard} className="landmark landmark--callout" aria-hidden="true"><span className="landmark-callout__dot" /></div>
  </Html>

  return (
    <Html
      portal={containerRef}
      position={landmark.position}
      center
      zIndexRange={[100000, 100]}
      style={{ pointerEvents: 'none' }}
    >
      <div
        ref={attachCard}
        className={`landmark${variant === 'callout' ? ' landmark--callout is-compact' : ''}`}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerEnter={() => setInteracting(true)}
        onPointerLeave={() => setInteracting(false)}
        onFocus={() => setInteracting(true)}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false) }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && isOpen) {
            event.stopPropagation()
            close()
          }
        }}
      >
        {!isOpen && showLabel && variant !== 'callout' && (
          <h4 className="landmark__label" title={landmark.title}>
            {landmark.title}
          </h4>
        )}
        <button
          ref={pinRef}
          type="button"
          className={variant === 'callout' ? 'landmark-callout__plate' : 'landmark__pin'}
          aria-label={`Show details for ${name}`}
          aria-expanded={isOpen}
          aria-controls={isOpen ? `landmark-popup-${index}` : undefined}
          onClick={() => onToggle?.(isOpen ? null : index)}
        >
          <NavIcon name={icon} />
          {variant === 'callout' && <><span className="landmark-callout__name">{name}</span>{meta && <span className="landmark-callout__time">{meta}</span>}</>}
        </button>
        {variant === 'callout' && <><span className="landmark-callout__stem" aria-hidden="true" /><button
          ref={dotRef} className="landmark-callout__dot" type="button" title={landmark.title}
          aria-label={`Show details for ${name}`} aria-expanded={isOpen}
          aria-controls={isOpen ? `landmark-popup-${index}` : undefined}
          onClick={() => onToggle?.(isOpen ? null : index)}
        /></>}
        {variant === 'callout' && detailsPortal ? createPortal(popup, detailsPortal) : popup}
      </div>
    </Html>
  )
}
