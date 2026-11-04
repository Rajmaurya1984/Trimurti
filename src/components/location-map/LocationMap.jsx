import { LOCATION_MAP_NOTE } from '../../data/location.js'
import './LocationMap.css'

// Map integration point for the Location page. mapbox-gl is already a project
// dependency; wire the live map here once VITE_MAPBOX_TOKEN is set in
// .env.local and SITE coordinates are final (see data/site.js).
export default function LocationMap() {
  return (
    <div className="location-map" role="img" aria-label="Project location map">
      <div className="location-map__grid" aria-hidden="true" />
      <div className="location-map__pin" aria-hidden="true">
        <span>67</span>
      </div>
      <p className="location-map__note">{LOCATION_MAP_NOTE}</p>
    </div>
  )
}