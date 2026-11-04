 import { AMENITY_OVERVIEW } from './amenityTour.js'
import { assetUrl } from '../lib/utils.js'

// Navigation and prefetching share the same imports and in-flight requests.
const pageImports = {
  '/': () => import('../pages/Home.jsx'),
  '/location': () => import('../pages/Location.jsx'),
  '/plan': () => import('../pages/Plan.jsx'),
  '/legacy': () => import('../pages/Legacy.jsx'),
  '/amenities/interior': () => import('../pages/InteriorAmenities.jsx'),
}
const pageImages = {
  '/amenities': AMENITY_OVERVIEW,
}
const modules = new Map()
const images = new Map()

export function loadPage(path) {
  if (!modules.has(path)) {
    const request = pageImports[path]().catch((error) => {
      modules.delete(path)
      throw error
    })
    modules.set(path, request)
  }
  return modules.get(path)
}

export function preloadPage(path) {
  if (path !== '/amenities') return
  const source = pageImages[path]
  if (!source || images.has(path)) return
  const image = new Image()
  image.decoding = 'async'
  image.fetchPriority = 'high'
  images.set(path, image)
  image.src = assetUrl(source)
  void image.decode().catch(() => { images.delete(path) })
}
