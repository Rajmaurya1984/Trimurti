import * as THREE from 'three'
import { DEFAULT_VIEW_ID, WINDOW_VIEW_FLOORS, getWindowViewAssets } from '../../data/windowView.js'
import { assetUrl } from '../../lib/utils.js'

// Cache promises too: a click shares any request already warming in the background.
const textures = new Map()
const decoded = new Map()
export const getWindowTexture = (path) => decoded.get(assetUrl(path))
export function loadWindowTexture(path) {
  const url = assetUrl(path)
  if (textures.has(url)) return textures.get(url)
  const pending = new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = false
      texture.minFilter = THREE.LinearFilter
      decoded.set(url, texture)
      resolve(texture)
    }, undefined, reject)
  }).catch((error) => {
    textures.delete(url)
    throw error
  })
  textures.set(url, pending)
  return pending
}

// Warm only the opening view; other floors load when selected or hovered.
export async function warmWindowPreviews(isCancelled, direction) {
  if (!direction || isCancelled()) return
  const floor = WINDOW_VIEW_FLOORS.find(({ id }) => id === DEFAULT_VIEW_ID)
  const assets = getWindowViewAssets(floor, 'day', direction)
  if (!assets) return
  try { await loadWindowTexture(assets.preview) } catch { /* Retry on selection. */ }
}

