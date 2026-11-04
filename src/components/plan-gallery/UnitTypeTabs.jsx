import { cx } from '../../lib/utils.js'

// Unit-type tabs (1 BHK / 2 BHK / …) for the Plan page. Driven entirely by
// UNIT_TYPES from data/plan.js — new configurations appear automatically.
export default function UnitTypeTabs({ unitTypes, value, onChange }) {
  return (
    <div className="unit-tabs" role="tablist" aria-label="Select a configuration">
      {unitTypes.map((unit) => (
        <button
          key={unit.id}
          type="button"
          role="tab"
          aria-selected={unit.id === value}
          className={cx('unit-tabs__item', unit.id === value && 'is-active')}
          onClick={() => onChange(unit.id)}
        >
          {unit.label}
        </button>
      ))}
    </div>
  )
}