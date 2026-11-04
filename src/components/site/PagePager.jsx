import { preparePageTransition } from './pageTransition.js'
import { Link, useLocation } from 'react-router-dom'
import { getNeighbouringMenu } from '../../data/site.js'
import NavIcon from './NavIcon.jsx'
import { preloadPage } from '../../data/pageLoading.js'

// Prev/next page pager, rendered on every page by SiteHeader. Buttons sit
// at the left/right screen edges (above the dock on phones) and cycle
// through NAV_MENU with wrap-around. Styling lives in SiteChrome.css.
export default function PagePager() {
  const { pathname } = useLocation()
  const { prev, next } = getNeighbouringMenu(pathname)

  return (
    <div className="page-pager">
      <Link viewTransition
        className="page-pager__btn page-pager__btn--prev"
        to={prev.to}
        onPointerEnter={() => preloadPage(prev.to)}
        onFocus={() => preloadPage(prev.to)}
        onTouchStart={() => preloadPage(prev.to)}
        onClick={(event) => preparePageTransition(event, pathname, prev.to, 'back')}
        aria-label={`Previous: ${prev.label}`}
      >
        <NavIcon name="chevron-left" />
      </Link>
      <Link viewTransition
        className="page-pager__btn page-pager__btn--next"
        to={next.to}
        onPointerEnter={() => preloadPage(next.to)}
        onFocus={() => preloadPage(next.to)}
        onTouchStart={() => preloadPage(next.to)}
        onClick={(event) => preparePageTransition(event, pathname, next.to, 'forward')}
        aria-label={`Next: ${next.label}`}
      >
        <NavIcon name="chevron-right" />
      </Link>
    </div>
  )
}
