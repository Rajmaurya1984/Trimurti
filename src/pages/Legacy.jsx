import SiteHeader from '../components/site/SiteHeader.jsx'
import SiteFooter from '../components/site/SiteFooter.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import { LEGACY_INTRO, LEGACY_TIMELINE, LEGACY_CLOSING } from '../data/legacy.js'
import './Editorial.css'
import './Legacy.css'

export default function Legacy() {
  return (
    <main className="editorial-page">
      <SiteHeader />
      <div className="editorial-page__body">
        <SectionHeading
          eyebrow={LEGACY_INTRO.eyebrow}
          headline={LEGACY_INTRO.headline}
          intro={LEGACY_INTRO.intro}
        />

        <section className="legacy-timeline" aria-label="Project history">
          {LEGACY_TIMELINE.map((entry) => (
            <article className="legacy-entry" key={entry.year}>
              <p className="legacy-entry__year">{entry.year}</p>
              <div className="legacy-entry__body">
                <h2>{entry.title}</h2>
                <p>{entry.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="legacy-closing">
          <h2>{LEGACY_CLOSING.headline}</h2>
          <p>{LEGACY_CLOSING.body}</p>
        </section>
      </div>
      <SiteFooter />
    </main>
  )
}