// Location page content: intro copy + landmarks around the project.
// The map itself reads coordinates from SITE (data/site.js) and the Mapbox
// token from VITE_MAPBOX_TOKEN in .env.local.

export const LOCATION_INTRO = {
  eyebrow: 'THE NEIGHBOURHOOD',
  headline: ['Well connected.', 'Peacefully placed.'],
  intro:
    'Everyday essentials sit within minutes of the gate, while the city stays within easy reach.',
}

export const LOCATION_MAP_NOTE =
  'An interactive map view will render here once a Mapbox access token is configured.'

// Landmark categories for the Location panorama filter. `icon` maps to a name in
// components/site/NavIcon.jsx (the project's inline icon set - there is no icon
// font here, unlike the reference site). The order below is the order the filter
// panel renders.
// The brand palette is fixed at four colours, so categories are told apart by

// icon and label rather than by hue: everything draws in cashmere (#C1AA90).
export const LOCATION_CATEGORIES = [
  { id: 'Connectivity', label: 'CONNECTIVITY', icon: 'train' },
  // { id: 'infrastructure', label: 'INFRASTRUCTURE', icon: 'bridge' },
  // { id: 'safety', label: 'SAFETY', icon: 'shield' },
  { id: 'hospitals', label: 'HOSPITALS', icon: 'cross' },
  { id: 'schools', label: 'EDUCATION', icon: 'cap' },
  // { id: 'roads', label: 'MAJOR ROADS', icon: 'road' },
  { id: 'lifestyle', label: 'LIFESTYLE', icon: 'bag' },
]

export const getLocationCategory = (id) =>
  LOCATION_CATEGORIES.find((category) => category.id === id)

/** How many landmarks each category holds, keyed by category id. */
export const countByCategory = (landmarks) =>
  landmarks.reduce((counts, landmark) => {
    counts[landmark.category] = (counts[landmark.category] ?? 0) + 1
    return counts
  }, {})

// Per-landmark copy and coordinates live beside the authoring tool that writes
// them, in components/location-map/LandMark/LandMarkPanaroma.jsx. Each entry
// carries a `category` id from LOCATION_CATEGORIES above, a title with its drive
// time inline ("... 5 MINS") and a [x, y, z] sphere position - or `null` while a
// landmark is still waiting to be placed on the panorama.
