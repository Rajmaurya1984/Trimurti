const ROOT = '/amenitites'

// Estimated camera positions on the full 2471 x 3000 drawing.
// Initial bearings match the visible exterior window walls; fine-tune in Align direction.
const RADAR_POSITIONS = {
  // Lobby is not on this drawing, so it has no map pin or radar.
  'tirmuth-gym': { left: 50, top: 23 },
  'tirmuth-indoor-games': { left: 30, top: 49 },
  'tirmuth-multipurpose-hall': { left: 57, top: 79 },
  'tirmuth-childrens-play-area': { left: 71, top: 49 },
}

// Panorama U grows clockwise. Bearings are clockwise from the top of the plan.
// Gym north windows U=.15; games west windows U=.25;
// hall south windows U=.25; play-area east windows U=.50.
const RADAR_OFFSETS = {
  'tirmuth-gym': -54,
  'tirmuth-indoor-games': 180,
  'tirmuth-multipurpose-hall': 90,
  'tirmuth-childrens-play-area': -90,
}
// Filenames match the supplied Tirmuth panoramas in public/amenitites.
export const TIRMUTH_AMENITY_SCENES = [
  ['tirmuth-lobby', 'Lobby', 'lobby.jpg'],
  ['tirmuth-gym', 'Gym', 'gym_360.jpg'],
  ['tirmuth-indoor-games', 'Indoor Games', 'indoorGame_360.jpg'],
  ['tirmuth-multipurpose-hall', 'Multipurpose Hall', 'multipurposeHall.jpg'],
  ['tirmuth-childrens-play-area', "Children's Play Area", 'childrensPlayArea.jpg'],
].map(([id, name, filename]) => ({
  id, name, image: ROOT + '/' + filename,
  cameraPosition: RADAR_POSITIONS[id], radarHeadingOffset: RADAR_OFFSETS[id],
  arrivalU: .5, arrivalPitch: 0, arrivalImmediate: true,
}))