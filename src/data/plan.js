// Plan page manifest — the single source of truth for floors, unit types and
// the ~200 gallery images. The Plan page reads this file only; adding a floor
// or a configuration means editing data here, never touching components.
//
// Images live in public/ and are referenced by URL (never imported), so Vite
// serves them as-is with stable, predictable paths:
//
//   public/assets/plan/<unitType>/<floorId>/<image>.webp
//          ->  /assets/plan/<unitType>/<floorId>/<image>.webp
//
// Two ways to list images per floor/unit:
//   1. numberedImages() — for a run of renders sharing a naming convention
//      (recommended for the bulk of the ~200 images).
//   2. Explicit arrays   — for mixed names or a handful of special views.
//
// Drop the files into the matching public/assets/plan/... folder and they
// appear in the gallery; until then the gallery shows labelled placeholders.

const BASE = '/assets/plan'

export const UNIT_TYPES = [
  { id: '1bhk', label: '1 BHK' },
  { id: '2bhk', label: '2 BHK' },
  // Add configurations here (e.g. { id: '3bhk', label: '3 BHK' }) — the tabs
  // and galleries pick them up automatically.
]

// Builds: /assets/plan/1bhk/floor-01/floor-01-1bhk-01.webp, ...-02.webp, ...
export function numberedImages(unitType, floorId, count) {
  return Array.from(
    { length: count },
    (_, index) =>
      `${BASE}/${unitType}/${floorId}/${floorId}-${unitType}-${String(index + 1).padStart(2, '0')}.webp`,
  )
}

// One entry per floor of the tower. Extend or trim this list to match the
// real floor count — selectors, tabs and galleries all derive from it.
// `units` maps unit-type id -> image list (empty array = coming soon).
export const FLOORS = [
  {
    id: 'floor-01',
    label: 'Floor 01',
    units: {
      '1bhk': numberedImages('1bhk', 'floor-01', 6),
      '2bhk': numberedImages('2bhk', 'floor-01', 8),
    },
  },
  {
    id: 'floor-02',
    label: 'Floor 02',
    units: {
      '1bhk': numberedImages('1bhk', 'floor-02', 6),
      '2bhk': numberedImages('2bhk', 'floor-02', 8),
    },
  },
  {
    id: 'floor-03',
    label: 'Floor 03',
    units: {
      '1bhk': numberedImages('1bhk', 'floor-03', 6),
      '2bhk': numberedImages('2bhk', 'floor-03', 8),
    },
  },
  {
    id: 'floor-04',
    label: 'Floor 04',
    units: {
      '1bhk': numberedImages('1bhk', 'floor-04', 6),
      '2bhk': numberedImages('2bhk', 'floor-04', 8),
    },
  },
  {
    id: 'floor-05',
    label: 'Floor 05',
    units: {
      '1bhk': numberedImages('1bhk', 'floor-05', 6),
      '2bhk': numberedImages('2bhk', 'floor-05', 8),
    },
  },
  {
    id: 'floor-06',
    label: 'Floor 06',
    units: {
      '1bhk': numberedImages('1bhk', 'floor-06', 6),
      '2bhk': numberedImages('2bhk', 'floor-06', 8),
    },
  },
]

export const PLAN_INTRO = {
  eyebrow: 'THE PLANS',
  headline: ['Every floor.', 'Every perspective.'],
  intro:
    'Choose a floor and a configuration to walk through its residence — render by render.',
}

export const PLAN_IMAGES_PER_ROW = 3

// Safe lookups used by the page.
export const getFloor = (id) => FLOORS.find((floor) => floor.id === id) ?? FLOORS[0]
export const getUnitType = (id) =>
  UNIT_TYPES.find((unit) => unit.id === id) ?? UNIT_TYPES[0]
export const imagesFor = (floor, unitTypeId) => floor.units[unitTypeId] ?? []
