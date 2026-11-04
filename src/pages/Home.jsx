import SiteHeader from '../components/site/SiteHeader.jsx'
import TowerOrbit from '../components/tower-orbit/TowerOrbit.jsx'
import { TOWER_SEQUENCE } from '../components/tower-orbit/towerFrames.js'
import './Home.css'

// Home: the full-bleed interactive tower (drag to rotate). Frames are
// preloaded by TowerOrbit from public/assets/tower.
// The hero copy, highlights and footer are switched off for now — to bring
// one back, uncomment the block AND its imports (Link, SiteFooter and the
// data/home.js values).
export default function Home() {
  return (
    <main className="home-page">
      <div className="home-page__stage">
        <TowerOrbit sequence={TOWER_SEQUENCE} />
      </div>
      <div className="home-page__vignette" aria-hidden="true" />

      {/*
      <section className="home-hero" id="home">
        <p className="home-hero__eyebrow">
          <i aria-hidden="true" />
          {HOME_HERO.eyebrow}
        </p>
        <h1>
          {HOME_HERO.headline[0]}
          <br />
          <em>{HOME_HERO.headline[1]}</em>
        </h1>
        <p className="home-hero__intro">{HOME_HERO.intro}</p>
        <Link className="home-hero__cta" to={HOME_HERO.cta.to}>
          {HOME_HERO.cta.label}&nbsp;&nbsp;→
        </Link>
      </section>

      <ul className="home-highlights" aria-label="Project highlights">
        {HOME_HIGHLIGHTS.map((item) => (
          <li key={item.label}>
            <b>{item.value}</b>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      */}

      <SiteHeader />
      {/* <SiteFooter caption={HOME_FOOTER_CAPTION} /> */}
    </main>
  )
}
