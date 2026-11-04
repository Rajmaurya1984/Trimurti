import './SectionHeading.css'

// Standard intro block for editorial pages: eyebrow, display heading and a
// short lead paragraph.
export default function SectionHeading({ eyebrow, headline, intro }) {
  return (
    <section className="section-heading">
      <div className="section-heading__main">
        <p className="section-heading__eyebrow">{eyebrow}</p>
        <h1>
          {headline[0]}
          <br />
          <em>{headline[1]}</em>
        </h1>
      </div>
      <p className="section-heading__intro">{intro}</p>
    </section>
  )
}