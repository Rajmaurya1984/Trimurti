import { loadWindowTexture } from '../components/window-view/windowTextures.js'

// Reuse the texture promises when Location mounts; reveal only after decoding.
export function prepareLocation() {
  return Promise.all([
    import('../pages/Location.jsx'),
    loadWindowTexture('/Location.webp'),
    loadWindowTexture('/groundFloorPlan.png'),
  ])
}