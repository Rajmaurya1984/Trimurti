import { NAV_MENU } from '../../data/site.js'

// Runs before React Router captures the outgoing page. Arrow direction is
// explicit so wrapping from Home to Legacy still moves to the previous page.
export function preparePageTransition(event, from, to, direction) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (from === to) {
    event.preventDefault()
    return
  }
  const current = NAV_MENU.findIndex((item) => item.to === from)
  const target = NAV_MENU.findIndex((item) => item.to === to)
  const backwards = direction ? direction === 'back' : current >= 0 && target >= 0 && target < current
  document.documentElement.classList.toggle('back-transition', backwards)
}