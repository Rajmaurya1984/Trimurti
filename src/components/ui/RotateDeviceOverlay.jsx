import { useEffect, useRef } from 'react'

export default function RotateDeviceOverlay() {
  const dialogRef = useRef(null)

  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)')
    const phone = window.matchMedia('(max-width: 767px), (max-width: 1024px) and (any-pointer: coarse)')
    const dialog = dialogRef.current
    let frame = 0
    const syncOrientation = () => {
      const mustRotate = phone.matches && portrait.matches
      if (mustRotate && !dialog.open) dialog.showModal()
      if (!mustRotate && dialog.open) dialog.close()
    }
    const scheduleSync = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(syncOrientation)
    }
    syncOrientation()
    portrait.addEventListener('change', scheduleSync)
    phone.addEventListener('change', scheduleSync)
    window.addEventListener('resize', scheduleSync)
    window.addEventListener('orientationchange', scheduleSync)
    window.addEventListener('pageshow', scheduleSync)
    window.visualViewport?.addEventListener('resize', scheduleSync)
    window.screen.orientation?.addEventListener('change', scheduleSync)
    return () => {
      cancelAnimationFrame(frame)
      portrait.removeEventListener('change', scheduleSync)
      phone.removeEventListener('change', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
      window.removeEventListener('orientationchange', scheduleSync)
      window.removeEventListener('pageshow', scheduleSync)
      window.visualViewport?.removeEventListener('resize', scheduleSync)
      window.screen.orientation?.removeEventListener('change', scheduleSync)
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog ref={dialogRef} className="rotate-device-overlay"
      aria-labelledby="rotate-device-title" aria-describedby="rotate-device-description"
      onCancel={event => event.preventDefault()}>
      <div className="rotate-content">
        <svg className="phone-icon" width="48" height="72" viewBox="0 0 48 72" fill="none" aria-hidden="true">
          <rect x="7" y="3" width="34" height="66" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M19 9h10M21 62h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h2 id="rotate-device-title">Rotate your device</h2>
        <p id="rotate-device-description">For the best view of 67 Avenue,<br />please turn your phone to landscape.</p>
      </div>
    </dialog>
  )
}
