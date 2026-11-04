// Common landmark filter panel. Panorama-agnostic: pass any categories +
// markers, get back a controlled filter ('all' | categoryId).
// Mirrors the Annupurna-style panel: rule-led eyebrow, flat category rows.
import { useEffect, useRef } from 'react'

export default function LandmarkLegend({
  markers = [],
  categories = [],
  value = 'all',
  onChange,
  eyebrow = 'LANDMARKS',
  title = null,
  intro = null,
  allLabel = null,
}) {
  const groupsRef = useRef(null)

  // Keep the open group in view when the filter changes.
  useEffect(() => {
    const list = groupsRef.current
    if (!list) return
    const group = list.querySelector('.is-open')
    if (!group) {
      list.scrollTop = 0
      return
    }
    list.scrollTop += group.getBoundingClientRect().top - list.getBoundingClientRect().top
  }, [value])

  return (
    <aside
      className="landmark-legend"
      aria-label="Landmarks around the project"
    >
      {/* <header className="landmark-legend__head"> */}
        {/* <p className="landmark-legend__eyebrow">{eyebrow}</p> */}
        {/* {title && <h2 className="landmark-legend__title">{title}</h2>}
        {intro && <p className="landmark-legend__intro">{intro}</p>} */}
      {/* </header> */}

      {/* {allLabel && (
        <div className="landmark-legend__toolbar">
          <span>{markers.length} PLACES</span>
          <button
            type="button"
            aria-pressed={value === 'all'}
            onClick={() => onChange?.('all')}
          >
            {allLabel}
          </button>
        </div>
      )} */}

      <nav
        id="landmark-legend-body"
        ref={groupsRef}
        className="landmark-groups"
        aria-label="Filter landmarks by category"
      >
        {categories.map((item) => {
          const open = value === item.id
          return (
            <div key={item.id} className={`landmark-group${open ? ' is-open' : ''}`}>
              <button
                type="button"
                className="landmark-filter"
                aria-pressed={open}
                onClick={() => onChange?.(item.id)}
              >
                <span className="landmark-filter__label">{item.label}</span>
              </button>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
