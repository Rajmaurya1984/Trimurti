import SmartImage from '../ui/SmartImage.jsx'
import { imagesFor } from '../../data/plan.js'
import { pad } from '../../lib/utils.js'
import './PlanGallery.css'

// Renders the image grid for the selected floor + unit type. Images come from
// the data/plan.js manifest; missing files show a labelled placeholder (see
// SmartImage) so the layout is stable before all renders are delivered.
export default function PlanGallery({ floor, unitType }) {
  const images = imagesFor(floor, unitType)

  if (!images.length) {
    return (
      <div className="plan-gallery plan-gallery--empty">
        <p className="plan-gallery__pending-title">Coming soon</p>
        <p className="plan-gallery__pending-copy">
          {floor.label} · {unitType.toUpperCase()} renders are being prepared.
        </p>
      </div>
    )
  }

  return (
    <div className="plan-gallery">
      <header className="plan-gallery__head">
        <p className="plan-gallery__title">
          {floor.label} · {unitType.toUpperCase()}
        </p>
        <p className="plan-gallery__count">{images.length} VIEWS</p>
      </header>
      <div className="plan-gallery__grid">
        {images.map((src, index) => (
          <figure className="plan-gallery__item" key={src}>
            <SmartImage
              src={src}
              alt={`${floor.label} ${unitType.toUpperCase()} view ${pad(index + 1)}`}
            />
            <figcaption className="plan-gallery__caption">
              {pad(index + 1)}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}