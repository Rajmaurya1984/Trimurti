const ROOT = '/assets/amenities'
// Updated renders have fresh previews and thumbnails generated from the new images.
const UPDATED_SCENES = new Set(['yoga', 'walking-3', 'stargazing', 'swings',
  'screening', 'terrace-2', 'terrace-1', 'kids', 'gazebo', 'ludo', 'walking-2'])
const IMAGE_REVISION = '20261005-1'
export const AMENITY_OVERVIEW = `${ROOT}/optimized/overview-display.webp`

// Feature centres measured on the current renders, as image x / image width. 
// Mirrored SphereGeometry maps u to (cos(2πu), 0, sin(2πu)).
export const AMENITY_ARRIVAL_U = {
  yoga: .535, 'walking-3': .49, 'walking-4': .49, 'walking-1': .5,
  'walking-5': .06, stargazing: .51, screening: .51,
  'terrace-2': .625, 'terrace-1': .555, kids: .485, 'kids-2': .79,
  'gazebo-2': .94, gazebo: .515, ludo: .535, 'walking-2': .49, swings: .485,
}

// Degrees above/below the horizon. Ground features need a downward arrival tilt.
export const AMENITY_ARRIVAL_PITCH = {
  yoga: -18, 'walking-3': -12, 'walking-2': -12,
  stargazing: -12, screening: -8, swings: -12,
  'terrace-2': -22, 'terrace-1': -15, kids: -12,
  gazebo: -18, ludo: -27,
}

// Numbered views correspond to the supplied camera renders. The overview uses
// one rooftop entry point rather than inventing precise camera coordinates.
export const AMENITY_SCENES = [
  ['yoga', 'Yoga Deck', 'cam01_yogaDeck.webp'],
  ['walking-3', 'Walking Space 3', 'cam02_walkingSpace.webp'],
  ['walking-4', 'Walking Space 2', 'cam03_walkingSpace.webp'],
  ['walking-1', 'Walking Space 1', 'cam04_walkingSpace.webp'],
  ['walking-5', 'Walking Space 5', 'cam05_walkingSpace.webp'],
  ['stargazing', 'Stargazing Deck', 'cam06_starGazingDeck.webp'],
  ['screening', 'Outdoor Screening Space', 'cam07_outdoorScreeningSpace.webp'],
  ['terrace-2', 'Terrace Seating 2', 'cam08_terraceSeating.webp'],
  ['terrace-1', 'Terrace Seating 1', 'cam09_terraceSeating.webp'],
  ['kids', "Kids' Play Area", 'cam10_kidsPlayArea.webp'],
  ['kids-2', "Kids' Play Area 2", 'cam11_kidsPlayArea.webp'],
  ['gazebo-2', 'Gazebo Seating 2', 'cam12_gazeboSeating.webp'],
  ['gazebo', 'Gazebo Seating', 'cam13_gazeboSeating.webp'],
  ['ludo', 'Life-size Ludo', 'cam14_lifeSizeLudo.webp'],
  ['walking-2', 'Walking Space 2', 'cam15_walkingSpace.webp'],
  ['swings', 'Swing Area', 'cam06_swingArea.webp'],
].map(([id, name, filename], index) => ({
  id, name, number: String(index + 1).padStart(2, '0'),
  image: `${ROOT}/${filename}${UPDATED_SCENES.has(id) ? `?v=${IMAGE_REVISION}` : ''}`,
  arrivalU: AMENITY_ARRIVAL_U[id],
  arrivalPitch: AMENITY_ARRIVAL_PITCH[id] ?? 0,
  arrivalImmediate: true,
  thumbnail: `${ROOT}/optimized/${filename.replace('.webp', UPDATED_SCENES.has(id) ? '-thumb.webp' : '-preview.webp')}?v=${IMAGE_REVISION}`,
  preview: `${ROOT}/optimized/${filename.replace('.webp', '-preview.webp')}?v=${IMAGE_REVISION}`,
}))
