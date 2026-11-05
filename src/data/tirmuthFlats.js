import { FLAT_2_HOTSPOTS, FLAT_6_HOTSPOTS } from './tirmuthHotspots.js'
// Positions use the original panorama's [x, y, z] coordinates.
// Floor-plan cameraPosition uses { left, top } percentages of the full drawing.
// now the issue is the image of master bedroom 1 and master bedroom2 
// Initial room centers are estimated from the supplied drawing; refine with authored pointers.
export const TIRMUTH_FLOOR_PLAN = '/flat/10THFLOORPLAN.png'
export const TIRMUTH_DEFAULT_FOV = 95
const definitions = [
  ['living', 'Living Room', 'Living Room'],
  ['passage', 'Living Passage', 'Living Passage'],
  ['kitchen', 'Kitchen', 'Kitchen'],
  ['bedroom', 'Bedroom', 'Bedroom'],
  ['master-bedroom', 'Master Bedroom', 'M_Bedroom'],
  ['master-toilet', 'Master Toilet', 'M_Toilet'],
  ['toilet', 'Common Toilet', 'Toilet'],
]

const mapPositions = {
  2: { living: [10,38], passage: [40,50], kitchen: [49,61], bedroom: [55,72], 'master-bedroom': [37,78], 'master-toilet': [25,65], toilet: [59,90], study: [47,8] },
  6: { living: [17,85], passage: [35,60], kitchen: [42,50], bedroom: [56,48], 'master-bedroom': [76,60], 'master-toilet': [65,70], toilet: [46,74] },
}
// Flat 2 replacement renders use numbered names, including a space in M Bedroom_02.
const FLAT_2_IMAGE_STEMS = {
  bedroom: 'M_Bedroom_01',
  'master-bedroom': 'M Bedroom_02',
  'master-toilet': 'M_Toilet_02',
  toilet: 'M_Toilet_01',
}

const FLAT_2_ROOM_NAMES = {
  bedroom: 'Master Bedroom 2',
  'master-bedroom': 'Master Bedroom 1',
  'master-toilet': 'Common Toilet',
  toilet: 'Master Toilet 2',
}

function makeRooms(number, area, study = false) {
  const entries = study ? [...definitions, ['study', 'Study Room', 'Study Room']] : definitions
  return entries.map(([id, name, file]) => ({
    id, name: number === 2 ? FLAT_2_ROOM_NAMES[id] ?? name : name,
    image: '/flat/no' + number + '/2BHK_Flat_' + number + '_' + area + ' sqft_' + (number === 2 ? FLAT_2_IMAGE_STEMS[id] ?? file : file) + '.jpg',
    cameraPosition: { left: mapPositions[number][id][0], top: mapPositions[number][id][1] },
    arrivalU: 0.5, arrivalPitch: 0, arrivalImmediate: true,
    arrivalFov: TIRMUTH_DEFAULT_FOV,
  }))
}
export const TIRMUTH_FLATS = [
  {
    mapViewBox: '2630 1050 880 1820', mapAspect: 880 / 1820,
    number: 2, label: 'Flat no 2', configuration: '2 BHK', area: 789,
    rooms: makeRooms(2, 789, true),
    hotspots: FLAT_2_HOTSPOTS,
    landmarks: [],
  },
  {
    mapViewBox: '1120 525 1460 875', mapAspect: 1460 / 875,
    number: 6, label: 'Flat no 6', configuration: '2 BHK', area: 650,
    rooms: makeRooms(6, 650),
    hotspots: FLAT_6_HOTSPOTS,
    landmarks: [],
  },
]
// Add room links to the appropriate hotspots array:
// { id: 'living-to-kitchen', sourceScene: 'living', category: 'kitchen',
//   position: [x, y, z] }
// Add informational landmarks to landmarks:
// { id: 'feature', sourceScene: 'living', title: 'Feature name',
//   description: 'Feature details', position: [x, y, z] }
// Set cameraPosition on each room to place its plan pointer.
// Every panorama has its own native orientation. Align a known doorway bearing
// to the corresponding destination on the map instead of sharing one yaw.
// Reference links can be changed when more precise plan coordinates are authored.
export const RADAR_REFERENCES = {
  living: 'study',
  passage: 'living',
  kitchen: 'living',
  bedroom: 'passage',
  'master-bedroom': 'passage',
  'master-toilet': 'master-bedroom',
  toilet: 'passage',
  study: 'living',
}
export function radarReference(flat, roomId) {
  const links = flat.hotspots.filter(marker => marker.sourceScene === roomId)
  return links.find(marker => marker.category === RADAR_REFERENCES[roomId]) ?? links[0]
}
export function tirmuthRadarHeading(direction, roomId, flat) {
  const nativeHeading = Math.atan2(direction.z, direction.x) * 180 / Math.PI
  if (!flat) return nativeHeading
  const source = flat.rooms.find(room => room.id === roomId)?.cameraPosition
  const reference = radarReference(flat, roomId)
  const destination = flat.rooms.find(room => room.id === reference?.category)?.cameraPosition
  if (!source || !destination || !reference) return nativeHeading
  // Account for the drawing's aspect ratio: percentage deltas alone distort
  // bearings in Flat 2's tall map versus Flat 6's wide map.
  const dx = (destination.left - source.left) * flat.mapAspect
  const dy = destination.top - source.top
  if (Math.hypot(dx, dy) < 1e-6) return nativeHeading
  const mapBearing = Math.atan2(dx, -dy) * 180 / Math.PI
  const doorwayBearing = Math.atan2(reference.position[2], reference.position[0]) * 180 / Math.PI
  return nativeHeading + mapBearing - doorwayBearing
}
