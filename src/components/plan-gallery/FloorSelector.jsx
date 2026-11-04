import { cx } from '../../lib/utils.js'

// Vertical floor picker for the Plan page. Purely presentational — the page
// owns the selected floor state.
export default function FloorSelector({ floors, value, onChange }) {
  return (
    <div className="floor-selector" role="tablist" aria-label="Select a floor">
      {floors.map((floor) => (
        <button
          key={floor.id}
          type="button"
          role="tab"
          aria-selected={floor.id === value}
          className={cx('floor-selector__item', floor.id === value && 'is-active')}
          onClick={() => onChange(floor.id)}
        >
          <span>{floor.label}</span>
          <i aria-hidden="true">→</i>
        </button>
      ))}
    </div>
  )
}