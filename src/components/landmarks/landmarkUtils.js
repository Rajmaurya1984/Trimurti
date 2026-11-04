// Shared landmark helpers — pure, UI-free, reusable on any page.
// Moved out of LandMarkPanaroma.jsx so every panorama / map can share them.

const DRIVE_TIME_PATTERN = /^(.*?)\s*(\d+)\s*(?:MIN|MINS)\b\.?$/i

// Client titles carry drive time inline ("... 7 MINS"). Split into place name
// + badge ("7 min") for even legend / popup rendering.
export function splitLandmarkTitle(title) {
  const clean = String(title ?? '').trim()
  const match = DRIVE_TIME_PATTERN.exec(clean)
  if (!match) return { name: clean, meta: '' }
  return { name: match[1].trim(), meta: `${match[2]} min` }
}

// Authoring placeholders ("Edit description here", or title repeated) are not
// worth showing in the popup.
export function landmarkDetail(landmark) {
  const detail = String(landmark?.description ?? '').trim()
  const title = String(landmark?.title ?? '').trim()
  if (!detail || detail === 'Edit description here') return ''
  return detail.toLowerCase() === title.toLowerCase() ? '' : detail
}

// Landmarks waiting to be placed keep their place in the category list/count,
// but never get a dot.
export const isMapped = (landmark) => Array.isArray(landmark?.position)

/** How many landmarks each category holds, keyed by category id. */
export const countByCategory = (landmarks = []) =>
  landmarks.reduce((counts, landmark) => {
    counts[landmark.category] = (counts[landmark.category] ?? 0) + 1
    return counts
  }, {})

/** Filter helper shared by every page: 'all' or one category id. */
export function filterByCategory(landmarks = [], category = 'all') {
  if (category === 'all') return landmarks
  return landmarks.filter((landmark) => landmark.category === category)
}
