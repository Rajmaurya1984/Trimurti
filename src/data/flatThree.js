const ROOT = '/assets/plan/2bhk/Flat_No_03_'
// Open every room at the panorama controls' widest field of view.
export const FLAT_THREE_DEFAULT_FOV = 95
// Each panorama has its own azimuth. Anchor a visible feature to a plan axis:
// u is its horizontal position in the original equirectangular image (0..1),
// heading is clockwise from the top of the plan. These are visual calibrations.
export const FLAT_THREE_RADAR_ANCHORS = {
  living: { u: .467, heading: 0 }, // Balcony, above the living room.
  balcony: { u: .3, heading: 0 }, // Outdoor view, above the living room on the plan.
  passage: { u: .5, heading: 180 }, // Kitchen opening, below the passage.
  kitchen: { u: .54, heading: 180 }, // Hob on the bottom wall.
  'bedroom-1': { u: .714, heading: 0 }, // Window on the top wall.
  'bedroom-2': { u: .456, heading: 0 }, // Window on the top wall.
  'bathroom-1': { u: .845, heading: 0 }, // Door back toward Bedroom 1.
  'bathroom-2': { u: 0, heading: 270 }, // Door back toward Bedroom 2.
}

export function flatThreeRadarHeading(direction, roomId) {
  const anchor = FLAT_THREE_RADAR_ANCHORS[roomId]
  // SphereGeometry with scale [-1, 1, 1] maps texture u to world
  // (cos(2πu), sin(2πu)) in the X/Z plane.
  const azimuth = Math.atan2(direction.z, direction.x) * 180 / Math.PI
  return ((anchor.heading + azimuth - anchor.u * 360) % 360 + 360) % 360
}

// Estimated panorama capture points on the Flat 03 crop, in percentages.
// Calibrate these against the original render-camera coordinates when available.
// Looking around rotates the cone; a panorama's capture point stays fixed.
export const FLAT_THREE_CAMERA_POSITIONS = {
  living: { left: 86, top: 86 },
  balcony: { left: 76, top: 19 }, // Estimated capture point on the balcony.
  passage: { left: 59, top: 61 },
  kitchen: { left: 43, top: 69 },
  'bedroom-1': { left: 21, top: 52 },
  'bedroom-2': { left: 48, top: 48 },
  'bathroom-1': { left: 14, top: 66 },
  'bathroom-2': { left: 57, top: 42 },
}  
// Room-selection points on the Flat 03 crop, measured from its top-left.
export const FLAT_THREE_ROOMS = [
  { id: 'living', name: 'Living Room', file: 'Living Room', left: 86, top: 86 },
  { id: 'balcony', name: 'Balcony View', image: '/assets/plan/2bhk/Flat_No_03_Living Room_Balcony.jpg', left: 76, top: 19 },
  { id: 'passage', name: 'Living Passage', file: 'Living Passage', left: 59, top: 61 },
  { id: 'kitchen', name: 'Kitchen', file: 'Kitchen', left: 43, top: 65 },
  { id: 'bedroom-1', name: 'Bedroom 1', file: 'M_Bedroom_01', left: 21, top: 52 },
  { id: 'bedroom-2', name: 'Bedroom 2', file: 'M_Bedroom_02', left: 48, top: 48 },
  { id: 'bathroom-1', name: 'Bathroom 1', file: 'M_Toilet_01', left: 14, top: 66 },
  { id: 'bathroom-2', name: 'Bathroom 2', file: 'M_Toilet_02', left: 57, top: 42 },
].map((room) => ({
  ...room,
  image: room.image ?? `${ROOT}${room.file}.jpg`,
  cameraPosition: FLAT_THREE_CAMERA_POSITIONS[room.id],
  // Face the main room feature on arrival; bathrooms face their basin.
  arrivalU: room.id.startsWith('bathroom') ? .5 : FLAT_THREE_RADAR_ANCHORS[room.id].u,
  // Set the destination heading before the crossfade, without a sideways sweep.
  arrivalImmediate: true,
  arrivalFov: FLAT_THREE_DEFAULT_FOV,
}))

// The tour opens here: selecting "Flat no 3" on the Plan page loads this
// panorama immediately, with no introduction screen in between.
export const FLAT_THREE_OPENING_ROOM = FLAT_THREE_ROOMS[0]
