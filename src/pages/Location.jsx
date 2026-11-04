import SiteHeader from '../components/site/SiteHeader.jsx'
import LandmarkPanorama from '../components/location-map/LandMark/LandMarkPanaroma.jsx'
import './Editorial.css'
import './Location.css'

// Set it to true when authoring landmark coordinates.
const placementMode = false;

export default function Location() {
  return (
    <main className="editorial-page editorial-page--panorama">
      <SiteHeader />
      <LandmarkPanorama placementMode={placementMode} />
    </main>
  )
}
