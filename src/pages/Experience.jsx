import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/site/SiteHeader.jsx'
import { PROJECT } from '../data/project.js'
const Location = lazy(() => import('./Location.jsx'))
const Plan = lazy(() => import('./Plan.jsx'))
const Amenities = lazy(() => import('./Amenities.jsx'))
const copy = {
  location: ['01', 'A place for every connection.', 'Explore the neighbourhood', 'Your world, closer to home.'],
  windowview: ['02', 'A new point of view.', 'Discover your outlook', 'A different perspective, in every direction.'],
  flat: ['03', 'Room for your kind of life.', 'Step inside your home', 'Thoughtfully composed. Personally yours.'],
  amenities: ['04', 'Make time for more.', 'Discover the everyday', 'Spaces to pause, connect and come alive.'],
}
export default function Experience({ kind }) {
  const [number, title, eyebrow, subtitle] = copy[kind]
  if (PROJECT.ready[kind]) {
    return <Suspense fallback={<main className="tm-placeholder" role="status">Opening your view…</main>}>
      {kind === 'location' ? <Location /> : kind === 'windowview' ? <Plan /> : kind === 'amenities' ? <Amenities /> :
        <Plan />}
    </Suspense>
  }
  return <main className={'tm-experience tm-experience--' + kind}><SiteHeader /><section className="tm-placeholder">
    <div className="tm-preview"><span aria-hidden="true">[</span><p>Your {kind === 'windowview' ? 'window view' : kind} experience<br /><small>Coming into view</small></p><span aria-hidden="true">]</span></div>
    <Link className="tm-cta" to="/">BACK TO HOME <span aria-hidden="true">&#8599;</span></Link>
  </section></main>
}




