// Single source of truth for project-level content: brand, navigation and
// site-wide copy. Pages import from here instead of hardcoding text.

export const SITE = {
  id: '67avenue',
  name: '67 Avenue',
  brandMark: '67',
  logo: '/assets/home/logo.png',
  groupLogo: '/assets/home/group.png',
  brandTail: 'AVENUE',
  tagline: 'RESIDENCES OF DISTINCTION',
  address: '67 Avenue, India', // TODO: full project address
}

// The five menu items, in display order. `icon` maps to a name in
// components/site/NavIcon.jsx (the bottom pill dock).
export const NAV_MENU = [
  { label: 'Home', to: '/', icon: 'home' },
  { label: 'Location', to: '/location', icon: 'pin' },
  { label: 'Amenities', to: '/amenities', icon: 'sparkle' },
  { label: 'View/Apartment', to: '/plan', icon: 'grid' },
  // { label: 'Legacy', to: '/legacy', icon: 'medal' },
]

// Neighbouring menu entries for the prev/next pager (wraps around both
// ends: Legacy → Home → Legacy). Unknown paths fall back to Home.
export function getNeighbouringMenu(pathname) {
  const index = NAV_MENU.findIndex((item) => item.to === pathname)
  const current = index === -1 ? 0 : index
  const count = NAV_MENU.length
  return {
    prev: NAV_MENU[(current - 1 + count) % count],
    next: NAV_MENU[(current + 1) % count],
  }
}

export const FOOTER = {
  caption: 'Designed around the view',
  year: 'EST. 2026',
}
